const fs = require('fs');
const bundler = require('api-ref-bundler');
const yaml = require('yaml');
const http = require('http');
const https = require('https');
const {dirname} = require('path');

const COMMENT_TYPE = /** @type {const} */ ({
  INLINE_VALUE: 'inlineValue',
  INLINE_KEY: 'inlineKey',
  BEFORE_KEY: 'beforeKey',
  BEFORE_VALUE: 'beforeBlock'
});

const YAML_VALUE_FORMATS_PROP = '__openapiFormatYamlValueFormats';
const YAML_QUOTE_STYLE = /** @type {const} */ ({
  SINGLE: 'single',
  DOUBLE: 'double',
  DETECT: 'detect'
});

/**
 * @typedef {typeof COMMENT_TYPE[keyof typeof COMMENT_TYPE]} CommentType
 */

/**
 * @typedef {Object} Comment
 * @property {string[]} path
 * @property {CommentType} type
 * @property {string} text
 */

/**
 * Walk a parsed YAML Document and extract comments keyed by their property path.
 * @param {import('yaml').Document} doc
 * @returns {Array<{path: string[], type: string, text: string}>}
 */
function extractComments(doc) {
  /** @type {Comment[]} */
  const comments = [];

  yaml.visit(doc, {
    // Comments in YAML are always attached to Pair nodes (key: value entries),
    // so visiting only Pair is sufficient to capture all of them.
    Pair(_, pair, path) {
      if (!pair.key || pair.key.value == null) return;

      const keyPath = [];
      for (const ancestor of path) {
        if (yaml.isPair(ancestor) && ancestor.key?.value != null) {
          keyPath.push(String(ancestor.key.value));
        }
      }
      keyPath.push(String(pair.key.value));

      // inline key comment  (only on null explicit key mapping)
      // ? key # comment
      if (pair.key.comment != null) {
        comments.push({path: keyPath, type: COMMENT_TYPE.INLINE_KEY, text: pair.key.comment});
      }

      // inline value comment
      // key: value # comment
      if (pair.value?.comment != null) {
        comments.push({path: keyPath, type: COMMENT_TYPE.INLINE_VALUE, text: pair.value.comment});
      }

      // comment before a key
      // # comment
      // key: value
      if (pair.key.commentBefore != null) {
        comments.push({path: keyPath, type: COMMENT_TYPE.BEFORE_KEY, text: pair.key.commentBefore});
      }

      // comment before a value
      // key: # comment
      //   value
      if (pair.value?.commentBefore != null) {
        comments.push({path: keyPath, type: COMMENT_TYPE.BEFORE_VALUE, text: pair.value.commentBefore});
      }
    }
  });

  return comments;
}

/**
 * Re-inject comments extracted by extractComments into a new YAML Document,
 * matching nodes by key path.
 * @param {import('yaml').Document} doc
 * @param {Comment[]} comments
 */
function injectComments(doc, comments) {
  for (const {path, type, text} of comments) {
    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1];

    const parentNode = parentPath.length === 0 ? doc.contents : doc.getIn(parentPath, true);

    if (parentNode && yaml.isMap(parentNode)) {
      const pair = parentNode.items.find(p => p.key && String(p.key.value) === key);
      if (pair) {
        switch (type) {
          case COMMENT_TYPE.BEFORE_KEY:
            pair.key.commentBefore = text;
            break;
          case COMMENT_TYPE.BEFORE_VALUE:
            pair.value.commentBefore = text;
            break;
          case COMMENT_TYPE.INLINE_KEY:
            pair.key.comment = text;
            break;
          case COMMENT_TYPE.INLINE_VALUE:
            pair.value.comment = text;
            break;
        }
      }
    }
  }
}

/**
 * Detect the dominant quote style from a parsed YAML document.
 * @param {import('yaml').Document} doc
 * @returns {{style: 'single' | 'double', hasQuotedScalars: boolean}}
 */
function detectYamlQuoteStyle(doc) {
  let singleQuotes = 0;
  let doubleQuotes = 0;

  yaml.visit(doc, {
    Scalar(_, node) {
      if (node.type === 'QUOTE_SINGLE') {
        singleQuotes += 1;
      }

      if (node.type === 'QUOTE_DOUBLE') {
        doubleQuotes += 1;
      }
    }
  });

  return {
    style: doubleQuotes > singleQuotes ? YAML_QUOTE_STYLE.DOUBLE : YAML_QUOTE_STYLE.SINGLE,
    hasQuotedScalars: singleQuotes + doubleQuotes > 0
  };
}

