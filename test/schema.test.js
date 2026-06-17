'use strict';

const schema = require('../schemas/openapi-format.schema.json');

describe('openapi-format schema', () => {
  it('includes the known config keys and keeps extension points open', () => {
    expect(schema.properties).toHaveProperty('sortSet');
    expect(schema.$defs.SortSet.properties).toHaveProperty('query');
    expect(schema.properties.verbose).toBeDefined();
    expect(schema.properties.convertTo.enum).toEqual(['3.1', '3.2']);
    expect(schema.$defs.CaseType.enum).toEqual(
      expect.arrayContaining([
        'snakeCase',
        'adaCase',
        'constantCase',
        'cobolCase',
        'dotNotation',
        'spaceCase',
        'capitalCase',
        'lowerCase',
        'upperCase'
      ])
    );
    expect(schema.additionalProperties).toBe(true);
  });
});
