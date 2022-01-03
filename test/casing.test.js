'use strict';

const testUtils = require('./__utils__/test-utils')

describe('openapi-format casing tests', () => {

    it('yaml-casing - should match expected output', async () => {
        const testName = 'yaml-casing'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-casing-component-keys - should match expected output', async () => {
        const testName = 'yaml-casing-component-keys'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-casing-component-parameters-keys - should match expected output', async () => {
        const testName = 'yaml-casing-component-parameters-keys'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-casing-operationId - should match expected output', async () => {
        const testName = 'yaml-casing-operationId'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-casing-parameters - should match expected output', async () => {
        const testName = 'yaml-casing-parameters'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-casing-properties - should match expected output', async () => {
        const testName = 'yaml-casing-properties'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });

    it('yaml-casing-operationId - should match expected output', async () => {
        const testName = 'yaml-casing-operationId'
        const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
        // console.log('result',result)
        expect(result.code).toBe(0);
        expect(result.stderr).toContain("formatted successfully");
        expect(outputAfter).toStrictEqual(outputBefore);
    });
});
