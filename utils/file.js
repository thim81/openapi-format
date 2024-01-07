// utils-file.js

const fs = require('fs');
const yaml = require('@stoplight/yaml');
const https = require("https");

// Function to parse JSON/YAML file
async function parseFile(filePath) {
  try {
    const isRemoteFile = filePath.startsWith('http://') || filePath.startsWith('https://');
    const isYamlFile = filePath.endsWith('.yaml') || filePath.endsWith('.yml');

    let fileContent;
    if (isRemoteFile) {
      fileContent = await getRemoteFile(filePath);
    } else {
      fileContent = await getLocalFile(filePath);
    }

    // Convert large number value safely before parsing
    const encodedContent = encodeLargeNumbers(fileContent);

    // Parse file content
    return isYamlFile
      ? yaml.parse(encodedContent)
      : JSON.parse(encodedContent);
  } catch (err) {
    // console.error('\x1b[31m', `Error parsing file "${inputFilePath}": ${err.message}`);
    throw err; // Re-throw the error to let the calling code handle it if needed
  }
}

// Function to stringify data to JSON/YAML content
async function stringify(obj, options = {}) {
  try {
    let output;
    // Default to YAML format
    const toYaml = options.format !== 'json' && (!options.hasOwnProperty('json') || options.json !== true);

    if (toYaml) {
      // Convert Object to YAML string
      const lineWidth = (options.lineWidth && options.lineWidth === -1 ? Infinity : options.lineWidth) || Infinity;
      output = yaml.safeStringify(obj, {lineWidth});

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

// Function to write JSON/YAML file
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
    // console.log(`- Output file:\t\t${outputFilePath}`);
  } catch (err) {
    console.log('err', err)
    throw err
    // throw new Error(`Error writing file "${filePath}": ${err.message}`);
  }
}

// Read local file
async function getLocalFile(filePath) {
  try {
    const inputContent = fs.readFileSync(filePath, 'utf8');
    return inputContent
  } catch (err) {
    throw err
    // throw new Error(`Input file error - Failed to read file: ${filePath}`);
  }
}

async function getRemoteFile(filePath) {
  const inputContent = await new Promise((resolve, reject) => {
    https.get(filePath, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`${res.statusCode} ${res.statusMessage}`));
      }
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
      res.on('error', (err) => {
        reject(new Error(`${err.message}`));
      });
    });
  });
  return inputContent;
}

// Convert large number value safely before parsing
function encodeLargeNumbers(inputContent) {
  // Convert large number value safely before parsing
  const regexEncodeLargeNumber = /: ([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])(,|\n)/g;  // match > : 123456789.123456789
  return inputContent.replace(regexEncodeLargeNumber, (rawInput) => {
    const endChar = (rawInput.endsWith(',') ? ',' : '\n');
    const rgx = new RegExp(endChar, "g");
    const number = rawInput.replace(/: /g, '').replace(rgx, '');
    // Handle large numbers safely in javascript
    if (Number(number).toString().includes('e') || number.replace('.', '').length > 15) {
      return `: "${number}==="${endChar}`;
    } else {
      return `: ${number}${endChar}`;
    }
  });
}

// Decode large number YAML/JSON values safely before writing output
function decodeLargeNumbers(output, isJson = false) {
  if (isJson) {
    // Decode large number JSON values safely before writing output
    const regexDecodeJsonLargeNumber = /: "([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])==="/g; // match > : "123456789.123456789==="
    return output.replace(regexDecodeJsonLargeNumber, (strNumber) => {
      const number = strNumber.replace(/: "|"/g, '');
      // Decode large numbers safely in javascript
      if (number.endsWith('===') || number.replace('.', '').length > 15) {
        return strNumber.replace('===', '').replace(/"/g, '')
      } else {
        // Keep original number
        return strNumber;
      }
    });

  } else {
    // Decode large number YAML values safely before writing output
    const regexDecodeYamlLargeNumber = /: ([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])===/g; // match > : 123456789.123456789===
    return output.replace(regexDecodeYamlLargeNumber, (strNumber) => {
      const number = strNumber.replace(/: '|'/g, '');
      // Decode large numbers safely in javascript
      if (number.endsWith('===') || number.replace('.', '').length > 15) {
        return strNumber.replace('===', '').replace(/'/g, '')
      } else {
        // Keep original number
        return strNumber;
      }
    });
  }
}

module.exports = {
  parseFile,
  stringify,
  writeFile,
  encodeLargeNumbers,
  decodeLargeNumbers,
  getLocalFile,
  getRemoteFile,
};
