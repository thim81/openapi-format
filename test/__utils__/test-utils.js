const fs = require('fs');
const sy = require('@stoplight/yaml');
const {exec} = require('child_process');
const path = require('path');
const {parseFile, stringify} = require('../../utils/file');

async function loadTest(folder, inputType = 'yaml', outType = 'yaml') {
  let input,
    outputBefore,
    outputAfter = {};
  const testPath = `./test/${folder}`;
  const inputFile = `input.${inputType}`;
  const inputPath = `./test/${folder}/${inputFile}`;
  const outputFile = `output.${outType}`;
  const outputPath = `./test/${folder}/${outputFile}`;

  try {
    input = await parseFile(inputPath);
  } catch (err) {
    // File not found = {} will be used
  }

  try {
    outputBefore = await parseFile(outputPath);
  } catch (err) {
    // File not found = {} will be used
  }

  let result = await cli([`${inputFile}`, `--configFile options.yaml`], testPath);

  try {
    outputAfter = await parseFile(outputPath);
  } catch (err) {
    //
  }

  return {
    result: result,
    input: input,
    outputBefore: await stringify(outputBefore),
    outputAfter: await stringify(outputAfter)
  };
}

function cli(args, cwd) {
  return new Promise(resolve => {
    exec(`node ${path.resolve('./bin/cli')} ${args.join(' ')}`, {cwd}, (error, stderr, stdout) => {
      resolve({
        code: error && error.code ? error.code : 0,
        error,
        stdout,
        stderr
      });
    });
  });
}

module.exports = {
  loadTest: loadTest,
  cli: cli
};
