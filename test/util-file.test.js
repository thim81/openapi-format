const fs = require('fs');
const path = require('path');
const {
  parseFile,
  writeFile,
  decodeLargeNumbers,
  encodeLargeNumbers,
  getRemoteFile,
  getLocalFile, stringify
} = require("../util-file");
const yaml = require('@stoplight/yaml');
const {describe} = require("@jest/globals");

describe('openapi-format CLI file tests', () => {

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

    test('should throw an error for invalid file', () => {
      const inputFilePath = 'nonexistentfile.yaml';
      expect(async () => await parseFile(inputFilePath)).rejects.toThrowError('ENOENT');
    });

    test('should throw an error for invalid YAML content', () => {
      const inputFilePath = path.join(__dirname, 'test-files', 'invalid.yaml');
      expect(async () => await parseFile(inputFilePath)).rejects.toThrowError('ENOENT');
    });

    test('should throw an error for invalid JSON content', () => {
      const inputFilePath = path.join(__dirname, 'test-files', 'invalid.json');
      expect(async () => await parseFile(inputFilePath)).rejects.toThrowError('ENOENT');
    });
  });

  describe('writeFile function', () => {
    const outputDir = path.join(__dirname, 'test-output');
    const jsonOutputFile = path.join(outputDir, 'output.json');
    const yamlOutputFile = path.join(outputDir, 'output.yaml');

    // Create a temporary directory for testing
    beforeAll(() => {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
    });

    // Cleanup after testing
    afterAll(() => {
      if (fs.existsSync(jsonOutputFile)) {
        fs.unlinkSync(jsonOutputFile);
      }
      if (fs.existsSync(yamlOutputFile)) {
        fs.unlinkSync(yamlOutputFile);
      }
      if (fs.existsSync(outputDir)) {
        fs.rmdirSync(outputDir);
      }
    });

    test('should write YAML file correctly', async () => {
      const data = {key: 'value'};
      const options = {lineWidth: 80};
      await writeFile(yamlOutputFile, data, options)

      const writtenContent = fs.readFileSync(yamlOutputFile, 'utf8');
      const parsedContent = yaml.parse(writtenContent);
      expect(parsedContent).toEqual(data);
    });

    test('should write JSON file correctly', async () => {
      const data = {key: 'value'};
      const options = {};
      await writeFile(jsonOutputFile, data, options);

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

  describe('stringify function', () => {
    test('should stringify object to YAML format', async () => {
      const obj = {key: 'value'};
      const options = {format: 'yaml', lineWidth: 80};

      const result = await stringify(obj, options);

      const expectedYAML = yaml.safeStringify(obj, {lineWidth: 80});
      expect(result).toEqual(expectedYAML);
    });

    test('should stringify object to JSON format', async () => {
      const obj = {key: 'value'};
      const options = {format: 'json'};

      const result = await stringify(obj, options);

      const expectedJSON = JSON.stringify(obj, null, 2);
      expect(result).toEqual(expectedJSON);
    });

    test('should default to YAML format when format is not explicitly set to JSON', async () => {
      const obj = {key: 'value'};
      const options = {otherOption: 'someValue'};

      const result = await stringify(obj, options);

      const expectedYAML = yaml.safeStringify(obj, {lineWidth: Infinity});
      expect(result).toEqual(expectedYAML);
    });

    test('should handle large numbers in YAML format', async () => {
      const obj = {largeNumber: 9007199254740991};
      const options = {format: 'yaml'};

      const result = await stringify(obj, options);

      const expectedYAML = yaml.safeStringify(obj, {lineWidth: Infinity});
      expect(result).toEqual(expectedYAML);
    });

    test('should handle large numbers in JSON format', async () => {
      const obj = {largeNumber: 9007199254740991};
      const options = {format: 'json'};

      const result = await stringify(obj, options);

      const expectedJSON = JSON.stringify(obj, null, 2);
      expect(result).toEqual(expectedJSON);
    });
  });

  describe('getLocalFile function', () => {
    const validFilePath = __dirname + '/json-custom/customSort.json';
    const invalidFilePath = 'nonexistent-file.txt';

    test('should read local file content successfully', async () => {
      const content = await getLocalFile(validFilePath);
      const fileContent = fs.readFileSync(validFilePath, 'utf8');
      expect(content).toEqual(fileContent);
      // Add more assertions based on the expected content or structure
    });

    test('should throw an error for nonexistent local file', async () => {
      await expect(getLocalFile(invalidFilePath)).rejects.toThrow();
    });
  });

  describe('getRemoteFile function', () => {
    const validRemoteFilePath = 'https://raw.githubusercontent.com/thim81/openapi-format/main/defaultFilter.json';
    const validFilePath = __dirname + '/../defaultFilter.json';

    const invalidRemoteFilePath = 'https://example.com/nonexistent-file.txt';

    test('should download remote file content successfully', async () => {
      const content = await getRemoteFile(validRemoteFilePath);
      const fileContent = fs.readFileSync(validFilePath, 'utf8');
      expect(content).toEqual(fileContent);
    });

    test('should throw an error for nonexistent remote file', async () => {
      try {
        await getRemoteFile(invalidRemoteFilePath);
      } catch (err) {
        expect(err.message).toMatch(/404 Not Found/);
      }
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

});

