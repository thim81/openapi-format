#!/usr/bin/env node

const openapiFormat = require('../openapi-format');
const program = require('commander');
const {infoTable, infoOut, logOut, debugOut} = require('../utils/logging');
const {stringify} = require('../openapi-format');
const fs = require('fs');
const path = require('path');

// CLI Helper - increase verbosity
function increaseVerbosity(dummyValue, previous) {
  return previous + 1;
}

program
  .argument('[oaFile]')
  .usage('<file> [options]')
  .description('Format an OpenAPI document by ordering, formatting and filtering fields.')
  .option('-o, --output <output>', 'save the formatted OpenAPI file as JSON/YAML')
  .option('-s, --sortFile <sortFile>', 'the file to specify custom OpenAPI fields ordering')
  .option('-k, --casingFile <casingFile>', 'the file to specify casing rules')
  .option('-f, --filterFile <filterFile>', 'the file to specify filter rules')
  .option('-g, --generateFile <generateFile>', 'the file to specify generate rules')
  .option('-l, --overlayFile <overlayFile>', 'the file to specify OpenAPI overlay changes')
  .option('-c, --configFile <configFile>', 'the file with the OpenAPI-format CLI options')
  .option('--no-sort', `don't sort the OpenAPI file`)
  .option('--keepComments', `don't remove the comments from the OpenAPI YAML file`, false)
  .option('--sortComponentsFile <sortComponentsFile>', 'the file with components to sort alphabetically')
  .option('--sortComponentsProps', 'sort properties within schema components alphabetically', false)
  .option('--lineWidth <lineWidth>', 'max line width of YAML output', -1)
  .option('--rename <oaTitle>', 'overwrite the title in the OpenAPI document')
  .option('--convertTo <oaVersion>', 'convert the OpenAPI document to OpenAPI version 3.1')
  .option('--no-bundle', `don't bundle the local and remote $ref in the OpenAPI document`, false)
  .option('--split', 'split the OpenAPI document into a multi-file structure', false)
  .option('--json', 'print the file to stdout as JSON')
  .option('--yaml', 'print the file to stdout as YAML')
  .option('-p, --playground', 'Open config in online playground')
  .version(require('../package.json').version, '--version')
  .option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
  .action(run)
  .exitOverride(err => {
    if (err.code === 'commander.missingArgument' || err.code === 'commander.unknownOption') {
      process.stdout.write('\n');
      program.outputHelp();
    }

    process.exit(err.exitCode);
  });

// Only trigger if the file is run directly
if (require.main === module) {
  program.parse(process.argv);
}

