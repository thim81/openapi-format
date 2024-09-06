'use strict';

const fs = require('fs');
const path = require('path');
const sy = require('@stoplight/yaml');
const {describe, it, expect} = require('@jest/globals');

const openapiFormat = require('../openapi-format.js');
const {parseFile, stringify, writeFile} = require('../openapi-format');

// SELECTIVE TESTING DEBUG
const localTesting = false;
const destroyOutput = false;

// Load tests
const tests = !localTesting
  ? fs.readdirSync(__dirname).filter(file => {
      return fs.statSync(path.join(__dirname, file)).isDirectory() && !file.startsWith('_');
    })
  : ['json-filter-unused'];

describe('openapi-format tests', () => {
  tests.forEach(test => {
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
          configFileOptions = await parseFile(path.join(__dirname, test, 'options.yaml'));
          configFileOptions.sort = !configFileOptions['no-sort'];
          options = Object.assign({}, options, configFileOptions);
        } catch (ex) {
          // console.error('ERROR Load options.yaml', ex)
          try {
            // Fallback to options.json
            configFileOptions = await parseFile(path.join(__dirname, test, 'options.json'));
            if (configFileOptions['no-sort'] && configFileOptions['no-sort'] === true) {
              configFileOptions.sort = !configFileOptions['no-sort'];
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
          sortOptions.sortSet = await parseFile(path.join(__dirname, test, 'customSort.yaml'));
          options = Object.assign({}, options, sortOptions);
        } catch (ex) {
          // console.error('ERROR Load customSort.yaml', ex)
          try {
            // Fallback to customSort.json
            sortOptions.sortSet = await parseFile(path.join(__dirname, test, 'customSort.json'));
            options = Object.assign({}, options, sortOptions);
          } catch (ex) {
            // No options found. defaultSort.json will be used
            // console.error('ERROR Load customSort.json', ex)
            options.sortSet = require('../defaultSort.json');
          }
        }

        try {
          // Load customFilter.yaml
          filterOptions.filterSet = await parseFile(path.join(__dirname, test, 'customFilter.yaml'));
          options = Object.assign({}, options, filterOptions);
        } catch (ex) {
          // console.error('ERROR Load customFilter.yaml', ex)
          try {
            // Fallback to customFilter.json
            filterOptions.filterSet = await parseFile(path.join(__dirname, test, 'customFilter.json'));
            options = Object.assign({}, options, filterOptions);
          } catch (ex) {
            // No options found. defaultSort.json will be used
            // console.error('ERROR Load customSort.json', ex)
            options.filterSet = require('../defaultFilter.json');
          }
        }

        try {
          // Load customCasing.yaml
          casingOptions.casingSet = await parseFile(path.join(__dirname, test, 'customCasing.yaml'));
          options = Object.assign({}, options, casingOptions);
        } catch (ex) {
          // console.error('ERROR Load customCasing.yaml', ex)
          try {
            // Fallback to customCasing.json
            casingOptions.casingSet = await parseFile(path.join(__dirname, test, 'customCasing.json'));
            options = Object.assign({}, options, casingOptions);
          } catch (ex) {
            // No options found
          }
        }

        try {
          // Load customSortComponents.yaml
          sortComponentsOptions.sortComponentsSet = await parseFile(
            path.join(__dirname, test, 'customSortComponents.yaml')
          );
          options = Object.assign({}, options, sortComponentsOptions);
        } catch (ex) {
          // console.error('ERROR Load customSort.yaml', ex)
          try {
            // Fallback to customSort.json
            sortComponentsOptions.sortComponentsSet = await parseFile(
              path.join(__dirname, test, 'customSortComponents.json')
            );
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
          input = await parseFile(inputFilename);
        } catch (ex) {
          // console.error('ERROR Load input.yaml', ex)

          // Fallback to customSort.json
          inputFilename = path.join(__dirname, test, 'input.json');
          input = await parseFile(inputFilename);
        }

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
          output = await parseFile(outputFilename);
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

        // Convert the OpenAPI document to OpenAPI 3.1
        if (
          (options.convertTo && options.convertTo.toString() === '3.1') ||
          (options.convertToVersion && options.convertToVersion === 3.1)
        ) {
          const resVersion = await openapiFormat.openapiConvertVersion(result, options);
          if (resVersion.data) result = resVersion.data;
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
              options.format = 'json';
            } else {
              // Convert OpenAPI object to YAML string
              options.format = 'yaml';
            }

            // Write OpenAPI string to file
            await writeFile(outputFilename, result, options);
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
