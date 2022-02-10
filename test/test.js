'use strict';

const fs = require('fs');
const path = require('path');
const sy = require('@stoplight/yaml');

const openapiFormat = require('../openapi-format.js');

let destroyOutput = false;
const tests = fs.readdirSync(__dirname).filter(file => {
  return fs.statSync(path.join(__dirname, file)).isDirectory() && (!file.startsWith('_'));
});

// SELECTIVE TESTING DEBUG
// const tests = ['yaml-default-bug-big-numbers']
// destroyOutput = true

describe('openapi-format tests', () => {
  tests.forEach((test) => {
    describe(test, () => {
      it('should match expected output', async () => {
        let options = {};
        let configFile = null;
        let configFileOptions = {};
        let sortOptions = {sortSet: {}};
        let sortComponentsOptions = {sortComponentsSet: {}};
        let sortFile = null;
        let filterFile = null;
        let casingFile = null;
        let sortComponentsFile = null;
        let filterOptions = {filterSet: {}};
        let casingOptions = {casingSet: {}};
        let inputFilename = null;
        let inputContent = null;
        let input = null;

        try {
          // Load options.yaml
          configFile = path.join(__dirname, test, 'options.yaml');
          configFileOptions = sy.parse(fs.readFileSync(configFile, 'utf8'));
          configFileOptions.sort = !(configFileOptions['no-sort']);
          options = Object.assign({}, options, configFileOptions);
        } catch (ex) {
          // console.error('ERROR Load options.yaml', ex)
          try {
            // Fallback to options.json
            configFile = path.join(__dirname, test, 'options.json');
            configFileOptions = JSON.parse(fs.readFileSync(configFile, 'utf8'));
            if (configFileOptions['no-sort'] && configFileOptions['no-sort'] === true) {
              configFileOptions.sort = !(configFileOptions['no-sort']);
              delete configFileOptions['no-sort'];
            }
            options = Object.assign({}, options, configFileOptions);
          } catch (ex) {
            // No options found. options = {} will be used
            // console.error('ERROR Load options.json', ex)
          }
        }

        try {
          // Load customSort.yaml
          sortFile = path.join(__dirname, test, 'customSort.yaml');
          sortOptions.sortSet = sy.parse(fs.readFileSync(sortFile, 'utf8'));
          options = Object.assign({}, options, sortOptions);
        } catch (ex) {
          // console.error('ERROR Load customSort.yaml', ex)
          try {
            // Fallback to customSort.json
            sortFile = path.join(__dirname, test, 'customSort.json');
            sortOptions.sortSet = JSON.parse(fs.readFileSync(sortFile, 'utf8'));
            options = Object.assign({}, options, sortOptions);
          } catch (ex) {
            // No options found. defaultSort.json will be used
            // console.error('ERROR Load customSort.json', ex)
            options.sortSet = require('../defaultSort.json');
          }
        }

        try {
          // Load customFilter.yaml
          filterFile = path.join(__dirname, test, 'customFilter.yaml');
          filterOptions.filterSet = sy.parse(fs.readFileSync(filterFile, 'utf8'));
          options = Object.assign({}, options, filterOptions);
        } catch (ex) {
          // console.error('ERROR Load customFilter.yaml', ex)
          try {
            // Fallback to customFilter.json
            filterFile = path.join(__dirname, test, 'customFilter.json');
            filterOptions.filterSet = sy.parse(fs.readFileSync(filterFile, 'utf8'));
            options = Object.assign({}, options, filterOptions);
          } catch (ex) {
            // No options found. defaultSort.json will be used
            // console.error('ERROR Load customSort.json', ex)
            options.filterSet = require('../defaultFilter.json');
          }
        }

        try {
          // Load customCasing.yaml
          casingFile = path.join(__dirname, test, 'customCasing.yaml');
          casingOptions.casingSet = sy.parse(fs.readFileSync(casingFile, 'utf8'));
          options = Object.assign({}, options, casingOptions);
        } catch (ex) {
          // console.error('ERROR Load customCasing.yaml', ex)
          try {
            // Fallback to customCasing.json
            casingFile = path.join(__dirname, test, 'customCasing.json');
            casingOptions.casingSet = sy.parse(fs.readFileSync(casingFile, 'utf8'));
            options = Object.assign({}, options, casingOptions);
          } catch (ex) {
            // No options found
          }
        }

        try {
          // Load customSortComponents.yaml
          sortComponentsFile = path.join(__dirname, test, 'customSortComponents.yaml');
          sortComponentsOptions.sortComponentsSet = sy.parse(fs.readFileSync(sortComponentsFile, 'utf8'));
          options = Object.assign({}, options, sortComponentsOptions);
        } catch (ex) {
          // console.error('ERROR Load customSort.yaml', ex)
          try {
            // Fallback to customSort.json
            sortComponentsFile = path.join(__dirname, test, 'customSortComponents.json');
            sortComponentsOptions.sortComponentsSet = JSON.parse(fs.readFileSync(sortComponentsFile, 'utf8'));
            options = Object.assign({}, options, sortComponentsOptions);
          } catch (ex) {
            // No options found. defaultSort.json will be used
            // console.error('ERROR Load customSort.json', ex)
            options.sortComponentsOptions = require('../defaultSortComponents.json');
          }
        }

        try {
          // Load input.yaml
          inputFilename = path.join(__dirname, test, 'input.yaml');
          inputContent = fs.readFileSync(inputFilename, 'utf8');
          // input = sy.parseWithPointers(fs.readFileSync(inputFilename, 'utf8'), {
          //     ignoreDuplicateKeys: false,
          //     mergeKeys: true,
          //     preserveKeyOrder: true,
          // }).data;
        } catch (ex) {
          // console.error('ERROR Load input.yaml', ex)

          // Fallback to customSort.json
          inputFilename = path.join(__dirname, test, 'input.json');
          // input = jy.load(fs.readFileSync(inputFilename, 'utf8'));
          // input = jy.load(fs.readFileSync(inputFilename, 'utf8'), { schema:jy.JSON_SCHEMA, json: true });
          inputContent = fs.readFileSync(inputFilename, 'utf8');
        }

        // Convert large number value safely before parsing
        const regexEncodeLargeNumber = /: ([0-9]*\.?[0-9]+)(,|\n)/g;  // match > : 123456789.123456789
        inputContent = inputContent.replace(regexEncodeLargeNumber, (rawInput) => {
          const endChar = (rawInput.endsWith(',') ? ',' : '\n');
          const rgx = new RegExp(endChar, "g");
          const number = rawInput.replace(/: /g, '').replace(rgx, '');
          // Handle large numbers safely in javascript
          if (!Number.isSafeInteger(Number(number)) || number.replace('.', '').length > 15) {
            return `: '${number}'${endChar}`;
          } else {
            return `: ${number}${endChar}`;
          }
        });

        // Parse input content
        input = sy.parse(inputContent);

        // DEBUG
        // console.log('options', options)
        // console.log('inputFilename', inputFilename)
        // return done();

        const outputFilename = path.join(__dirname, test, options.output);
        let readOutput = false;
        let output = {};

        // Destroy existing output, to force update test
        if (destroyOutput) {
          try {
            fs.unlinkSync(outputFilename);
          } catch (e) {
            // console.error('ERROR delete output.yaml', ex)
          }
        }

        try {
          // Read output file
          let outputContent = fs.readFileSync(outputFilename, 'utf8');

          // Convert large number value safely before parsing
          const regexEncodeLargeNumber = /: ([0-9]*\.?[0-9]+)/g;  // match > : 123456789.123456789
          outputContent = outputContent.replace(regexEncodeLargeNumber, (rawInput) => {
            const number = rawInput.replace(/: /g, '');
            // Handle large numbers safely in javascript
            if (!Number.isSafeInteger(Number(number)) || number.replace('.', '').length > 15) {
              return `: "${number}"`;
            } else {
              return `: ${number}`;
            }
          });
          output = sy.parse(outputContent);
          readOutput = true;
        } catch (ex) {
          // No options found. output = {} will be used
        }

        // Initialize data
        let result = input;

        // Filter OpenAPI document
        if (options.filterSet) {
          const resFilter = await openapiFormat.openapiFilter(result, options);
          if (resFilter.data) result = resFilter.data;
        }

        // Sort OpenAPI document
        if (options.sort === true) {
          const resFormat = await openapiFormat.openapiSort(result, options);
          if (resFormat.data) result = resFormat.data;
        }

        // Change case OpenAPI document
        if (options.casingSet) {
          const resFormat = await openapiFormat.openapiChangeCase(result, options);
          if (resFormat.data) result = resFormat.data;
        }

        // Rename title OpenAPI document
        if (options.rename) {
          const resRename = await openapiFormat.openapiRename(result, options);
          if (resRename.data) result = resRename.data;
        }

        try {
          if (!readOutput) {
            if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
              // Convert OpenAPI object to JSON string
              output = JSON.stringify(result, null, 2);

              // Decode stringified large number JSON values safely before writing output
              const regexDecodeJsonLargeNumber = /: "([0-9]*\.?[0-9]+)"/g; // match > : "123456789.123456789"
              output = output.replace(regexDecodeJsonLargeNumber, (strNumber) => {
                const number = strNumber.replace(/: "|"/g, '');
                // Decode large numbers safely in javascript
                if (!Number.isSafeInteger(Number(number)) || number.replace('.', '').length > 15) {
                  return strNumber.replace(/"/g, '')
                } else {
                  // Keep stringified number
                  return strNumber;
                }
              });
            } else {
              // Convert OpenAPI object to YAML string
              let lineWidth = (options.lineWidth && options.lineWidth === -1 ? Infinity : options.lineWidth) || Infinity;
              output = sy.safeStringify(result, {lineWidth: lineWidth});

              // Decode stringified large number YAML values safely before writing output
              const regexDecodeYamlLargeNumber = /: '([0-9]*\.?[0-9]+)'/g; // match > : '123456789.123456789'
              output = output.replace(regexDecodeYamlLargeNumber, (strNumber) => {
                const number = strNumber.replace(/: '|'/g, '');
                // Decode large numbers safely in javascript
                if (!Number.isSafeInteger(Number(number)) || number.replace('.', '').length > 15) {
                  return strNumber.replace(/'/g, '')
                } else {
                  // Keep stringified number
                  return strNumber;
                }
              });
            }

            // Write OpenAPI string to file
            fs.writeFileSync(outputFilename, output, 'utf8');
          }
        } catch (error) {
          console.log('error', error);
        }

        // Assert results with output
        expect(result).toStrictEqual(output);
      });
    });
  });
});