async function run(oaFile, options) {
  // General variables
  let outputLogOptions = '';
  let outputLogFiltered = '';
  let cliLog = {};
  const consoleLine = process.stdout.columns ? '='.repeat(process.stdout.columns) : '='.repeat(80);

  
  infoOut(`${consoleLine}`); // LOG - horizontal rule
  infoOut(`OpenAPI-Format CLI settings:`); // LOG - config file

  // Check for .openapiformatrc
  let defaultOptions = {};
  if (!options?.configFile) {
    const defaultConfigFile = path.resolve(process.cwd(), '.openapiformatrc');
    if (fs.existsSync(defaultConfigFile)) {
      defaultOptions = await openapiFormat.parseFile(defaultConfigFile);
      infoOut(`- .openapiformatrc:\t${defaultConfigFile}`); // LOG - config file
    }
  }

  // Apply options from config file if present
  let configOptions = {};
  if (options?.configFile) {
    try {
      configOptions = await openapiFormat.parseFile(options.configFile);
      infoOut(`- Config file:\t\t${options.configFile}`); // LOG - config file
    } catch (err) {
      console.error('\x1b[31m', 'Config file error - no such file or directory "' + options.configFile + '"');
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Merge .openapiformatrc and configOptions
  configOptions = Object.assign({}, defaultOptions, configOptions);
  options.lineWidth = configOptions?.lineWidth ?? options.lineWidth;
  options.sort = configOptions?.sort ?? options.sort;
  options.bundle = configOptions?.bundle ?? options.bundle;

  // Merge configOptions and CLI options
  options = Object.assign({}, configOptions, options);
  if (options['no-sort'] && options['no-sort'] === true) {
    options.sort = !options['no-sort'];
    delete options['no-sort'];
  }
  if (options['no-bundle'] && options['no-bundle'] === true) {
    options.bundle = !options['no-bundle'];
    delete options['no-bundle'];
  }

  // LOG - Render info table with options
  outputLogOptions = infoTable(options, options.verbose);

  // Apply ordering by priority file if present
  if (options && options.sort === true) {
    let sortFile = options.sortFile ? options.sortFile : __dirname + '/../defaultSort.json';
    let sortFileName = options.sortFile ? options.sortFile : '(defaultSort.json)';
    try {
      let sortOptions = {sortSet: {}};
      infoOut(`- Sort file:\t\t${sortFileName}`); // LOG - sort file
      sortOptions.sortSet = await openapiFormat.parseFile(sortFile);
      sortOptions.sortSet = options.sortSet
        ? Object.assign({}, sortOptions.sortSet, options.sortSet)
        : sortOptions.sortSet;
      options = Object.assign({}, options, sortOptions);
    } catch (err) {
      console.error('\x1b[31m', `Sort file error - no such file or directory "${sortFile}"`);
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Apply filtering by filter file if present
  if (options && options.filterFile) {
    infoOut(`- Filter file:\t\t${options.filterFile}`); // LOG - Filter file
    try {
      let filterOptions = {filterSet: {}};
      filterOptions.filterSet = await openapiFormat.parseFile(options.filterFile);
      options = Object.assign({}, options, filterOptions);
    } catch (err) {
      console.error('\x1b[31m', `Filter file error - no such file or directory "${options.filterFile}"`);
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Apply components sorting by alphabet, if file is present
  if (options && options.sortComponentsFile) {
    infoOut(`- Sort Components file:\t${options.sortComponentsFile}`); // LOG - Sort file
    try {
      let sortComponentsOptions = {sortComponentsSet: {}};
      sortComponentsOptions.sortComponentsSet = await openapiFormat.parseFile(options.sortComponentsFile);
      options = Object.assign({}, options, sortComponentsOptions);
    } catch (err) {
      console.error(
        '\x1b[31m',
        `Sort Components file error - no such file or directory "${options.sortComponentsFile}"`
      );
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Apply casing based on casing file if present
  if (options && options.casingFile) {
    infoOut(`- Casing file:\t\t${options.casingFile}`); // LOG - Casing file
    try {
      let casingOptions = {casingSet: {}};
      casingOptions.casingSet = await openapiFormat.parseFile(options.casingFile);
      options = Object.assign({}, options, casingOptions);
    } catch (err) {
      console.error('\x1b[31m', `Casing file error - no such file or directory "${options.casingFile}"`);
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Generate elements based on generate file if present
  if (options && options.generateFile) {
    infoOut(`- Generate file:\t${options.generateFile}`); // LOG - Casing file
    try {
      let generateOptions = {generateSet: {}};
      generateOptions.generateSet = await openapiFormat.parseFile(options.generateFile);
      options = Object.assign({}, options, generateOptions);
    } catch (err) {
      console.error('\x1b[31m', `Generate file error - no such file or directory "${options.generateOptions}"`);
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Set OpenAPI overlay actions
  if (options && options.overlayFile) {
    infoOut(`- Overlay file:\t\t${options.overlayFile}`); // LOG - Casing file
    try {
      let overlayOptions = {overlaySet: {}};
      overlayOptions.overlaySet = await openapiFormat.parseFile(options.overlayFile);
      options = Object.assign({}, options, overlayOptions);
    } catch (err) {
      console.error('\x1b[31m', `Overlay file error - no such file or directory "${options.overlayOptions}"`);
      if (options.verbose >= 1) {
        console.error(err);
      }
      process.exit(1);
    }
  }

  // Allow missing input file if overlay extends is provided
  if (!oaFile) {
    const hasOverlay = !!options?.overlaySet;
    const extendsRef = options?.overlaySet?.extends;
    if (extendsRef) {
      // Resolve local relative paths against the overlay file location
      const isRemote = typeof extendsRef === 'string' && (extendsRef.startsWith('http://') || extendsRef.startsWith('https://'));
      if (isRemote) {
        oaFile = extendsRef;
      } else {
        const baseDir = options?.overlayFile ? path.dirname(path.resolve(options.overlayFile)) : process.cwd();
        oaFile = path.isAbsolute(extendsRef) ? extendsRef : path.resolve(baseDir, extendsRef);
      }
      infoOut(`- Input file (extends):\t${oaFile}`);
    } else {
      if (!hasOverlay) {
        console.error('Please provide a file path for the OpenAPI document');
      } else {
        console.error('Please provide an input file or an overlay with an "extends" property');
      }
      return;
    }
  }

  let resObj = {};
  let output = {};
  let input = {};
  let fileOptions = {keepComments: options.keepComments ?? false, bundle: options.bundle ?? true};

  try {
    if (!options?.overlaySet?.extends) {
      infoOut(`- Input file:\t\t${oaFile}`); // LOG - Input file (standard)
    }

    // Parse input content
    resObj = await openapiFormat.parseFile(oaFile, fileOptions);
    input = resObj;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('\x1b[31m', `Input file error - Failed to read file: ${err.message}`);
      process.exit(1);
    }
    console.error('\x1b[31m', `Input file error - Failed to read file: ${oaFile}`);
    process.exit(1);
  }

  // Generate elements for OpenAPI document
  if (options.generateSet) {
    const resFormat = await openapiFormat.openapiGenerate(resObj, options);
    if (resFormat.data) resObj = resFormat.data;
  }

  // Filter OpenAPI document
  if (options.filterSet) {
    const resFilter = await openapiFormat.openapiFilter(resObj, options);
    if (resFilter?.resultData && resFilter.resultData.unusedComp) {
      cliLog.unusedComp = resFilter.resultData.unusedComp;
    }
    outputLogFiltered = `filtered & `;
    resObj = resFilter.data;
  }

  // Apply OpenAPI overlay actions
  if (options.overlaySet) {
    const resOverlay = await openapiFormat.openapiOverlay(resObj, options);
    if (
      resOverlay?.resultData &&
      (resOverlay.resultData.unusedActions ||
        resOverlay.resultData.totalUsedActions ||
        resOverlay.resultData.totalActions)
    ) {
      cliLog.unusedActions = resOverlay.resultData.unusedActions || [];
      cliLog.totalUsedActions = resOverlay.resultData.totalUsedActions || 0;
      cliLog.totalUnusedActions = resOverlay.resultData.totalUnusedActions || 0;
      cliLog.totalActions = resOverlay.resultData.totalActions || 0;
    }
    resObj = resOverlay.data;
  }

  // Format & Order OpenAPI document
  if (options.sort === true) {
    const resFormat = await openapiFormat.openapiSort(resObj, options);
    if (resFormat.data) resObj = resFormat.data;
  }

  // Change case OpenAPI document
  if (options.casingSet) {
    const resFormat = await openapiFormat.openapiChangeCase(resObj, options);
    if (resFormat.data) resObj = resFormat.data;
  }

  // Convert the OpenAPI document to OpenAPI 3.1
  if (
    (options.convertTo && options.convertTo.toString() === '3.1') ||
    (options.convertToVersion && options.convertToVersion === 3.1)
  ) {
    const resVersion = await openapiFormat.openapiConvertVersion(resObj, options);
    if (resVersion.data) resObj = resVersion.data;
    debugOut(`- OAS version converted to: "${options.convertTo}"`, options.verbose); // LOG - Conversion title
  }

  // Rename title OpenAPI document
  if (options.rename) {
    const resRename = await openapiFormat.openapiRename(resObj, options);
    if (resRename.data) resObj = resRename.data;
    debugOut(`- OAS.title renamed to: "${options.rename}"`, options.verbose); // LOG - Rename title
  }

  options.yamlComments = fileOptions.yamlComments || {};
  if (options.output) {
    if (options.split !== true) {
      try {
        // Write OpenAPI string to single file
        await openapiFormat.writeFile(options.output, resObj, options);
        infoOut(`- Output file:\t\t${options.output}`); // LOG - config file
      } catch (err) {
        console.error('\x1b[31m', `Output file error - no such file or directory "${options.output}"`);
        if (options.verbose >= 1) {
          console.error(err);
        }
      }
    } else {
      try {
        // Write Split files
        await openapiFormat.openapiSplit(resObj, options);
        infoOut(`- Output location:\t${options.output}`); // LOG - config file
      } catch (err) {
        console.error('\x1b[31m', `Split error - no such file or directory "${options.output}"`);
        if (options.verbose >= 1) {
          console.error(err);
        }
      }
    }
  } else {
    // Stringify OpenAPI object
    output = await openapiFormat.stringify(resObj, options);
    // Print OpenAPI string to stdout
    console.log(output);
  }

  if (outputLogOptions) {
    //&& options.verbose > 2) {
    // Show options
    debugOut(`${consoleLine}\n`, options.verbose); // LOG - horizontal rule
    debugOut(`OpenAPI-Format CLI options:`, options.verbose); // LOG - config file
    debugOut(`${outputLogOptions}`, options.verbose);
  }

  // Show unused components
  if (cliLog && cliLog.unusedComp) {
    // List unused component
    const unusedComp = cliLog.unusedComp;
    const keys = Object.keys(unusedComp || {});
    let count = 0;
    const cliOut = [];
    keys.map(comp => {
      if (unusedComp && unusedComp[comp] && unusedComp[comp].length > 0) {
        unusedComp[comp].forEach(value => {
          const spacer = comp === 'requestBodies' ? `\t` : `\t\t`;
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

  // Show unused components
  if (options.overlaySet && (cliLog?.totalActions || cliLog?.totalUsedActions || cliLog?.unusedActions)) {
    // Log summary of actions
    logOut(`${consoleLine}`, options.verbose); // LOG - horizontal rule
    logOut(`OpenAPI Overlay actions summary:`, options.verbose);
    logOut(`- Total actions: \t${cliLog.totalActions}`, options.verbose);
    logOut(`- Applied actions: \t${cliLog.totalUsedActions}`, options.verbose);
    logOut(`- Unused actions: \t${cliLog.totalUnusedActions}`, options.verbose);

    const cliOut = [];
    cliLog.unusedActions.forEach(action => {
      const description = action.description || 'No description provided';
      cliOut.push(
        `- Target: ${action.target}\n  Type: ${action.update ? 'update' : action.remove ? 'remove' : 'unknown'}`
      );
    });

    if (cliLog.unusedActions.length > 0) {
      // Log unused actions
      logOut(`${consoleLine}`, options.verbose); // LOG - horizontal rule
      logOut(`Unused overlay actions:`, options.verbose);
      logOut(cliOut.join('\n'), options.verbose);
    }
  }

  // Final result
  infoOut(`\x1b[32m${consoleLine}\x1b[0m`); // LOG - horizontal rule
  infoOut(`\x1b[32m✅  OpenAPI ${outputLogFiltered}formatted successfully\x1b[0m`, 99); // LOG - success message
  infoOut(`\x1b[32m${consoleLine}\x1b[0m`); // LOG - horizontal rule

  if (options?.playground) {
    try {
      const playgroundEndpoint = 'https://openapi-format-playground.vercel.app/api/share';
      const config = {};

      if (options.sortSet !== undefined) config.sortSet = await stringify(options.sortSet);
      if (options.filterSet !== undefined) config.filterSet = await stringify(options.filterSet);
      // if (options.casingSet !== undefined) config.casingSet = await stringify(options.casingSet);
      if (options.sort !== undefined) config.sort = options.sort;
      // if (options.rename !== undefined) config.rename = options.rename;
      // if (options.convertTo !== undefined) config.convertTo = options.convertTo;
      if (options.format === 'json' || options.format === 'yaml') config.outputLanguage = options.format;

      const payload = {
        openapi: await stringify(input, options),
        config: config
      };

      if (!process.env.CI) {
        const response = await fetch(playgroundEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Source: 'openapi-format-cli'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const shareUrl = responseData?.shareUrl;
        const hyperlink = `\x1b]8;;${shareUrl}\x1b\\\x1b[34m\x1b[4mClick here to visit the online playground\x1b[0m\x1b]8;;\x1b\\`;
        infoOut(`🌐 ${hyperlink}`);
        infoOut(`\x1b[34m${consoleLine}\x1b[0m`); // LOG - horizontal rule
      } else {
        console.log('Running in CI/CD environment, no Share URL generated');
      }
    } catch (err) {
      console.error('\x1b[31m', 'Error generating openapi-format playground URL:', err.message);
    }
  }

  return output;
}

module.exports = {run};
