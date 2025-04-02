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
  : ['overlay-preserve-required'];

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
        let configFilename = null;
        let input = null;
        let snap = null;

        // Load input.yaml
        configFilename = path.join(__dirname, test, 'options.yaml');
        if (!fs.existsSync(configFilename)) {
          configFilename = path.join(__dirname, test, 'input.json');
        }

        if (fs.existsSync(configFilename)) {
          // Load options file
          configFileOptions = await parseFile(configFilename);
          configFileOptions.sort = !configFileOptions['no-sort'];
          if (configFileOptions['no-sort'] && configFileOptions['no-sort'] === true) {
            configFileOptions.sort = !configFileOptions['no-sort'];
            delete configFileOptions['no-sort'];
          }
          configFileOptions.bundle = !configFileOptions['no-bundle'];
          if (configFileOptions['no-sort'] && configFileOptions['no-bundle'] === true) {
            configFileOptions.bundle = !configFileOptions['no-bundle'];
            delete configFileOptions['no-bundle'];
          }
          options = Object.assign({}, options, configFileOptions);
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

        // Load proper options for test cases
        delete options.output;
        if (options.sortFile) options.sortFile = path.join(__dirname, test, options.sortFile);
        if (options.sortComponentsFile)
          options.sortComponentsFile = path.join(__dirname, test, options.sortComponentsFile);
        if (options.filterFile) options.filterFile = path.join(__dirname, test, options.filterFile);
        if (options.casingFile) options.casingFile = path.join(__dirname, test, options.casingFile);
        if (options.generateFile) options.generateFile = path.join(__dirname, test, options.generateFile);
        if (options.overlayFile) options.overlayFile = path.join(__dirname, test, options.overlayFile);
        if (outputFilename.indexOf('.json') >= 0 || options.json) {
          // Convert OpenAPI object to JSON string
          options.format = 'json';
        } else {
          // Convert OpenAPI object to YAML string
          options.format = 'yaml';
        }

        try {
          // Execute OpenAPI-format
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
