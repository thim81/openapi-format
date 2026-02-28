'use strict';

const testUtils = require('./__utils__/test-utils');
const {isUsedComp} = require('../utils/filtering');
const {describe, it, expect} = require('@jest/globals');

describe('openapi-format CLI filtering tests', () => {
  describe('json-filter-inverse-operationids', () => {
    it('json-filter-inverse-operationids - should match expected output', async () => {
      const testName = 'json-filter-inverse-operationids';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json');
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('json-filter-markdown-comments', () => {
    it('json-filter-markdown-comments - should match expected output', async () => {
      const testName = 'json-filter-markdown-comments';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json');
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom', () => {
    it('yaml-filter-custom - should match expected output', async () => {
      const testName = 'yaml-filter-custom';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-flags', () => {
    it('yaml-filter-custom-flags - should match expected output', async () => {
      const testName = 'yaml-filter-custom-flags';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-flagsvalue-array', () => {
    it('yaml-filter-custom-flagsvalue-array - should match expected output', async () => {
      const testName = 'yaml-filter-custom-flagsvalue-array';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-flagsvalue-array-taggroups', () => {
    it('yaml-filter-custom-flagsvalue-array-taggroups - should match expected output', async () => {
      const testName = 'yaml-filter-custom-flagsvalue-array-taggroups';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-flagsvalue-value', () => {
    it('yaml-filter-custom-flagsvalue-value - should match expected output', async () => {
      const testName = 'yaml-filter-custom-flagsvalue-value';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-flagsvalue-value-taggroups', () => {
    it('yaml-filter-custom-flagsvalue-value-taggroups - should match expected output', async () => {
      const testName = 'yaml-filter-custom-flagsvalue-value-taggroups';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-methods', () => {
    it('yaml-filter-custom-methods - should match expected output', async () => {
      const testName = 'yaml-filter-custom-methods';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-operationids', () => {
    it('yaml-filter-custom-operationids - should match expected output', async () => {
      const testName = 'yaml-filter-custom-operationids';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom', () => {
    it('yaml-filter-custom-operations - should match expected output', async () => {
      const testName = 'yaml-filter-custom-operations';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-operations-method-wildcard', () => {
    it('yaml-filter-custom-operations-method-wildcard - should match expected output', async () => {
      const testName = 'yaml-filter-custom-operations-method-wildcard';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-query-operations', () => {
    it('yaml-filter-query-operations - should match expected output', async () => {
      const testName = 'yaml-filter-query-operations';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-query-methods', () => {
    it('yaml-filter-query-methods - should match expected output', async () => {
      const testName = 'yaml-filter-query-methods';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-custom-tags', () => {
    it('yaml-filter-custom-tags - should match expected output', async () => {
      const testName = 'yaml-filter-custom-tags';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-default', () => {
    it('yaml-filter-default - should match expected output', async () => {
      const testName = 'yaml-filter-default';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-inverse-methods', () => {
    it('yaml-filter-inverse-methods - should match expected output', async () => {
      const testName = 'yaml-filter-inverse-methods';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-inverse-operationids', () => {
    it('yaml-filter-inverse-operationids - should match expected output', async () => {
      const testName = 'yaml-filter-inverse-operationids';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-inverse-operationids-free-form', () => {
    it('yaml-filter-inverse-operationids-free-form - should match expected output', async () => {
      const testName = 'yaml-filter-inverse-operationids-free-form';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-inverse-tags', () => {
    it('yaml-filter-inverse-tags - should match expected output', async () => {
      const testName = 'yaml-filter-inverse-tags';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-markdown-comments', () => {
    it('yaml-filter-markdown-comments - should match expected output', async () => {
      const testName = 'yaml-filter-markdown-comments';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-replace-text', () => {
    it('yaml-filter-replace-text - should match expected output', async () => {
      const testName = 'yaml-filter-replace-text';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-security-empty', () => {
    it('yaml-filter-security-empty - should match expected output', async () => {
      const testName = 'yaml-filter-security-empty';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-unused-components', () => {
    it('yaml-filter-unused-components - should match expected output', async () => {
      const testName = 'yaml-filter-unused-components';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-unused-components-mediatypes', () => {
    it('yaml-filter-unused-components-mediatypes - should match expected output', async () => {
      const testName = 'yaml-filter-unused-components-mediatypes';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-strip-flags', () => {
    it('yaml-strip-flags - should match expected output', async () => {
      const testName = 'yaml-strip-flags';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-response-content', () => {
    it('yaml-filter-res[pmse=content - should match expected output', async () => {
      const testName = 'yaml-filter-response-content';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-inverse-response-content', () => {
    it('yaml-filter-inverse-response-content - should match expected output', async () => {
      const testName = 'yaml-filter-inverse-response-content';
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('yaml-filter-inverse-flags-stripFlags', () => {
    it('yaml-filter-inverse-flags-stripFlags - should match expected output', async () => {
      const testName = 'yaml-filter-inverse-flags-stripFlags';
      const {result, outputBefore, outputAfter} = await testUtils.loadTest(testName);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('formatted successfully');
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  });

  describe('isUsedComp', () => {
    it('returns false for non-object input', () => {
      expect(isUsedComp(null, 'schemas')).toBe(false);
    });

    it('returns false for non-string prop', () => {
      expect(isUsedComp({schemas: {used: true}}, 1)).toBe(false);
    });

    it('returns false when used flag is missing or false', () => {
      expect(isUsedComp({schemas: {}}, 'schemas')).toBe(false);
      expect(isUsedComp({schemas: {used: false}}, 'schemas')).toBe(false);
    });

    it('returns true when used flag is true', () => {
      expect(isUsedComp({schemas: {used: true}}, 'schemas')).toBe(true);
    });
  });
});