/**
 * Resolve the configured YAML quote style to an explicit mode.
 * @param {object} [options]
 * @returns {'single' | 'double'}
 */
function resolveYamlQuoteStyle(options = {}) {
  const configuredQuoteStyle = options.yamlQuoteStyle || YAML_QUOTE_STYLE.DETECT;

  if (configuredQuoteStyle === YAML_QUOTE_STYLE.DOUBLE) {
    return YAML_QUOTE_STYLE.DOUBLE;
  }

  if (configuredQuoteStyle === YAML_QUOTE_STYLE.DETECT) {
    return options.detectedYamlQuoteStyle || YAML_QUOTE_STYLE.SINGLE;
  }

  return YAML_QUOTE_STYLE.SINGLE;
}

/**
 * Build YAML stringify/toString options, including quote-style control.
 * @param {number} lineWidth
 * @param {object} [options]
 * @returns {{lineWidth: number, singleQuote: boolean}}
 */
function buildYamlStringifyOptions(lineWidth, options = {}) {
  const style = resolveYamlQuoteStyle(options);
  return {
    lineWidth,
    singleQuote: style !== YAML_QUOTE_STYLE.DOUBLE
  };
}

/**
 * Extract YAML parse metadata that later stringify steps rely on.
 * @param {import('yaml').Document} doc
 * @param {object} [options]
 */
function applyYamlParseMetadata(doc, options = {}) {
  const configuredQuoteStyle = options.yamlQuoteStyle || YAML_QUOTE_STYLE.DETECT;

  if (options?.keepComments) {
    options.yamlComments = extractComments(doc);
  }

  options.yamlValueFormats = extractYamlValueFormats(doc);

  if (configuredQuoteStyle === YAML_QUOTE_STYLE.DETECT) {
    const detectedQuoteStyle = detectYamlQuoteStyle(doc);
    options.detectedYamlQuoteStyle = detectedQuoteStyle.style;
    options.detectedYamlQuoteStyleHasQuotedScalars = detectedQuoteStyle.hasQuotedScalars;
  }
}

/**
 * Converts a string object to a JSON/YAML object.
 * @param {string} str - The input string to be parsed (either JSON or YAML).
 * @param {object} options - Options to define the parsing behavior (e.g., keeping comments).
 * @returns {Promise<object>} Parsed data object.
 */
async function parseString(str, options = {}) {
  // Exit early
  if (str.length === 0) {
    return str;
  }

  // Convert large number values safely before parsing
  let encodedContent = encodeLargeNumbers(str);
  encodedContent = addQuotesToRefInString(encodedContent);

  // Default to YAML format unless specified as JSON
  const toYaml = options.format !== 'json' && (!options.hasOwnProperty('json') || options.json !== true);

  if (toYaml) {
    try {
      const doc = yaml.parseDocument(encodedContent);
      applyYamlParseMetadata(doc, options);
      const obj = doc.toJS();
      if (typeof obj === 'object') {
        return obj;
      } else {
        throw new SyntaxError('Invalid YAML');
      }
    } catch (yamlError) {
      return yamlError;
    }
  } else {
    try {
      // Try parsing as JSON
      return JSON.parse(encodedContent);
    } catch (jsonError) {
      return jsonError;
    }
  }
}

/**
 * Checks if a given string is valid JSON.
 * @param {string} str - The input string to check.
 * @returns {Promise<boolean>} True if the string is valid JSON, false otherwise.
 */
async function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Checks if a given string is valid YAML.
 * @param {string} str - The input string to check.
 * @returns {Promise<boolean>} True if the string is valid YAML, false otherwise.
 */
async function isYaml(str) {
  try {
    const rest = yaml.parse(str);
    return typeof rest === 'object';
  } catch (e) {
    return false;
  }
}

/**
 * Detects the format of a given string (either JSON or YAML).
 * @param {string} str - The input string to check.
 * @returns {Promise<string>} "json", "yaml", or "unknown" based on the detected format.
 */
async function detectFormat(str) {
  if ((await isJSON(str)) !== false) {
    return 'json';
  } else if ((await isYaml(str)) !== false) {
    return 'yaml';
  } else {
    return 'unknown';
  }
}

