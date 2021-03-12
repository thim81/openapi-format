#!/usr/bin/env node

const fs = require('fs');
const jy = require('js-yaml');
const yaml = require('yaml');
const openapiFormat = require('../openapi-format')
const program = require('commander');

// CLI Helper - change verbosity
function increaseVerbosity(dummyValue, previous) {
    return previous + 1;
}

program
    .version(require('../package.json').version, '--version')
    .arguments('<oaFile>')
    .usage('<file> [options]')
    .description('Format & order the OpenAPI document')
    .option('-o, --output <output>', 'Write the formatted OpenAPI to an output file path. Default stdout.')
    .option('--sortFile <sortFile>', 'The file with the sort priority options.', 'defaultSort.json')
    .option('-c, --configFile <configFile>', 'The file with the OpenAPI-format CLI options.')
    .option('--json', 'Print the file to stdout as JSON')
    .option('--yaml', 'Print the file to stdout as YAML')
    .option('--no-sort', 'Dont sort the file')
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
            configFileOptions = jy.load(fs.readFileSync(options.configFile, 'utf8'));
            options = Object.assign({}, options, configFileOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Config file error - no such file or directory "' + options.configFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // apply ordering by priority file if present
    if (options && options.sortFile) {
        info('Sort File: ' + options.sortFile)
        try {
            let sortOptions = {sortPrio: {}}
            sortOptions.sortPrio = jy.load(fs.readFileSync(options.sortFile, 'utf8'));
            options = Object.assign({}, options, sortOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Sort file error - no such file or directory "' + options.sortFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    info('Input file: ' + oaFile)

    // Get
    let res = jy.load(fs.readFileSync(oaFile, 'utf8'));
    let o = {};

    // Format & Order
    if (options.sort === true) {
        res = await openapiFormat.openapiSort(res, options);
    }

    if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
        o = JSON.stringify(res, null, 2);
    } else {
        o = jy.dump(res);
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

    info('\n✅ OpenAPI was formatted successfully')
}
