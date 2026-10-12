const fs = require('fs');
const os = require('os');
const path = require('path');
const yaml = require('yaml');
const {parseString, parseFile, stringify} = require('../utils/file');

describe('YAML block scalar style preservation', () => {
  test('preserves block styles by default', async () => {
    const input = `description: |-\n  ${'word '.repeat(35).trim()}\n  second line\nsummary: >-\n  folded\n`;
    const options = {lineWidth: 40};
    const output = await stringify(await parseString(input, options), options);
    const doc = yaml.parseDocument(output);
    expect(yaml.parse(output)).toEqual(yaml.parse(input));
    expect(doc.get('description', true).type).toBe('BLOCK_LITERAL');
    expect(doc.get('summary', true).type).toBe('BLOCK_FOLDED');
  });

  test('rejects unsupported block styles', async () => {
    await expect(stringify({description: 'text'}, {yamlBlockStyle: 'invalid'})).rejects.toThrow('Invalid yamlBlockStyle');
  });

  test.each(['literal', 'folded'])('enforces %s block style without changing string values', async yamlBlockStyle => {
    const input = `description: |-\n  ${'word '.repeat(35).trim()}\n  second line\nsummary: >-\n  folded first\n  folded second\n`;
    const options = {lineWidth: 40, yamlBlockStyle};
    const data = await parseString(input, options);
    const output = await stringify(data, options);

    expect(yaml.parse(output)).toEqual(yaml.parse(input));
    expect(yaml.parseDocument(output).get('description', true).type).toBe(
      yamlBlockStyle === 'literal' ? 'BLOCK_LITERAL' : 'BLOCK_FOLDED'
    );
  });

  test.each(['auto'])('keeps automatic style selection with yamlBlockStyle=%s', async yamlBlockStyle => {
    const input = `description: |-\n  ${'word '.repeat(35).trim()}\n  second line\n`;
    const options = {lineWidth: 40, yamlBlockStyle};
    const data = await parseString(input, options);
    const output = await stringify(data, options);

    expect(output).toBe(yaml.stringify(data, {lineWidth: 40, singleQuote: true}));
    expect(yaml.parseDocument(output).get('description', true).type).toBe('BLOCK_FOLDED');
  });

  test.each(['|-', '|', '|+'])('preserves literal style and value with %s', async indicator => {
    const input = `description: ${indicator}\n  ${'word '.repeat(35).trim()}\n  second line\n\n`;
    const options = {lineWidth: 40, yamlBlockStyle: 'preserve'};
    const data = await parseString(input, options);
    const output = await stringify(data, options);

    expect(yaml.parse(output)).toEqual(yaml.parse(input));
    expect(yaml.parseDocument(output).get('description', true).type).toBe('BLOCK_LITERAL');
  });

  test('preserves mixed styles, including scalar values in sequences', async () => {
    const input = 'description: |-\n  literal\nsummary: >-\n  intentionally folded\nexamples:\n  - |-\n    literal example\n  - >-\n    folded example\n';
    const options = {lineWidth: 120, yamlBlockStyle: 'preserve'};
    const data = await parseString(input, options);
    const output = await stringify(data, options);
    const doc = yaml.parseDocument(output);

    expect(yaml.parse(output)).toEqual(yaml.parse(input));
    expect(doc.get('description', true).type).toBe('BLOCK_LITERAL');
    expect(doc.get('summary', true).type).toBe('BLOCK_FOLDED');
    expect(doc.getIn(['examples', 0], true).type).toBe('BLOCK_LITERAL');
    expect(doc.getIn(['examples', 1], true).type).toBe('BLOCK_FOLDED');
  });

  test('ignores stale styles for changed or removed values', async () => {
    const options = {lineWidth: 120, yamlBlockStyle: 'preserve'};
    const data = await parseString('summary: >-\n  original\ndescription: |-\n  removed\n', options);
    data.summary = 'changed';
    delete data.description;
    const output = await stringify(data, options);

    expect(yaml.parse(output)).toEqual({summary: 'changed'});
    expect(yaml.parseDocument(output).get('summary', true).type).toBe('PLAIN');
  });

  test('preserves styles from root and externally bundled schemas', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openapi-format-block-styles-'));
    try {
      fs.writeFileSync(path.join(dir, 'input.yaml'), 'openapi: 3.0.3\ninfo:\n  title: t\n  version: "1"\n  description: >-\n    intentionally folded\npaths: {}\ncomponents:\n  schemas:\n    Example:\n      $ref: ./schema.yaml\n');
      fs.writeFileSync(path.join(dir, 'schema.yaml'), `type: object\ndescription: |-\n  ${'word '.repeat(35).trim()}\nproperties:\n  name:\n    type: string\n    description: >-\n      folded property\n`);
      const options = {bundle: true, lineWidth: 40, yamlBlockStyle: 'preserve'};
      const data = await parseFile(path.join(dir, 'input.yaml'), options);
      const output = await stringify(data, options);
      const doc = yaml.parseDocument(output);

      expect(yaml.parse(output)).toEqual(data);
      expect(doc.getIn(['info', 'description'], true).type).toBe('BLOCK_FOLDED');
      expect(doc.getIn(['components', 'schemas', 'Example', 'description'], true).type).toBe('BLOCK_LITERAL');
      expect(doc.getIn(['components', 'schemas', 'Example', 'properties', 'name', 'description'], true).type).toBe('BLOCK_FOLDED');
      expect(JSON.stringify(data)).not.toContain('__openapiFormatYamlBlockStyles');
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
});