/**
 * Reads a file (local or remote) and returns its content as a string.
 * @param {string} filePath - The path to the file (local or URL).
 * @param {object} options - Parse file options (e.g., format detection).
 * @returns {Promise<string>} The content of the file as a string.
 */
async function readFile(filePath, options) {
  try {
    const isRemoteFile = filePath.startsWith('http://') || filePath.startsWith('https://');

    let fileContent;
    if (isRemoteFile) {
      fileContent = await getRemoteFile(filePath);
    } else {
      const isYamlFile = filePath.endsWith('.yaml') || filePath.endsWith('.yml');
      isYamlFile ? (options.format = 'yaml') : (options.format = 'json');
      fileContent = await getLocalFile(filePath);
    }

    // Check JSON or YAML
    (await isJSON(fileContent)) ? (options.format = 'json') : (options.format = 'yaml');
    return fileContent;
  } catch (err) {
    throw err;
  }
}

/**
 * Parses a JSON/YAML file and returns the parsed object
 * @param {string} filePath - The path to the JSON/YAML file.
 * @param {object} options - Parse file options (e.g., reference resolution hooks).
 * @returns {Promise<object>} Parsed data object with references resolved, if any.
 */
async function parseFile(filePath, options = {}) {
  try {
    // Read local or remote file content and get format JSON or YAML
    let rawContent = await readFile(filePath, options);

    if (options.format === 'yaml') {
      const encodedContent = addQuotesToRefInString(encodeLargeNumbers(rawContent));
      const doc = yaml.parseDocument(encodedContent);
      applyYamlParseMetadata(doc, options);
    }

    if (rawContent.includes('$ref') && options.bundle === true) {
      // Handler to Resolve references
      const resolver = async sourcePath => {
        let refContent = await readFile(sourcePath, options);
        const refOptions = {...options, yamlValueFormats: {}};
        const parsedRefContent = await parseString(refContent, refOptions);
        if (parsedRefContent instanceof Error) {
          return parsedRefContent;
        }

        return applyYamlValueFormatsMetadata(parsedRefContent, refOptions.yamlValueFormats || {});
      };

      const onErrorHook = msg => {
        throw new Error(msg);
      };

      // Use the bundler to resolve external refs and bundle the document
      const bundled = await bundler.bundle(filePath, resolver, {ignoreSibling: false, hooks: {onError: onErrorHook}});
      options.yamlValueFormats = collectYamlValueFormatsFromBundledTree(bundled);
      return bundled;
    }

    // Parse file content as JSON/YAML
    return await parseString(rawContent, options);
  } catch (err) {
    throw err;
  }
}

/**
 * Converts a data object to a JSON/YAML string representation.
 * @param {object} obj - The data object to stringify.
 * @param {object} options - Stringify options (e.g., line width, format).
 * @returns {Promise<string>} The object as a string in JSON/YAML format.
 */
async function stringify(obj, options = {}) {
  try {
    let output;
    // Default to YAML format
    const toYaml = options.format !== 'json' && (!options.hasOwnProperty('json') || options.json !== true);

    if (toYaml) {
      const lineWidth = (options.lineWidth && options.lineWidth === -1 ? 0 : options.lineWidth) || 0;
      const yamlStringifyOptions = buildYamlStringifyOptions(lineWidth, options);

      // Convert object to YAML string
      output = yaml.stringify(obj, yamlStringifyOptions);

      if (
        (options?.yamlComments?.length > 0 && options?.keepComments === true) ||
        (options?.yamlValueFormats && Object.keys(options.yamlValueFormats).length > 0)
      ) {
        const newDoc = yaml.parseDocument(output);
        applyYamlValueFormats(newDoc, options.yamlValueFormats || {});
        if (options?.yamlComments?.length > 0 && options?.keepComments === true) {
          injectComments(newDoc, options.yamlComments);
        }
        output = newDoc.toString(yamlStringifyOptions);
      }

      // Decode large number YAML values safely before writing output
      output = decodeLargeNumbers(output);
    } else {
      // Convert object to JSON string
      output = JSON.stringify(obj, null, 2);

      // Decode large number JSON values safely before writing output
      output = decodeLargeNumbers(output, true);
    }

    // Return the stringify output
    return output;
  } catch (err) {
    // Handle errors or rethrow
    throw err;
  }
}

/**
 * Writes an object to a JSON/YAML file.
 * @param {string} filePath - The path to the output file.
 * @param {object} data - The data object to write.
 * @param {object} options - Write options (e.g., format).
 * @returns {Promise<void>} Resolves when the file is written successfully.
 */
