'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
// const jy = require('js-yaml');
const sy = require('@stoplight/yaml');

const openapiFormat = require('../openapi-format.js');

let destroyOutput = false;
const tests = fs.readdirSync(__dirname).filter(file => {
    return fs.statSync(path.join(__dirname, file)).isDirectory() && (!file.startsWith('_') || doPrivate);
});

// SELECTIVE TESTING DEBUG
// const tests = ['yaml-filter-unused-components']
// destroyOutput = true
// console.log('tests',tests);

describe('openapi-format tests', () => {
    tests.forEach((test) => {
        describe(test, () => {
            it('should match expected output', (done) => {
                let options = {};
                let configFile = null;
                let configFileOptions = {};
                let sortOptions = {sortSet: {}};
                let sortComponentsOptions = {sortComponentsSet: {}};
                let sortFile = null;
                let filterFile = null;
                let sortComponentsFile = null;
                let filterOptions = {filterSet: {}};
                let inputFilename = null;
                let input = null;

                try {
                    // Load options.yaml
                    configFile = path.join(__dirname, test, 'options.yaml');
                    // configFileOptions = jy.load(fs.readFileSync(configFile, 'utf8'));
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
                    // sortOptions.sortSet = jy.load(fs.readFileSync(sortFile, 'utf8'));
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
                    // filterOptions.filterSet = jy.load(fs.readFileSync(filterFile, 'utf8'));
                    filterOptions.filterSet = sy.parse(fs.readFileSync(filterFile, 'utf8'));
                    options = Object.assign({}, options, filterOptions);
                } catch (ex) {
                    // console.error('ERROR Load customSort.yaml', ex)
                    try {
                        // Fallback to customFilter.json
                        filterFile = path.join(__dirname, test, 'customFilter.json');
                        // filterOptions.filterSet = jy.load(fs.readFileSync(filterFile, 'utf8'));
                        filterOptions.filterSet = sy.parse(fs.readFileSync(filterFile, 'utf8'));
                        options = Object.assign({}, options, filterOptions);
                    } catch (ex) {
                        // No options found. defaultSort.json will be used
                        // console.error('ERROR Load customSort.json', ex)
                        options.filterSet = require('../defaultFilter.json');
                    }
                }

                try {
                    // Load customSortComponents.yaml
                    sortComponentsFile = path.join(__dirname, test, 'customSortComponents.yaml');
                    // sortOptions.sortSet = jy.load(fs.readFileSync(sortFile, 'utf8'));
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
                    // input = jy.load(fs.readFileSync(inputFilename, 'utf8'));
                    input = sy.parse(fs.readFileSync(inputFilename, 'utf8'));
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
                    input = sy.parse(fs.readFileSync(inputFilename, 'utf8'));
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
                    fs.unlinkSync(outputFilename);
                }

                try {
                    // output = jy.load(fs.readFileSync(outputFilename, 'utf8'));
                    output = sy.parse(fs.readFileSync(outputFilename, 'utf8'));
                    readOutput = true;
                } catch (ex) {
                    // No options found. output = {} will be used
                }

                // Initialize data
                let result = input;

                // Filter OpenAPI document
                if (options.filterSet) {
                    const resFilter = openapiFormat.openapiFilter(result, options);
                    if (resFilter.data) result = resFilter.data;
                }

                // Sort OpenAPI document
                if (options.sort === true) {
                    const resFormat = openapiFormat.openapiSort(result, options);
                    if (resFormat.data) result = resFormat.data;
                }

                // Rename title OpenAPI document
                if (options.rename) {
                    const resRename = openapiFormat.openapiRename(result, options);
                    if (resRename.data) result = resRename.data;
                }

                try {
                    if (!readOutput) {
                        if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
                            output = JSON.stringify(result, null, 2);
                        } else {
                            let lineWidth = (options.lineWidth && options.lineWidth === -1 ? Infinity : options.lineWidth) || Infinity;
                            output = sy.safeStringify(result, {lineWidth: lineWidth});
                        }
                        fs.writeFileSync(outputFilename, output, 'utf8');
                    }
                } catch (error) {
                    console.log('error', error);
                }

                assert.deepStrictEqual(result, output);
                return done();
            });
        });
    });
});
