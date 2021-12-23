#!/usr/bin/env node

const fs = require('fs');
// const jy = require('js-yaml');
const sy = require('@stoplight/yaml');
const openapiFormat = require('../openapi-format')
const program = require('commander');
const {infoTable, infoOut, logOut, debugOut} = require("../util-log-output");

// CLI Helper - change verbosity
function increaseVerbosity(dummyValue, previous) {
    return previous + 1;
}

program
    .arguments('<oaFile>')
    .usage('<file> [options]')
    .description('Format a OpenAPI document by ordering and filtering fields.')
    .option('-o, --output <output>', 'write the formatted OpenAPI to an output file path.')
    .option('-s, --sortFile <sortFile>', 'The file to specify custom OpenAPI fields ordering.')
    .option('-c, --casingFile <filterFile>', 'The file to specify casing rules.')
    .option('-f, --filterFile <filterFile>', 'The file to specify filter rules .')
    .option('-c, --configFile <configFile>', 'The file with the OpenAPI-format CLI options.')
    .option('--no-sort', 'dont sort the OpenAPI file')
    .option('--sortComponentsFile <sortComponentsFile>', 'The file with components to sort alphabetically')
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
            process.stdout.write("\n");
            program.outputHelp();
        }

        process.exit(err.exitCode);
    })
    .parse(process.argv);