async function writeFile(filePath, data, options = {}) {
  try {
    let output;
    const isYamlFile = filePath.endsWith('.yaml') || filePath.endsWith('.yml');

    if (isYamlFile) {
      // Convert Object to YAML string
      options.format = 'yaml';
      output = await stringify(data, options);
    } else {
      // Convert Object to JSON string
      options.format = 'json';
      output = await stringify(data, options);
    }

    const dir = dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }

    // Write the output to the file
    fs.writeFileSync(filePath, output, 'utf8');
  } catch (err) {
    console.error('\x1b[31m', `Error writing file "${filePath}": ${err.message}`);
    throw err;
  }
}

/**
 * Reads a local file and returns the content.
 * @param {string} filePath - The path to the local file.
 * @returns {Promise<string>} The content of the file as a string.
 */
async function getLocalFile(filePath) {
  try {
    const inputContent = fs.readFileSync(filePath, 'utf8');
    return inputContent;
  } catch (err) {
    throw err;
    // throw new Error(`Input file error - Failed to read file: ${filePath}`);
  }
}

/**
 * Reads a remote file and returns the content.
 * @param {string} filePath - The URL to the remote file.
 * @returns {Promise<string>} The content of the remote file as a string.
 */
async function getRemoteFile(filePath) {
  const protocol = filePath.startsWith('https://') ? https : http;

  const inputContent = await new Promise((resolve, reject) => {
    protocol.get(filePath, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      }
      const chunks = [];
      res.on('data', chunk => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
      res.on('error', err => {
        reject(new Error(`${err.message}`));
      });
    });
  });
  return inputContent;
}

/**
 * Convert large number value safely before parsing
 * @param inputContent Input content.
 * @returns {*} Encoded content.
 */
function encodeLargeNumbers(inputContent) {
  // Convert large number value safely before parsing
  const regexEncodeLargeNumber = /: ([0-9]+(\.[0-9]+)?)(?!\.[0-9])(,(?!\s*[0-9])|\n)/g; // match > : 123456789.123456789
  return inputContent.replace(regexEncodeLargeNumber, rawInput => {
    const endChar = rawInput.endsWith(',') ? ',' : '\n';
    const rgx = new RegExp(endChar, 'g');
    const number = rawInput.replace(/: /g, '').replace(rgx, '');
    // Handle large numbers safely in javascript
    if (Number(number).toString().includes('e') || number.replace('.', '').length > 15) {
      return `: "${number}==="${endChar}`;
    } else {
      return `: ${number}${endChar}`;
    }
  });
}

/**
 * Extract YAML scalar formatting metadata that needs to be preserved when
 * writing output.
 * @param {import('yaml').Document} doc
 * @returns {Record<string, number>}
 */
function extractYamlValueFormats(doc) {
  /** @type {Record<string, number>} */
  const formats = {};

  yaml.visit(doc, {
    Pair(_, pair, path) {
      if (!pair.key || pair.key.value == null || pair.value == null) return;
      if (String(pair.key.value) !== 'x-version') return;

      const keyPath = buildYamlValueFormatPath(path, String(pair.key.value));

      const rawSource = pair.value?.source;
      if (typeof rawSource !== 'string') return;

      const fractionDigits = getFractionDigits(rawSource);
      if (fractionDigits > 0) {
        formats[JSON.stringify(keyPath)] = fractionDigits;
      }
    }
  });

  return formats;
}

/**
 * Attach YAML scalar-format metadata to a parsed node and its descendants.
 * @param {unknown} node
 * @param {Record<string, number>} valueFormats
 * @returns {unknown}
 */
function applyYamlValueFormatsMetadata(node, valueFormats) {
  if (!node || typeof node !== 'object') {
    return node;
  }

  const localValueFormats = valueFormats || {};
  if (Object.keys(localValueFormats).length > 0) {
    Object.defineProperty(node, YAML_VALUE_FORMATS_PROP, {
      value: localValueFormats,
      enumerable: true,
      configurable: true,
      writable: true
    });
  }

  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      applyYamlValueFormatsMetadata(item, prefixYamlValueFormats(localValueFormats, String(index)));
    });
  } else {
    Object.keys(node).forEach(key => {
      if (key === YAML_VALUE_FORMATS_PROP) return;
      applyYamlValueFormatsMetadata(node[key], prefixYamlValueFormats(localValueFormats, key));
    });
  }

  return node;
}

