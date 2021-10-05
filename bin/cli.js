#!/usr/bin/env node

const fs = require('fs');
// const jy = require('js-yaml');
const sy = require('@stoplight/yaml');
const openapiFormat = require('../openapi-format')
const program = require('commander');

// CLI Helper - change verbosity
function increaseVerbosity(dummyValue, previous) {
    return previous + 1;
}

program
    .arguments('<oaFile>')
    .usage('<file> [options]')
    .description('Format a OpenAPI document by ordering and filtering fields.')
    .option('-o, --output <output>', 'write the formatted OpenAPI to an output file path.')
    .option('-s, --sortFile <sortFile>', 'the file with the sort priority options.')
    .option('-f, --filterFile <filterFile>', 'the file with the filter options.')
    .option('-c, --configFile <configFile>', 'the file with the OpenAPI-format CLI options.')
    .option('--no-sort', 'dont sort the OpenAPI file')
    .option('--sortComponentsFile <sortComponentsFile>', 'The file with components to sort alfabehtically')
    .option('--lineWidth <lineWidth>', 'max line width of YAML output', -1)
    .option('--rename <oaTitle>', 'overwrite the title in the OpenAPI document.')
    .option('--json', 'print the file to stdout as JSON')
    .option('--yaml', 'print the file to stdout as YAML')
    .version(require('../package.json').version, '--version')
    .option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
    .action(run)
    .exitOverride((err) => {
        if (
            err.code === "commander.missingArgument" ||
            err.code === "commander.unknownOption"
        ) {
            stdout.write("\n");
            program.outputHelp();
        }

        process.exit(err.exitCode);
    })
    .parse(process.argv);

async function run(oaFile, options) {
    // Helper function to display info message, depending on the verbose level
    function info(msg) {
        if (options.verbose >= 1) {
            console.warn(msg);
        }
    }

    if (!oaFile) {
        console.error('Provide file to OpenAPI document');
        return;
    }

    // apply options from config file if present
    if (options && options.configFile) {
        info('Config File: ' + options.configFile)
        try {
            let configFileOptions = {}
            // configFileOptions = jy.load(fs.readFileSync(options.configFile, 'utf8'));
            configFileOptions = sy.parse(fs.readFileSync(options.configFile, 'utf8'));
            if (configFileOptions['no-sort'] && configFileOptions['no-sort'] === true) {
                configFileOptions.sort = !(configFileOptions['no-sort'])
                delete configFileOptions['no-sort'];
            }
            options = Object.assign({}, options, configFileOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Config file error - no such file or directory "' + options.configFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    if (options.verbose >= 1 || options.verbose === true) {
        console.table(options);
    }

    // apply ordering by priority file if present
    if (options && options.sort === true) {
        info('Sort File: ' + options.sortFile)
        try {
            let sortOptions = {sortSet: {}}
            // sortOptions.sortSet = jy.load(fs.readFileSync(options.sortFile, 'utf8'));
            let sortFile = (options.sortFile) ? options.sortFile : __dirname + "/../defaultSort.json"
            sortOptions.sortSet = sy.parse(fs.readFileSync(sortFile, 'utf8'));
            options = Object.assign({}, options, sortOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Sort file error - no such file or directory "' + options.sortFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // apply filtering by filter file if present
    if (options && options.filterFile) {
        info('Filter File: ' + options.filterFile)
        try {
            let filterOptions = {filterSet: {}}
            // filterOptions.filterSet = jy.load(fs.readFileSync(options.filterFile, 'utf8'));
            filterOptions.filterSet = sy.parse(fs.readFileSync(options.filterFile, 'utf8'));
            options = Object.assign({}, options, filterOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Filter file error - no such file or directory "' + options.filterFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // apply components sorting by alphabet, if file is present
    if (options && options.sortComponentsFile) {
        info('Sort Components File: ' + options.sortComponentsFile)
        try {
            let sortComponentsOptions = {sortComponentsSet: {}}
            // sortComponentsOptions.sortSet = jy.load(fs.readFileSync(options.sortFile, 'utf8'));
            sortComponentsOptions.sortComponentsSet = sy.parse(fs.readFileSync(options.sortComponentsFile, 'utf8'));
            options = Object.assign({}, options, sortComponentsOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Sort Components file error - no such file or directory "' + options.sortComponentsFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    info('Input file: ' + oaFile)

    // Get
    // let res = jy.load(fs.readFileSync(oaFile, 'utf8'));
    let res = sy.parse(fs.readFileSync(oaFile, 'utf8'));
    let o = {};

    // Filter OpenAPI document
    if (options.filterSet) {
        res = await openapiFormat.openapiFilter(res, options);
    }

    // Format & Order OpenAPI document
    if (options.sort === true) {
        res = await openapiFormat.openapiSort(res, options);
    }

    // Rename title OpenAPI document
    if (options.rename) {
        res = await openapiFormat.openapiRename(res, options);
        info('OpenAPI title renamed to: "' + options.rename + '"')
    }

    if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
        o = JSON.stringify(res, null, 2);
    } else {
        // o = jy.dump(res,{lineWidth:-1});
        let lineWidth = (options.lineWidth && options.lineWidth === -1 ? Infinity: options.lineWidth) || Infinity;
        o = sy.safeStringify(res, {lineWidth: lineWidth});
    }

    if (options.output) {
        try {
            fs.writeFileSync(options.output, o, 'utf8');
            info('Output file: ' + options.output)
        } catch (err) {
            console.error('\x1b[31m', 'Output file error - no such file or directory "' + options.output + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    } else {
        console.log(o);
    }

    info('\n✅  OpenAPI was formatted successfully')
}