async function run(oaFile, options) {
    // General variables
    let outputLogOptions = ''
    let outputLogFiltered = ''
    let cliLog = {};
    const consoleLine = process.stdout.columns ? '='.repeat(process.stdout.columns) : '='.repeat(80)

    if (!oaFile) {
        console.error('Please provide a file path for the OpenAPI document');
        // process.exit(1)
        return;
    }

    infoOut(`${consoleLine}`); // LOG - horizontal rule
    infoOut(`OpenAPI-Format CLI settings:`) // LOG - config file

    // apply options from config file if present
    if (options && options.configFile) {
        try {
            let configFileOptions = {}
            // configFileOptions = jy.load(fs.readFileSync(options.configFile, 'utf8'));
            configFileOptions = sy.parse(fs.readFileSync(options.configFile, 'utf8'));
            if (configFileOptions['no-sort'] && configFileOptions['no-sort'] === true) {
                configFileOptions.sort = !(configFileOptions['no-sort'])
                delete configFileOptions['no-sort'];
            }
            infoOut(`- Config file:\t\t${options.configFile}`) // LOG - config file
            options = Object.assign({}, options, configFileOptions);
        } catch (err) {
            console.error('\x1b[31m', 'Config file error - no such file or directory "' + options.configFile + '"')
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // LOG - Render info table with options
    outputLogOptions = infoTable(options, options.verbose)

    // apply ordering by priority file if present
    if (options && options.sort === true) {
        infoOut(`- Sort file:\t\t${options.sortFile}`) // LOG - sort file
        try {
            let sortOptions = {sortSet: {}}
            // sortOptions.sortSet = jy.load(fs.readFileSync(options.sortFile, 'utf8'));
            let sortFile = (options.sortFile) ? options.sortFile : __dirname + "/../defaultSort.json"
            sortOptions.sortSet = sy.parse(fs.readFileSync(sortFile, 'utf8'));
            options = Object.assign({}, options, sortOptions);
        } catch (err) {
            console.error('\x1b[31m', `Sort file error - no such file or directory "${options.sortFile}"`)
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // apply filtering by filter file if present
    if (options && options.filterFile) {
        infoOut(`- Filter file:\t\t${options.filterFile}`) // LOG - Filter file
        try {
            let filterOptions = {filterSet: {}}
            // filterOptions.filterSet = jy.load(fs.readFileSync(options.filterFile, 'utf8'));
            filterOptions.filterSet = sy.parse(fs.readFileSync(options.filterFile, 'utf8'));
            options = Object.assign({}, options, filterOptions);
        } catch (err) {
            console.error('\x1b[31m', `Filter file error - no such file or directory "${options.filterFile}"`)
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // apply components sorting by alphabet, if file is present
    if (options && options.sortComponentsFile) {
        infoOut(`- Sort Components file:\t ${options.sortComponentsFile}`) // LOG - Sort file
        try {
            let sortComponentsOptions = {sortComponentsSet: {}}
            // sortComponentsOptions.sortSet = jy.load(fs.readFileSync(options.sortFile, 'utf8'));
            sortComponentsOptions.sortComponentsSet = sy.parse(fs.readFileSync(options.sortComponentsFile, 'utf8'));
            options = Object.assign({}, options, sortComponentsOptions);
        } catch (err) {
            console.error('\x1b[31m', `Sort Components file error - no such file or directory "${options.sortComponentsFile}"`)
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    // apply change casing by casing file if present
    if (options && options.casingFile) {
        infoOut(`- Casing file:\t\t${options.casingFile}`) // LOG - Casing file
        try {
            let casingOptions = {casingSet: {}}
            casingOptions.casingSet = sy.parse(fs.readFileSync(options.casingFile, 'utf8'));
            options = Object.assign({}, options, casingOptions);
        } catch (err) {
            console.error('\x1b[31m', `Casing file error - no such file or directory "${options.casingFile}"`)
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    }

    infoOut(`- Input file:\t\t${oaFile}`) // LOG - Input file

    // Get
    // let res = jy.load(fs.readFileSync(oaFile, 'utf8'));
    let res = sy.parse(fs.readFileSync(oaFile, 'utf8'));
    let o = {};

    // Filter OpenAPI document
    if (options.filterSet) {
        const resFilter = await openapiFormat.openapiFilter(res, options);
        if (resFilter.resultData && resFilter.resultData.unusedComp) {
            cliLog.unusedComp = resFilter.resultData.unusedComp
        }
        outputLogFiltered = `filtered & `;
        res = resFilter.data;
    }

    // Format & Order OpenAPI document
    if (options.sort === true) {
        const resFormat = await openapiFormat.openapiSort(res, options);
        if (resFormat.data) res = resFormat.data
    }

    // Change case OpenAPI document
    if (options.casingSet === true) {
        const resFormat = await openapiFormat.openapiChangeCase(res, options);
        if (resFormat.data) res = resFormat.data
    }

    // Rename title OpenAPI document
    if (options.rename) {
        const resRename = await openapiFormat.openapiRename(res, options);
        if (resRename.data) res = resRename.data
        debugOut(`- OAS.title renamed to: "${options.rename}"`, options.verbose) // LOG - Rename title
    }

    if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
        o = JSON.stringify(res, null, 2);
    } else {
        // o = jy.dump(res,{lineWidth:-1});
        let lineWidth = (options.lineWidth && options.lineWidth === -1 ? Infinity : options.lineWidth) || Infinity;
        o = sy.safeStringify(res, {lineWidth: lineWidth});
    }

    if (options.output) {
        try {
            fs.writeFileSync(options.output, o, 'utf8');
            infoOut(`- Output file:\t\t${options.output}`) // LOG - config file
        } catch (err) {
            console.error('\x1b[31m', `Output file error - no such file or directory "${options.output}"`)
            if (options.verbose >= 1) {
                console.error(err)
            }
        }
    } else {
        console.log(o);
    }

    if (outputLogOptions) { //&& options.verbose > 2) {
        // Show options
        debugOut(`${consoleLine}\n`, options.verbose); // LOG - horizontal rule
        debugOut(`OpenAPI-Format CLI options:`, options.verbose) // LOG - config file
        debugOut(`${outputLogOptions}`, options.verbose);
    }

    // Show unused components
    if (cliLog && cliLog.unusedComp) {
        // List unused component
        const unusedComp = cliLog.unusedComp;
        const keys = Object.keys(unusedComp || {});
        let count = 0
        const cliOut = []
        keys.map((comp) => {
            if (unusedComp && unusedComp[comp] && unusedComp[comp].length > 0) {
                unusedComp[comp].forEach(value => {
                    const spacer = (comp === 'requestBodies' ? `\t` : `\t\t`);
                    cliOut.push(`- components/${comp}${spacer} "${value}"`);
                    count++;
                });
            }
        });
        if (count > 0) {
            logOut(`${consoleLine}`, options.verbose); // LOG - horizontal rule
            logOut(`Removed unused components:`, options.verbose); // LOG - horizontal rule
            logOut(cliOut.join('\n'), options.verbose);
            logOut(`Total components removed: ${count}`, options.verbose);
        }
    }

    // Final result
    infoOut(`\x1b[32m${consoleLine}\x1b[0m`); // LOG - horizontal rule
    infoOut(`\x1b[32m✅  OpenAPI ${outputLogFiltered}formatted successfully\x1b[0m`, 99) // LOG - success message
    infoOut(`\x1b[32m${consoleLine}\x1b[0m`); // LOG - horizontal rule
}
