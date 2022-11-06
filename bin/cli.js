#!/usr/bin/env node

const fs = require('fs');
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
  .description('Format an OpenAPI document by ordering, formatting and filtering fields.')
  .option('-o, --output <output>', 'save the formatted OpenAPI file as JSON/YAML')
  .option('-s, --sortFile <sortFile>', 'the file to specify custom OpenAPI fields ordering')
  .option('-c, --casingFile <casingFile>', 'the file to specify casing rules')
  .option('-f, --filterFile <filterFile>', 'the file to specify filter rules')
  .option('-c, --configFile <configFile>', 'the file with the OpenAPI-format CLI options')
  .option('--no-sort', `don't sort the OpenAPI file`)
  .option('--sortComponentsFile <sortComponentsFile>', 'the file with components to sort alphabetically')
  .option('--lineWidth <lineWidth>', 'max line width of YAML output', -1)
  .option('--rename <oaTitle>', 'overwrite the title in the OpenAPI document')
  .option('--convertTo <oaVersion>', 'convert the OpenAPI document to OpenAPI version 3.1')
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
  let outputLogOptions = '';
  let outputLogFiltered = '';
  let cliLog = {};
  const consoleLine = process.stdout.columns ? '='.repeat(process.stdout.columns) : '='.repeat(80);

  if (!oaFile) {
    console.error('Please provide a file path for the OpenAPI document');
    return;
  }

  infoOut(`${consoleLine}`); // LOG - horizontal rule
  infoOut(`OpenAPI-Format CLI settings:`) // LOG - config file

  // apply options from config file if present
  if (options && options.configFile) {
    try {
      let configFileOptions = {}
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
      process.exit(1)
    }
  }

  // LOG - Render info table with options
  outputLogOptions = infoTable(options, options.verbose)

  // apply ordering by priority file if present
  if (options && options.sort === true) {
    let sortFile = (options.sortFile) ? options.sortFile : __dirname + "/../defaultSort.json"
    let sortFileName = (options.sortFile) ? options.sortFile : "(defaultSort.json)"
    try {
      let sortOptions = {sortSet: {}}
      infoOut(`- Sort file:\t\t${sortFileName}`) // LOG - sort file
      sortOptions.sortSet = sy.parse(fs.readFileSync(sortFile, 'utf8'));
      options = Object.assign({}, options, sortOptions);
    } catch (err) {
      console.error('\x1b[31m', `Sort file error - no such file or directory "${sortFile}"`)
      if (options.verbose >= 1) {
        console.error(err)
      }
      process.exit(1)
    }
  }

  // apply filtering by filter file if present
  if (options && options.filterFile) {
    infoOut(`- Filter file:\t\t${options.filterFile}`) // LOG - Filter file
    try {
      let filterOptions = {filterSet: {}}
      filterOptions.filterSet = sy.parse(fs.readFileSync(options.filterFile, 'utf8'));
      options = Object.assign({}, options, filterOptions);
    } catch (err) {
      console.error('\x1b[31m', `Filter file error - no such file or directory "${options.filterFile}"`)
      if (options.verbose >= 1) {
        console.error(err)
      }
      process.exit(1)
    }
  }

  // apply components sorting by alphabet, if file is present
  if (options && options.sortComponentsFile) {
    infoOut(`- Sort Components file:\t${options.sortComponentsFile}`) // LOG - Sort file
    try {
      let sortComponentsOptions = {sortComponentsSet: {}}
      sortComponentsOptions.sortComponentsSet = sy.parse(fs.readFileSync(options.sortComponentsFile, 'utf8'));
      options = Object.assign({}, options, sortComponentsOptions);
    } catch (err) {
      console.error('\x1b[31m', `Sort Components file error - no such file or directory "${options.sortComponentsFile}"`)
      if (options.verbose >= 1) {
        console.error(err)
      }
      process.exit(1)
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
      process.exit(1)
    }
  }

  infoOut(`- Input file:\t\t${oaFile}`) // LOG - Input file

  // Read input file
  let inputContent = fs.readFileSync(oaFile, 'utf8');

  // Convert large number value safely before parsing
  const regexEncodeLargeNumber = /: ([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])(,|\n)/g;  // match > : 123456789.123456789
  inputContent = inputContent.replace(regexEncodeLargeNumber, (rawInput) => {
    const endChar = (rawInput.endsWith(',') ? ',' : '\n');
    const rgx = new RegExp(endChar, "g");
    const number = rawInput.replace(/: /g, '').replace(rgx, '');
    // Handle large numbers safely in javascript
    if (Number(number).toString().includes('e') || number.replace('.', '').length > 15) {
      return `: '${number}==='${endChar}`;
    } else {
      return `: ${number}${endChar}`;
    }
  });

  // Parse input content
  let res = sy.parse(inputContent);
  let output = {};

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
  if (options.casingSet) {
    const resFormat = await openapiFormat.openapiChangeCase(res, options);
    if (resFormat.data) res = resFormat.data
  }

  // Convert the OpenAPI document to OpenAPI 3.1
  if ((options.convertTo || options.convertToVersion) && (options.convertTo === "3.1" || options.convertToVersion === 3.1)) {
    const resVersion = await openapiFormat.openapiConvertVersion(res, options);
    if (resVersion.data) res = resVersion.data
    debugOut(`- OAS version converted to: "${options.convertTo}"`, options.verbose) // LOG - Conversion title
  }

  // Rename title OpenAPI document
  if (options.rename) {
    const resRename = await openapiFormat.openapiRename(res, options);
    if (resRename.data) res = resRename.data
    debugOut(`- OAS.title renamed to: "${options.rename}"`, options.verbose) // LOG - Rename title
  }

  if ((options.output && options.output.indexOf('.json') >= 0) || options.json) {
    // Convert OpenAPI object to JSON string
    output = JSON.stringify(res, null, 2);

    // Decode stringified large number JSON values safely before writing output
    const regexDecodeJsonLargeNumber = /: "([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])==="/g; // match > : "123456789.123456789"===
    output = output.replace(regexDecodeJsonLargeNumber, (strNumber) => {
      const number = strNumber.replace(/: "|"/g, '');
      // Decode large numbers safely in javascript
      if (number.endsWith('===') || number.replace('.', '').length > 15) {
        return strNumber.replace('===', '').replace(/"/g, '')
      } else {
        // Keep stringified number
        return strNumber;
      }
    });
  } else {
    // Convert OpenAPI object to YAML string
    let lineWidth = (options.lineWidth && options.lineWidth === -1 ? Infinity : options.lineWidth) || Infinity;
    output = sy.safeStringify(res, {lineWidth: lineWidth});

    // Decode stringified large number YAML values safely before writing output
    const regexDecodeYamlLargeNumber = /: ([0-9]+(\.[0-9]+)?)\b(?!\.[0-9])===/g; // match > : 123456789.123456789===
    output = output.replace(regexDecodeYamlLargeNumber, (strNumber) => {
      const number = strNumber.replace(/: '|'/g, '');
      // Decode large numbers safely in javascript
      if (number.endsWith('===') || number.replace('.', '').length > 15) {
        return strNumber.replace('===', '').replace(/'/g, '')
      } else {
        // Keep stringified number
        return strNumber;
      }
    });
  }

  if (options.output) {
    try {
      // Write OpenAPI string to file
      fs.writeFileSync(options.output, output, 'utf8');
      infoOut(`- Output file:\t\t${options.output}`) // LOG - config file
    } catch (err) {
      console.error('\x1b[31m', `Output file error - no such file or directory "${options.output}"`)
      if (options.verbose >= 1) {
        console.error(err)
      }
    }
  } else {
    console.log(output);
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
  infoOut(`\x1b[32m✅  OpenAPI ${outputLogFiltered}formatted successfully\x1b[0m`, 99); // LOG - success message
  infoOut(`\x1b[32m${consoleLine}\x1b[0m`); // LOG - horizontal rule
}
