const testUtils = require('../test/__utils__/test-utils');
const fs = require('fs');
const {describe, it, expect} = require('@jest/globals');
const {getLocalFile, getRemoteFile, parseFile} = require('../utils/file');

describe('openapi-format CLI command', () => {
  it('should output the help', async () => {
    let result = await testUtils.cli([`--help`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stderr).toMatchSnapshot();
  });

  it('should use a local file with the default sort', async () => {
    const path = `test/yaml-default`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use a remote file with default sort', async () => {
    const path = `test/yaml-default`;
    const inputFile = `https://raw.githubusercontent.com/thim81/openapi-format/main/test/yaml-default/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile, 'utf8');

    let result = await testUtils.cli([inputFile], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the default sort', async () => {
    const path = `test/yaml-default`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should stop and show error', async () => {
    const path = `test/yaml-default`;
    const inputFile = `${path}/input.yaml`;

    let result = await testUtils.cli([inputFile, `--sortFile foobar`], '.');
    // console.log('result', result)
    expect(result.code).toBe(1);
    expect(result.stdout).toMatchSnapshot();
  });

  it('should stop and show error about local file', async () => {
    const path = `test/yaml-default`;
    const inputFile = `${path}/foo.yaml`;

    let result = await testUtils.cli([inputFile], '.');
    // console.log('result', result)
    expect(result.code).toBe(1);
    expect(result.stdout).toMatchSnapshot();
  });

  it('should stop and show error about remote file', async () => {
    const inputFile = `https://raw.githubusercontent.com/thim81/openapi-format/main/test/yaml-default/foo.yaml`;

    let result = await testUtils.cli([inputFile], '.');
    // console.log('result', result)
    expect(result.code).toBe(1);
    expect(result.stdout).toMatchSnapshot();
  });

  it('should use the sortFile', async () => {
    const path = `test/yaml-custom`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customSort.yaml`;

    let result = await testUtils.cli([inputFile, `--sortFile ${setting}`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the casingFile', async () => {
    const path = `test/yaml-casing`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customCasing.yaml`;

    let result = await testUtils.cli([inputFile, `--casingFile ${setting}`, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the generateFile', async () => {
    const path = `test/yaml-generate-operationId-overwrite`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customGenerate.yaml`;

    let result = await testUtils.cli([inputFile, `--generateFile ${setting}`, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the filterFile', async () => {
    const path = `test/yaml-filter-custom`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customFilter.yaml`;

    let result = await testUtils.cli([inputFile, `--filterFile ${setting}`, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it.skip('should generate a playground share URL', async () => {
    const path = `test/yaml-filter-custom`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customFilter.yaml`;

    let result = await testUtils.cli([inputFile, `--filterFile ${setting}`, `--playground`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('🌐');
  });

  it('should use the sortComponentsFile', async () => {
    const path = `test/yaml-sort-components`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customSortComponents.yaml`;

    let result = await testUtils.cli([inputFile, `--sortComponentsFile ${setting}`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the no-sort', async () => {
    const path = `test/yaml-no-sort`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = fs.readFileSync(outputFile, 'utf8');

    let result = await testUtils.cli([inputFile, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should show unused components', async () => {
    const path = `test/yaml-filter-unused-components`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customFilter.yaml`;

    let result = await testUtils.cli([inputFile, `--filterFile ${setting}`, `--no-sort`, `-v`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the rename', async () => {
    const path = `test/yaml-rename`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile, `--rename "OpenAPI Petstore - OpenAPI 3.0"`, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should not convert large numbers in YAML', async () => {
    const path = `test/yaml-default-bug-big-numbers`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should not convert large numbers in JSON', async () => {
    const path = `test/json-default-bug-big-numbers`;
    const inputFile = `${path}/input.json`;
    const outputFile = `${path}/output.json`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile, `--json`, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should use the convert version', async () => {
    const path = `test/yaml-convert-3.1`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile, `--convertTo "3.1"`, `--no-sort`, `-vvv`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toContain('OAS version converted to: "3.1"');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });
});

/**
 * Sanitize the output of the CLI
 * @param {string} str
 * @returns {*|string}
 */
function sanitize(str) {
  if (!str) return str;
  return str.replace(/^\s+|\s+$/g, '').trim();
}
