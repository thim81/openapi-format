'use strict';

const testUtils = require('./__utils__/test-utils')
const {isMatchOperationItem, arraySort} = require("../utils/sorting");
const {describe, it, expect} = require('@jest/globals');

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

  describe('json-sort-request-params', () => {
    it('json-sort-request-params - should match expected output', async () => {
      const testName = 'json-sort-request-params'
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

  describe('yaml-sort-paths', () => {
    it('yaml-sort-paths by alphabet - should match expected output', async () => {
      const testName = 'yaml-sort-paths-alphabet'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-sort-paths by tags - should match expected output', async () => {
      const testName = 'yaml-sort-paths-tags'
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

  describe('util-sort', () => {
    it('isMatchOperationItem - should return false', async () => {
      const res = isMatchOperationItem(null, null, null)
      expect(res).toEqual(false);
    });

    it('arraySort - should sort an array of objects in ascending order', () => {
      const inputArray = [
        {
          "name": "banana",
          "quantity": 10
        },
        {
          "name": "apple",
          "quantity": 5
        },
        {
          "name": "cherry",
          "quantity": 8
        }
      ];

      const expectedSortedArray = [
        {
          "name": "apple",
          "quantity": 5
        },
        {
          "name": "banana",
          "quantity": 10
        },
        {
          "name": "cherry",
          "quantity": 8
        }
      ];

      const sortedArray = arraySort(inputArray, "name");

      expect(sortedArray).toEqual(expectedSortedArray);
    });

    it('arraySort - should handle case-insensitive sorting', () => {
      const inputArray = [
        {
          "name": "Apple",
          "quantity": 10
        },
        {
          "name": "banana",
          "quantity": 5
        },
        {
          "name": "cherry",
          "quantity": 8
        }
      ];

      const expectedSortedArray = [
        {
          "name": "Apple",
          "quantity": 10
        },
        {
          "name": "banana",
          "quantity": 5
        },
        {
          "name": "cherry",
          "quantity": 8
        }
      ];

      const sortedArray = arraySort(inputArray, "name");
      expect(sortedArray).toEqual(expectedSortedArray);
    })

    it('arraySort - handle missing propertyName', () => {
      const inputArray = [
        {
          "quantity": 10
        },
        {
          "quantity": 5
        },
        {
          "quantity": 8
        }
      ];

      const expectedSortedArray = [
        {
          "quantity": 10
        },
        {
          "quantity": 5
        },
        {
          "quantity": 8
        }
      ];

      const sortedArray = arraySort(inputArray, "name");
      expect(sortedArray).toEqual(expectedSortedArray);
    })

  })
});