/**
 * Flatten YAML scalar-format metadata from a bundled tree and remove internal markers.
 * @param {unknown} node
 * @param {Record<string, number>} valueFormats
 * @param {Array<string>} path
 * @param {WeakSet<object>} seen
 * @returns {Record<string, number>}
 */
function collectYamlValueFormatsFromBundledTree(node, valueFormats = {}, path = [], seen = new WeakSet()) {
  if (!node || typeof node !== 'object' || seen.has(node)) {
    return valueFormats;
  }

  seen.add(node);

  const localValueFormats = node[YAML_VALUE_FORMATS_PROP];
  if (localValueFormats && typeof localValueFormats === 'object') {
    for (const [jsonPath, fractionDigits] of Object.entries(localValueFormats)) {
      const localPath = JSON.parse(jsonPath);
      const fullPath = [...path, ...localPath];
      valueFormats[JSON.stringify(fullPath)] = fractionDigits;
    }
    delete node[YAML_VALUE_FORMATS_PROP];
  }

  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      collectYamlValueFormatsFromBundledTree(item, valueFormats, [...path, String(index)], seen);
    });
  } else {
    Object.keys(node).forEach(key => {
      if (key === YAML_VALUE_FORMATS_PROP) return;
      collectYamlValueFormatsFromBundledTree(node[key], valueFormats, [...path, key], seen);
    });
  }

  return valueFormats;
}

/**
 * Prefix every YAML scalar-format entry with a key path segment.
 * @param {Record<string, number>} valueFormats
 * @param {string} prefix
 * @returns {Record<string, number>}
 */
function prefixYamlValueFormats(valueFormats, prefix) {
  if (!valueFormats || Object.keys(valueFormats).length === 0) {
    return {};
  }

  const prefixedValueFormats = {};
  for (const [jsonPath, fractionDigits] of Object.entries(valueFormats)) {
    const path = JSON.parse(jsonPath);
    if (path.length === 0) continue;
    if (String(path[0]) !== String(prefix)) continue;

    prefixedValueFormats[JSON.stringify(path.slice(1))] = fractionDigits;
  }

  return prefixedValueFormats;
}

/**
 * Preserve numeric formatting on YAML scalar nodes before stringification.
 * @param {import('yaml').Document} doc
 * @param {Record<string, number>} valueFormats
 */
function applyYamlValueFormats(doc, valueFormats) {
  if (!valueFormats || Object.keys(valueFormats).length === 0) return;

  yaml.visit(doc, {
    Pair(_, pair, path) {
      if (!pair.key || pair.key.value == null || pair.value == null) return;

      const keyPath = buildYamlValueFormatPath(path, String(pair.key.value));

      const fractionDigits = valueFormats[JSON.stringify(keyPath)];
      if (fractionDigits != null && yaml.isScalar(pair.value) && typeof pair.value.value === 'number') {
        pair.value.minFractionDigits = fractionDigits;
      }
    }
  });
}

/**
 * Determine the number of fraction digits in a numeric source string.
 * @param {string} rawSource
 * @returns {number}
 */
function getFractionDigits(rawSource) {
  const decimalIndex = rawSource.indexOf('.');
  if (decimalIndex === -1) return 0;
  const exponentIndex = rawSource.search(/[eE]/);
  const endIndex = exponentIndex === -1 ? rawSource.length : exponentIndex;
  return Math.max(0, endIndex - decimalIndex - 1);
}

/**
 * Build a stable YAML path that includes object keys and array indices.
 * @param {Array<unknown>} path
 * @param {string} leafKey
 * @returns {string[]}
 */
function buildYamlValueFormatPath(path, leafKey) {
  const keyPath = [];

  for (let index = 0; index < path.length; index += 1) {
    const ancestor = path[index];

    if (yaml.isPair(ancestor) && ancestor.key?.value != null) {
      keyPath.push(String(ancestor.key.value));
      continue;
    }

    if (yaml.isSeq(ancestor)) {
      const childNode = path[index + 1];
      const itemIndex = ancestor.items.indexOf(childNode);
      if (itemIndex !== -1) {
        keyPath.push(String(itemIndex));
      }
    }
  }

  keyPath.push(leafKey);
  return keyPath;
}

