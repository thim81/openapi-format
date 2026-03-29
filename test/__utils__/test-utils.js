const fs = require('fs');
const os = require('os');
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
  const tmpOutput = path.join(os.tmpdir(), `openapi-format-${folder}-output.${outType}`);

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

  let result = await cli([`${inputFile}`, `--configFile options.yaml`, `--output ${tmpOutput}`], testPath);

  try {
    outputAfter = await parseFile(tmpOutput);
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

function cli(args, cwd, envOverrides = {}) {
  return new Promise(resolve => {
    const env = {...process.env, ...envOverrides};
    if (env.FORCE_COLOR && env.NO_COLOR) {
      delete env.NO_COLOR;
    }

    exec(`node ${path.resolve('./bin/cli')} ${args.join(' ')}`, {cwd, env}, (error, stderr, stdout) => {
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
