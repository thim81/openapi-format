'use strict';

const testUtils = require('./__utils__/test-utils')

describe('openapi-format CLI sorting tests', () => {

  describe('json-custom', () => {
    it('json-custom - should match expected output', async () => {
      const testName = 'json-custom'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
      // console.log('result',result)
      expect(outputAfter).toStrictEqual(outputBefore);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
    });
  })

  describe('json-custom-yaml', () => {
    it('json-custom-yaml - should match expected output', async () => {
      const testName = 'json-custom-yaml'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'yaml')
      // console.log('result',result)
      expect(outputAfter).toStrictEqual(outputBefore);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
    });
  })

  describe('json-default', () => {
    it('json-default - should match expected output', async () => {
      const testName = 'json-default'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('json-default-yaml', () => {
    it('json-default-yaml - should match expected output', async () => {
      const testName = 'json-default-yaml'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'yaml')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('json-no-sort', () => {
    it('json-no-sort - should match expected output', async () => {
      const testName = 'json-no-sort'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('json-rename', () => {
    it('json-rename - should match expected output', async () => {
      const testName = 'json-rename'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('json-sort-components', () => {
    it('json-sort-components - should match expected output', async () => {
      const testName = 'json-sort-components'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-custom', () => {
    it('yaml-custom - should match expected output', async () => {
      const testName = 'yaml-custom'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-custom-json', () => {
    it('yaml-custom-json - should match expected output', async () => {
      const testName = 'yaml-custom-json'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'yaml', 'json')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-default', () => {
    it('yaml-default - should match expected output', async () => {
      const testName = 'yaml-default'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-default-bug-examples-properties', () => {
    it('yaml-default-bug-examples-properties - should match expected output', async () => {
      const testName = 'yaml-default-bug-examples-properties'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-default-bug-nested-properties', () => {
    it('yaml-default-bug-nested-properties - should match expected output', async () => {
      const testName = 'yaml-default-bug-nested-properties'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-default-json', () => {
    it('yaml-default-json - should match expected output', async () => {
      const testName = 'yaml-default-json'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'yaml', 'json')
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-linewidth', () => {
    it('yaml-linewidth - should match expected output', async () => {
      const testName = 'yaml-linewidth'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-no-sort', () => {
    it('yaml-no-sort - should match expected output', async () => {
      const testName = 'yaml-no-sort'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-rename', () => {
    it('yaml-rename - should match expected output', async () => {
      const testName = 'yaml-rename'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-sort-components', () => {
    it('yaml-sort-components - should match expected output', async () => {
      const testName = 'yaml-sort-components'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('yaml-stoplight-studio-style', () => {
    it('yaml-stoplight-studio-style - should match expected output', async () => {
      const testName = 'yaml-stoplight-studio-style'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })
});
