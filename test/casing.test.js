'use strict';

const testUtils = require('./__utils__/test-utils')

describe('openapi-format CLI casing tests', () => {

    describe('yaml-casing', () => {
        it('yaml-casing - should match expected output', async () => {
            const testName = 'yaml-casing'
            const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
            // console.log('result',result)
            expect(result.code).toBe(0);
            expect(result.stdout).toContain("formatted successfully");
            expect(outputAfter).toStrictEqual(outputBefore);
        });
    })

    describe('yaml-casing-component-keys', () => {
        it('yaml-casing-component-keys - should match expected output', async () => {
            const testName = 'yaml-casing-component-keys'
            const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
            // console.log('result',result)
            expect(result.code).toBe(0);
            expect(result.stdout).toContain("formatted successfully");
            expect(outputAfter).toStrictEqual(outputBefore);
        });
    })

    describe('yaml-casing-component-parameters-keys', () => {
        it('yaml-casing-component-parameters-keys - should match expected output', async () => {
            const testName = 'yaml-casing-component-parameters-keys'
            const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
            // console.log('result',result)
            expect(result.code).toBe(0);
            expect(result.stdout).toContain("formatted successfully");
            expect(outputAfter).toStrictEqual(outputBefore);
        });
    })

    describe('yaml-casing-operationId', () => {
        it('yaml-casing-operationId - should match expected output', async () => {
            const testName = 'yaml-casing-operationId'
            const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
            // console.log('result',result)
            expect(result.code).toBe(0);
            expect(result.stdout).toContain("formatted successfully");
            expect(outputAfter).toStrictEqual(outputBefore);
        });
    })

    describe('yaml-casing-parameters', () => {
        it('yaml-casing-parameters - should match expected output', async () => {
            const testName = 'yaml-casing-parameters'
            const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
            // console.log('result',result)
            expect(result.code).toBe(0);
            expect(result.stdout).toContain("formatted successfully");
            expect(outputAfter).toStrictEqual(outputBefore);
        });
    })

    describe('yaml-casing-properties', () => {
        it('yaml-casing-properties - should match expected output', async () => {
            const testName = 'yaml-casing-properties'
            const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
            // console.log('result',result)
            expect(result.code).toBe(0);
            expect(result.stdout).toContain("formatted successfully");
            expect(outputAfter).toStrictEqual(outputBefore);
        });
    })
});
