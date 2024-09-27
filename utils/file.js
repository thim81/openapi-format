const fs = require('fs');
const bundler = require('api-ref-bundler');
const yaml = require('@stoplight/yaml');
const http = require('http');
const https = require('https');
const {dirname} = require('node:path');

/**
 * Converts a string object to a JSON/YAML object.
 * @param {string} str - The input string to be parsed (either JSON or YAML).
 * @param {object} options - Options to define the parsing behavior (e.g., keeping comments).
 * @returns {Promise<object>} Parsed data object.
 */
async function parseString(str, options = {}) {
  // Convert large number values safely before parsing
  let encodedContent = encodeLargeNumbers(str);
  encodedContent = addQuotesToRefInString(encodedContent);

  // Default to YAML format unless specified as JSON
  const toYaml = options.format !== 'json' && (!options.hasOwnProperty('json') || options.json !== true);

  if (toYaml) {
    try {
      const result = yaml.parseWithPointers(encodedContent, {attachComments: options?.keepComments || false});
      options.yamlComments = result.comments;
      const obj = result.data;
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

    if (rawContent.includes('$ref') && options.bundle === true) {
      // Handler to Resolve references
      const resolver = async sourcePath => {
        let refContent = await readFile(sourcePath, options);
        return await parseString(refContent, options);
      };

      const onErrorHook = msg => {
        throw new Error(msg);
      };

      // Use the bundler to resolve external refs and bundle the document
      return bundler.bundle(filePath, resolver, {ignoreSibling: false, hooks: {onError: onErrorHook}});
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
      // Set YAML options
      const yamlOptions = {};
      yamlOptions.lineWidth =
        (options.lineWidth && options.lineWidth === -1 ? Infinity : options.lineWidth) || Infinity;

      if (options?.yamlComments && options?.keepComments === true) {
        yamlOptions.comments = options.yamlComments;
      }

      // Convert object to YAML string
      output = yaml.safeStringify(obj, yamlOptions);
      output = addQuotesToRefInString(output);

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
  const regexEncodeLargeNumber = /: ([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])(,|\n)/g; // match > : 123456789.123456789
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
  return yamlString.replace(/(\$ref:\s*)([^"'\s]+)/g, '$1"$2"');
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

      Object.keys(pathItem).forEach(method => {
        methods.add(method.toUpperCase());
        const operation = pathItem[method];
        operations.push(`${method.toUpperCase()}::${path}`);

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
      });
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
  decodeLargeNumbers,
  getLocalFile,
  getRemoteFile,
  analyzeOpenApi,
  addQuotesToRefInString
};
