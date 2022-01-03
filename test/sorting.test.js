'use strict';

const testUtils = require('./__utils__/test-utils')

describe('openapi-format sorting tests', () => {

    it('json-custom - should match expected output', async () => {
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest('json-custom', 'json', 'json')
        // console.log('result',result)
        expect(outputAfter).toStrictEqual(outputBefore);
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
    });

    it('json-custom-yaml - should match expected output', async () => {
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest('json-custom-yaml', 'json', 'yaml')
        // console.log('result',result)
        expect(outputAfter).toStrictEqual(outputBefore);
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
    });

    it('json-default - should match expected output', async () => {
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest('json-default', 'json', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('json-default-yaml - should match expected output', async () => {
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest('json-default-yaml', 'json', 'yaml')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('json-no-sort - should match expected output', async () => {
        const testName = 'json-no-sort'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('json-rename - should match expected output', async () => {
        const testName = 'json-rename'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('json-sort-components - should match expected output', async () => {
        const testName = 'json-sort-components'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'json', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-custom - should match expected output', async () => {
        const testName = 'yaml-custom'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-custom-json - should match expected output', async () => {
        const testName = 'yaml-custom-json'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'yaml', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-default - should match expected output', async () => {
        const testName = 'yaml-default'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-default-bug-examples-properties - should match expected output', async () => {
        const testName = 'yaml-default-bug-examples-properties'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-default-bug-nested-properties - should match expected output', async () => {
        const testName = 'yaml-default-bug-nested-properties'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-default-json - should match expected output', async () => {
        const testName = 'yaml-default-json'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName, 'yaml', 'json')
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-linewidth - should match expected output', async () => {
        const testName = 'yaml-linewidth'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-no-sort - should match expected output', async () => {
        const testName = 'yaml-no-sort'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-sort-components - should match expected output', async () => {
        const testName = 'yaml-sort-components'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-stoplight-studio-style - should match expected output', async () => {
        const testName = 'yaml-stoplight-studio-style'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });
});
