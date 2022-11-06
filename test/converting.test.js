'use strict';

const testUtils = require('./__utils__/test-utils')
const of = require('./../openapi-format')

describe('openapi-format CLI converting tests', () => {

  describe('yaml-convert to 3.1', () => {
    it('yaml-convert-3.1 - should match expected output', async () => {
      const testName = 'yaml-convert-3.1'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })
});
