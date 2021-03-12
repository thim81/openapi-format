'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const jy = require('js-yaml');

const openapiFormat = require('../openapi-format.js');

const tests = fs.readdirSync(__dirname).filter(file => {
    return fs.statSync(path.join(__dirname, file)).isDirectory() && (!file.startsWith('_') || doPrivate);
});

describe('openapi-format tests', () => {
    tests.forEach((test) => {
        describe(test, () => {
            it('should match expected output', (done) => {
                let options = {};
                let configFile = null;
                let configFileOptions = {};
                let sortOptions = {sortPrio: {}};
                let sortFile = null;
                let inputFilename = null;
                let input = null;

                try {
                    // Load options.yaml
                    configFile = path.join(__dirname, test, 'options.yaml');
                    configFileOptions = jy.load(fs.readFileSync(configFile, 'utf8'));
                    options = Object.assign({}, options, configFileOptions);
                } catch (ex) {
                    // console.error('ERROR Load options.yaml', ex)
                    try {
                        // Fallback to options.json
                        configFile = path.join(__dirname, test, 'options.json');
                        configFileOptions = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                        options = Object.assign({}, options, configFileOptions);
                    } catch (ex) {
                        // No options found. options = {} will be used
                        // console.error('ERROR Load options.json', ex)
                    }
                }

                try {
                    // Load customSort.yaml
                    sortFile = path.join(__dirname, test, 'customSort.yaml');
                    sortOptions.sortPrio = jy.load(fs.readFileSync(sortFile, 'utf8'));
                    options = Object.assign({}, options, sortOptions);
                } catch (ex) {
                    // console.error('ERROR Load customSort.yaml', ex)
                    try {
                        // Fallback to customSort.json
                        sortFile = path.join(__dirname, test, 'customSort.json');
                        sortOptions.sortPrio = JSON.parse(fs.readFileSync(sortFile, 'utf8'));
                        options = Object.assign({}, options, sortOptions);
                    } catch (ex) {
                        // No options found. defaultSort.json will be used
                        // console.error('ERROR Load customSort.json', ex)
                        options.sortPrio = require('../defaultSort.json')
                    }
                }

                // DEBUG
                // console.log('options', options)

                try {
                    // Load input.yaml
                    inputFilename = path.join(__dirname, test, 'input.yaml');
                    input = jy.load(fs.readFileSync(inputFilename, 'utf8'));
                } catch (ex) {
                    // console.error('ERROR Load input.yaml', ex)

                    // Fallback to customSort.json
                    inputFilename = path.join(__dirname, test, 'input.json');
                    input = jy.load(fs.readFileSync(inputFilename, 'utf8'));
                }

                const outputFilename = path.join(__dirname, test, options.output);
                let readOutput = false;
                let output = {};
                try {
                    output = jy.load(fs.readFileSync(outputFilename, 'utf8'));
                    readOutput = true;
                } catch (ex) {
                    // No options found. output = {} will be used
                }

                const result = openapiFormat.openapiSort(input, options);
                if (!readOutput) {
                    if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
                        output = JSON.stringify(result, null, 2);
                    } else {
                        output = jy.dump(result);
                    }
                    fs.writeFileSync(outputFilename, output, 'utf8');
                }

                assert.deepStrictEqual(result, output);
                return done();
            });
        });
    });
});
