const fs = require('fs');
const path = require('path');
const {parseFile, writeFile, decodeLargeNumbers, encodeLargeNumbers} = require("../util-file");
const yaml = require('@stoplight/yaml');

describe('parseFile function', () => {
  test('should parse YAML file correctly', async () => {
    const inputFilePath = path.join(__dirname, 'yaml-default/input.yaml');
    const parsedContent = await parseFile(inputFilePath);
    expect(parsedContent).toEqual(yaml.parse(fs.readFileSync(inputFilePath, 'utf8')));
  });

  test('should parse JSON file correctly', async () => {
    const inputFilePath = path.join(__dirname, 'json-default/input.json');
    const parsedContent = await parseFile(inputFilePath);
    expect(parsedContent).toEqual(JSON.parse(fs.readFileSync(inputFilePath, 'utf8')));
  });

  test('should throw an error for invalid file',  () => {
    const inputFilePath = 'nonexistentfile.yaml';
    expect(async () => await parseFile(inputFilePath)).rejects.toThrowError('ENOENT');
  });

  // test('should throw an error for invalid YAML content', () => {
  //   const inputFilePath = path.join(__dirname, 'test-files', 'invalid.yaml');
  //   expect(async () => await parseFile(inputFilePath)).toThrow();
  // });
  //
  // test('should throw an error for invalid JSON content', () => {
  //   const inputFilePath = path.join(__dirname, 'test-files', 'invalid.json');
  //   expect(async () => await parseFile(inputFilePath)).toThrow();
  // });
});

describe('writeFile function', () => {
  const outputDir = path.join(__dirname, 'test-output');
  const outputFile = path.join(outputDir, 'output.yaml');

  // Create a temporary directory for testing
  beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  });

  // Cleanup after testing
  afterAll(() => {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    if (fs.existsSync(outputDir)) {
      fs.rmdirSync(outputDir);
    }
  });

  test('should write YAML file correctly', () => {
    const data = {key: 'value'};
    const options = {lineWidth: 80};
    expect(async () => await writeFile(outputFile, data, options)).not.toThrow();

    const writtenContent = fs.readFileSync(outputFile, 'utf8');
    const parsedContent = yaml.parse(writtenContent);
    expect(parsedContent).toEqual(data);
  });

  test('should write JSON file correctly', () => {
    const data = {key: 'value'};
    const options = {};
    const jsonOutputFile = path.join(outputDir, 'output.json');
    expect(async () => await writeFile(jsonOutputFile, data, options)).not.toThrow();

    const writtenContent = fs.readFileSync(jsonOutputFile, 'utf8');
    const parsedContent = JSON.parse(writtenContent);
    expect(parsedContent).toEqual(data);
  });

  test('should throw an error for invalid output file path', () => {
    const data = {key: 'value'};
    const options = {};
    const invalidOutputFile = '/invalid-directory/invalid-file.yaml';
    expect(async () => await writeFile(invalidOutputFile, data, options)).rejects.toThrowError('ENOENT');
  });
});

describe('decodeLargeNumbers function', () => {
  test('should decode large number in YAML', () => {
    const input = 'key: 123456789.123456789===';
    const output = decodeLargeNumbers(input);
    expect(output).toBe('key: 123456789.123456789');
  });

  test('should decode large number in JSON', () => {
    const input = ' "key": "123456789.123456789==="';
    const output = decodeLargeNumbers(input, true);
    expect(output).toBe(' "key": 123456789.123456789');
  });

  test('should not modify regular numbers in YAML', () => {
    const input = 'key: 42';
    const output = decodeLargeNumbers(input);
    expect(output).toBe('key: 42');
  });

  test('should not modify regular numbers in JSON', () => {
    const input = ' "key": 42';
    const output = decodeLargeNumbers(input, true);
    expect(output).toBe(' "key": 42');
  });

  test('should decode numbers with === in YAML', () => {
    const input = 'key: 42===';
    const output = decodeLargeNumbers(input);
    expect(output).toBe('key: 42');
  });

  test('should decode numbers with === in JSON', () => {
    const input = ' "key": "42==="';
    const output = decodeLargeNumbers(input, true);
    expect(output).toBe(' "key": 42');
  });

  test('should handle multiple occurrences in YAML', () => {
    const input = 'key: 123===\nlarge: 123456789.123456789===\n';
    const output = decodeLargeNumbers(input);
    expect(output).toBe('key: 123\nlarge: 123456789.123456789\n');
  });

  test('should handle multiple occurrences in JSON', () => {
    const input = ' "key": "123==="\n "large: "123456789.123456789==="\n ';
    const output = decodeLargeNumbers(input, true);
    expect(output).toBe(' "key": 123\n "large: 123456789.123456789\n ');
  });
});

describe('encodeLargeNumbers function', () => {
  test('should encode large number in YAML', () => {
    const input = 'key: 123456789.123456789\n';
    const output = encodeLargeNumbers(input);
    expect(output).toBe('key: "123456789.123456789==="\n');
  });

  test('should encode large number in JSON', () => {
    const input = '"key": 123456789.123456789,';
    const output = encodeLargeNumbers(input);
    expect(output).toBe('"key": "123456789.123456789===",');
  });

  test('should encode & decode large number in YAML', () => {
    const input = 'key: 123456789.123456789\n';
    const output = encodeLargeNumbers(input);
    const result = decodeLargeNumbers(output, true);
    expect(result).toBe(input);
  });

  test('should encode & decode large number in JSON', () => {
    const input = '"key": 123456789.123456789,';
    const output = encodeLargeNumbers(input);
    const result = decodeLargeNumbers(output, true);
    expect(result).toBe(input);
  });

  test('should not modify regular numbers in YAML', () => {
    const input = 'key: 42,';
    const output = encodeLargeNumbers(input);
    expect(output).toBe('key: 42,');
  });

  test('should not modify regular numbers in JSON', () => {
    const input = ' "key": 42,';
    const output = encodeLargeNumbers(input);
    expect(output).toBe(' "key": 42,');
  });

  test('should handle multiple occurrences in YAML', () => {
    const input = 'large: 123456789.123456789\nkey: 123\nother: 456';
    const output = encodeLargeNumbers(input);
    expect(output).toBe('large: "123456789.123456789==="\nkey: 123\nother: 456');
  });

  test('should handle multiple occurrences in JSON', () => {
    const input = ' "large: 123456789.123456789,\n key": "123",\n "other": "456"';
    const output = encodeLargeNumbers(input);
    expect(output).toBe(' "large: "123456789.123456789===",\n key": "123",\n "other": "456"');
  });
});

