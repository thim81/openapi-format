const testUtils = require('../test/__utils__/test-utils');
const fs = require('fs');
const {describe, it, expect} = require('@jest/globals');
const {getLocalFile} = require('../utils/file');

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

  it('should use the configFile with all settings', async () => {
    // const path = `test/__utils__`;
    const inputFile = `test/__utils__/mockOpenApi.json`;
    const outputFile = `test/_cli-configfile/output.json`;
    const snapFile = `test/_cli-configfile/snap.json`;
    const snap = await getLocalFile(snapFile);
    const setting = `test/_cli-configfile/configFile.json`;

    let result = await testUtils.cli([inputFile, `--configFile ${setting}`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    const output = await getLocalFile(outputFile);
    expect(output).toStrictEqual(snap);
  });

  it('should load the default .openapiformatrc if configFile is not provided', async () => {
    // Mock the existence of the .openapiformatrc file
    const defaultConfigPath = '.openapiformatrc';
    const mockConfigContent = `
    {
      "sort": true,
      "lineWidth": 80
    }
    `;

    // Mocking the file system to simulate the existence of .openapiformatrc
    jest.spyOn(fs, 'existsSync').mockImplementation(path => {
      return path === defaultConfigPath; // Simulate .openapiformatrc exists
    });

    jest.spyOn(fs, 'readFileSync').mockImplementation(path => {
      if (path === defaultConfigPath) {
        return mockConfigContent;
      }
    });

    const inputFile = `test/yaml-default/input.yaml`;
    let result = await testUtils.cli([inputFile], '.');
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();

    // Clean up mocks
    fs.existsSync.mockRestore();
    fs.readFileSync.mockRestore();
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

  it('should bundle reference', async () => {
    const path = `test/yaml-ref-quotes`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/bundled.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should not bundle reference', async () => {
    const path = `test/yaml-ref-quotes`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);

    let result = await testUtils.cli([inputFile, `--no-bundle`, `--no-sort`], '.');
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(result.stderr)).toStrictEqual(sanitize(output));
  });

  it('should split the openapi file', async () => {
    const path = `test/_split`;
    const inputFile = `../__utils__/train.yaml`;
    const outputFile = `output.yaml`;

    const snap = await getLocalFile(`${path}/snap.yaml`);
    const snap_station = await getLocalFile(`${path}/snap_station.yaml`);
    const snap_station_id = await getLocalFile(`${path}/snap_station_id.yaml`);

    let result = await testUtils.cli([inputFile,`--output ${outputFile}`, `--split`, `--no-sort`], path);

    const outputPath = `${path}/${outputFile}`
    const outputStationPath = `${path}/paths/stations_{station_id}.yaml`
    const outputStationIdPath = `${path}/components/parameters/StationId.yaml`
    // const outputStationSchemaPath = `${path}/components/schemas/Station.yaml`
    const output = await getLocalFile(outputPath);
    const output_station = await getLocalFile(outputStationPath);
    const output_station_id = await getLocalFile(outputStationIdPath);

    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
    expect(result.stdout).toMatchSnapshot();
    expect(sanitize(snap)).toStrictEqual(sanitize(output));
    expect(sanitize(snap_station)).toStrictEqual(sanitize(output_station));
    expect(sanitize(snap_station_id)).toStrictEqual(sanitize(output_station_id));

    fs.rmSync(`${path}/paths`, { recursive: true, force: true });
    fs.rmSync(`${path}/components`, { recursive: true, force: true });
    fs.unlinkSync(outputPath);
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

  it('should keep the comments for YAML', async () => {
    const path = `test/yaml-no-sort-keep-comments`;
    const inputFile = `${path}/input.yaml`;
    const outputFile = `${path}/output.yaml`;
    const output = await getLocalFile(outputFile);
    const setting = `${path}/customFilter.yaml`;

    let result = await testUtils.cli(
      [inputFile, `--filterFile ${setting}`, `--keepComments`, `--no-sort`, `-vvv`],
      '.'
    );
    // console.log('result', result)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('formatted successfully');
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
