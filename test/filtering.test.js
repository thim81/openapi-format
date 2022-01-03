'use strict';

const testUtils = require('./__utils__/test-utils')

describe('openapi-format filtering tests', () => {

    it('json-filter-markdown-comments - should match expected output', async () => {
        const testName = 'json-filter-markdown-comments'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom - should match expected output', async () => {
        const testName = 'yaml-filter-custom'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-flags - should match expected output', async () => {
        const testName = 'yaml-filter-custom-flags'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-flagsvalue-array - should match expected output', async () => {
        const testName = 'yaml-filter-custom-flagsvalue-array'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-flagsvalue-array-taggroups - should match expected output', async () => {
        const testName = 'yaml-filter-custom-flagsvalue-array-taggroups'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-flagsvalue-value - should match expected output', async () => {
        const testName = 'yaml-filter-custom-flagsvalue-value'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-flagsvalue-value-taggroups - should match expected output', async () => {
        const testName = 'yaml-filter-custom-flagsvalue-value-taggroups'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-methods - should match expected output', async () => {
        const testName = 'yaml-filter-custom-methods'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-operationids - should match expected output', async () => {
        const testName = 'yaml-filter-custom-operationids'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-operations - should match expected output', async () => {
        const testName = 'yaml-filter-custom-operations'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-operations-method-wildcard - should match expected output', async () => {
        const testName = 'yaml-filter-custom-operations-method-wildcard'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-custom-tags - should match expected output', async () => {
        const testName = 'yaml-filter-custom-tags'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-default - should match expected output', async () => {
        const testName = 'yaml-filter-default'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-inverse-methods - should match expected output', async () => {
        const testName = 'yaml-filter-inverse-methods'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-inverse-operationids - should match expected output', async () => {
        const testName = 'yaml-filter-inverse-operationids'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-inverse-tags - should match expected output', async () => {
        const testName = 'yaml-filter-inverse-tags'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-markdown-comments - should match expected output', async () => {
        const testName = 'yaml-filter-markdown-comments'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-replace-text - should match expected output', async () => {
        const testName = 'yaml-filter-replace-text'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-security-empty - should match expected output', async () => {
        const testName = 'yaml-filter-security-empty'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-filter-unused-components - should match expected output', async () => {
        const testName = 'yaml-filter-unused-components'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });
});
