'use strict';

const fs = require('fs');
const path = require('path');
const {describe, it, expect} = require('@jest/globals');

const {run} = require('../bin/cli');
const {parseFile, stringify, writeFile} = require('../openapi-format');

// SELECTIVE TESTING DEBUG
const localTesting = false;
const destroyOutput = false;

// Load tests
const tests = !localTesting
  ? fs.readdirSync(__dirname).filter(file => {
      return fs.statSync(path.join(__dirname, file)).isDirectory() && !file.startsWith('_');
    })
  : ['yaml-no-sort'];

describe('openapi-format tests', () => {
  let consoleLogSpy, consoleWarnSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  tests.forEach(test => {
    describe(test, () => {
      it('should match expected output', async () => {
        let options = {};
        let configFileOptions = {};
        let inputFilename = null;
        let input = null;
        let snap = null;

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

        // Load input.yaml
        inputFilename = path.join(__dirname, test, 'input.yaml');
        if (!fs.existsSync(inputFilename)) {
          inputFilename = path.join(__dirname, test, 'input.json');
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
            console.error('ERROR delete output.yaml', ex);
          }
        }

        try {
          let snapFileOptions = options;
          snap = await parseFile(outputFilename, snapFileOptions);
          snap = await stringify(snap, snapFileOptions);
          readOutput = true;
        } catch (ex) {
          // console.error('ex', ex);
          // No snap found.
        }

        // Initialize data
        let result = input;

        // Execute OpenAPI-format
        delete options.output;
        if (options.sortFile) options.sortFile = path.join(__dirname, test, options.sortFile);
        if (options.sortComponentsFile)
          options.sortComponentsFile = path.join(__dirname, test, options.sortComponentsFile);
        if (options.filterFile) options.filterFile = path.join(__dirname, test, options.filterFile);
        if (options.casingFile) options.casingFile = path.join(__dirname, test, options.casingFile);
        if (options.generateFile) options.generateFile = path.join(__dirname, test, options.generateFile);

        if (outputFilename.indexOf('.json') >= 0 || options.json) {
          // Convert OpenAPI object to JSON string
          options.format = 'json';
        } else {
          // Convert OpenAPI object to YAML string
          options.format = 'yaml';
        }

        try {
          result = await run(inputFilename, options);
        } catch (e) {
          console.error('e', e);
        }

        try {
          if (!readOutput) {
            // Write OpenAPI string to file
            await writeFile(outputFilename, result, options);
          }
        } catch (error) {
          console.error('error', error);
        }

        // Assert results with output
        expect(result).toStrictEqual(snap);
      });
    });
  });
});
