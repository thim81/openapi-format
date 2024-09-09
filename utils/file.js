// utils-file.js

const fs = require('fs');
const yaml = require('@stoplight/yaml');
const http = require('http');
const https = require('https');

/**
 * Converts a string object to a JSON/YAML object.
 * @param str String.
 * @param options Parse options
 * @returns {Promise<*>} Object data.
 */
async function parseString(str, options = {}) {
  // Convert large number value safely before parsing
  const encodedContent = encodeLargeNumbers(str);

  // Default to YAML format
  const toYaml = options.format !== 'json' && (!options.hasOwnProperty('json') || options.json !== true);

  if (toYaml) {
    try {
      const obj = yaml.parse(encodedContent);
      if (typeof obj === 'object') {
        return obj;
      } else {
        return SyntaxError('Invalid YAML');
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

async function isJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

async function isYaml(str) {
  try {
    const rest = yaml.parse(str);
    return typeof rest === 'object';
  } catch (e) {
    return false;
  }
}

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
 * Parse a JSON/YAML file and returns the parsed object
 * @param filePath Path to the JSON/YAML file.
 * @returns {Promise<unknown>} Parsed data object.
 */
async function parseFile(filePath) {
  try {
    const isRemoteFile = filePath.startsWith('http://') || filePath.startsWith('https://');

    const options = {};

    let fileContent;
    if (isRemoteFile) {
      fileContent = await getRemoteFile(filePath);
    } else {
      const isYamlFile = filePath.endsWith('.yaml') || filePath.endsWith('.yml');
      isYamlFile ? (options.format = 'yaml') : (options.format = 'json');
      fileContent = await getLocalFile(filePath);
    }

    // Check JSON or YAML
    await isJSON(fileContent) ? options.format = 'json' : options.format = 'yaml'

    // Encode & Parse file content
    return parseString(fileContent, options);
  } catch (err) {
    throw err;
  }
}

/**
 * Converts an data object to a JSON/YAML string representation.
 * @param obj Data object.
 * @param options Stringify options
 * @returns {Promise<*>} Stringified data.
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

      // Convert Object to YAML string
      output = yaml.safeStringify(obj, yamlOptions);
      output = addQuotesToRefInString(output);

      // Decode large number YAML values safely before writing output
      output = decodeLargeNumbers(output);
    } else {
      // Convert Object to JSON string
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
 * @param filePath Path to the output file.
 * @param data Data object.
 * @param options Write options
 * @returns {Promise<void>}
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

    // Write output file
    fs.writeFileSync(filePath, output, 'utf8');
  } catch (err) {
    console.error('\x1b[31m', `Error writing file "${filePath}": ${err.message}`);
    throw err;
  }
}

/**
 * Reads a local file and returns the content
 * @param filePath Path to the file.
 * @returns {Promise<string>} File content.
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
 * Reads a remote file and returns the content
 * @param filePath Remote path to the file.
 * @returns {Promise<string>} File content.
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
 * @param yamlString YAML string.
 * @returns {*} YAML string with quotes.
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
