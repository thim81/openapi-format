const fs = require("fs");
const sy = require("@stoplight/yaml");
const {exec} = require("child_process");
const path = require("path");

async function loadRawTest(folder, inputType = 'yaml', outType = 'yaml') {
  let input = outputBefore = outputAfter = '{}'
  const testPath = `./test/${folder}`
  const inputFile = `input.${inputType}`
  const inputPath = `./test/${folder}/${inputFile}`
  const outputFile = `output.${outType}`
  const outputPath = `./test/${folder}/${outputFile}`

  try {
    input = fs.readFileSync(inputPath, 'utf8');
  } catch (err) {
    // File not found = {} will be used
  }

  try {
    outputBefore = fs.readFileSync(outputPath, 'utf8');
  } catch (err) {
    // File not found = {} will be used
  }

  let result = await cli([`${inputFile}`, `--configFile options.yaml`], testPath);

  try {
    outputAfter = fs.readFileSync(outputPath, 'utf8');
  } catch (err) {
    //
  }

  return {result: result, input: input, outputBefore: outputBefore, outputAfter: outputAfter}
}

async function loadTest(folder, inputType = 'yaml', outType = 'yaml') {
  let raw = await loadRawTest(folder, inputType, outType)

  raw.input = (inputType === 'json') ? JSON.parse(raw.input) : sy.parse(raw.input);
  raw.outputBefore = (outType === 'json') ? JSON.parse(raw.outputBefore) : sy.parse(raw.outputBefore);
  raw.outputAfter = (outType === 'json') ? JSON.parse(raw.outputAfter) : sy.parse(raw.outputAfter);

  return raw
}

function cli(args, cwd) {
  return new Promise(resolve => {
    exec(
      `node ${path.resolve("./bin/cli")} ${args.join(" ")}`,
      {cwd},
      (error, stderr, stdout,) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        });
      }
    );
  });
}

module.exports = {
  loadRawTest: loadRawTest,
  loadTest: loadTest,
  cli: cli
};