/**
 * Decode large number YAML/JSON values safely before writing output
 * @param output YAML/JSON Output content.
 * @param isJson Indicate if the output is JSON.
 * @returns {*} Decoded content.
 */
function decodeLargeNumbers(output, isJson = false) {
  if (isJson) {
    // Decode large number JSON values safely before writing output
    const regexDecodeJsonLargeNumber = /: "([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])==="/g; // match > : "123456789.123456789==="
    return output.replace(regexDecodeJsonLargeNumber, strNumber => {
      const number = strNumber.replace(/: "|"/g, '');
      // Decode large numbers safely in javascript
      if (number.endsWith('===') || number.replace('.', '').length > 15) {
        return strNumber.replace('===', '').replace(/"/g, '');
      } else {
        // Keep original number
        return strNumber;
      }
    });
  } else {
    // Decode large number YAML values safely before writing output
    const regexDecodeYamlLargeNumber = /: ([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])===/g; // match > : 123456789.123456789===
    return output.replace(regexDecodeYamlLargeNumber, strNumber => {
      const number = strNumber.replace(/: '|'/g, '');
      // Decode large numbers safely in javascript
      if (number.endsWith('===') || number.replace('.', '').length > 15) {
        return strNumber.replace('===', '').replace(/'/g, '');
      } else {
        // Keep original number
        return strNumber;
      }
    });
  }
}

/**
 * Add quotes to $ref in string
 * @param {string} yamlString - The input YAML string.
 * @returns {string} YAML string with quotes.
 */
function addQuotesToRefInString(yamlString) {
  return yamlString.replace(/(\$ref:\s*)([^"'\s>]+)/g, "$1'$2'");
}

/**
 * Analyze the OpenAPI document.
 * @param {object} oaObj - The OpenAPI document as a JSON object.
 * @returns {{operations: *[], methods: any[], paths: *[], flags: any[], operationIds: *[], flagValues: any[], responseContent: any[], tags: any[]}}
 */
function analyzeOpenApi(oaObj) {
  const flags = new Set();
  const tags = new Set();
  const operationIds = [];
  const paths = [];
  const methods = new Set();
  const operations = [];
  const responseContent = new Set();
  const requestContent = new Set();
  const flagValues = new Set();

  if (oaObj && oaObj.paths) {
    Object.keys(oaObj.paths).forEach(path => {
      paths.push(path);
      const pathItem = oaObj.paths[path];

      if (pathItem && typeof pathItem === 'object') {
        Object.keys(pathItem).forEach(method => {
          methods.add(method.toUpperCase());
          const operation = pathItem[method];
          operations.push(`${method.toUpperCase()}::${path}`);

          if (operation && typeof operation === 'object') {
            if (operation?.tags && Array.isArray(operation.tags)) {
              operation.tags.forEach(tag => {
                if (tag.startsWith('x-')) {
                  flags.add(tag);
                } else {
                  tags.add(tag);
                }
              });
            }

            if (operation?.operationId) {
              operationIds.push(operation.operationId);
            }

            if (operation?.requestBody?.content) {
              Object.keys(operation.requestBody.content).forEach(contentType => {
                requestContent.add(contentType);
              });
            }

            if (operation?.responses) {
              Object.values(operation.responses).forEach(response => {
                if (response?.content) {
                  Object.keys(response.content).forEach(contentType => {
                    responseContent.add(contentType);
                  });
                }
              });
            }

            Object.keys(operation).forEach(key => {
              if (key.startsWith('x-')) {
                flagValues.add(`${key}: ${operation[key]}`);
              }
            });
          }
        });
      }
    });
  }

  return {
    methods: Array.from(methods),
    tags: Array.from(tags),
    operationIds,
    flags: Array.from(flags),
    flagValues: Array.from(flagValues),
    paths,
    operations,
    responseContent: Array.from(responseContent),
    requestContent: Array.from(requestContent)
  };
}

module.exports = {
  readFile,
  parseString,
  parseFile,
  isJSON,
  isYaml,
  detectFormat,
  stringify,
  writeFile,
  encodeLargeNumbers,
  extractYamlValueFormats,
  applyYamlValueFormatsMetadata,
  collectYamlValueFormatsFromBundledTree,
  applyYamlValueFormats,
  prefixYamlValueFormats,
  getFractionDigits,
  decodeLargeNumbers,
  getLocalFile,
  getRemoteFile,
  analyzeOpenApi,
  addQuotesToRefInString
};
