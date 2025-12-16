const path = require('path');
const fs = require('fs');
const {getDefaultSortSet, getDefaultSortComponentsSet} = require('../openapi-format');

const loadJson = filename => JSON.parse(fs.readFileSync(path.join(__dirname, '..', filename), 'utf8'));

describe('default sort helpers', () => {
  it('returns default sort set clone', async () => {
    const defaults = loadJson('defaultSort.json');
    const result = await getDefaultSortSet();

    expect(result).toEqual(defaults);
    expect(result).not.toBe(defaults);
  });

  it('returns default sort components set clone', async () => {
    const defaults = loadJson('defaultSortComponents.json');
    const result = await getDefaultSortComponentsSet();

    expect(result).toEqual(defaults);
    expect(result).not.toBe(defaults);
  });
});
