'use strict';

const testUtils = require('./__utils__/test-utils')
const of = require('./../openapi-format')
const { describe, it, expect } = require('@jest/globals');

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

  describe('yaml-casing-required-properties', () => {
    it('yaml-casing-properties - should match expected output', async () => {
      const testName = 'yaml-casing-required'
      const {result, input, outputBefore, outputAfter} = await testUtils.loadTest(testName)
      // console.log('result',result)
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("formatted successfully");
      expect(outputAfter).toStrictEqual(outputBefore);
    });
  })

  describe('convert casing', () => {
    const str = 'openapi-format'
    it('casing should match camelCase', async () => {
      expect(of.changeCase(str, 'camelCase')).toBe('openapiFormat');
    });
    it('casing should match PascalCase', async () => {
      expect(of.changeCase(str, 'PascalCase')).toBe('OpenapiFormat');
    });
    it('casing should match kebab-case', async () => {
      expect(of.changeCase(str, 'kebab-case')).toBe('openapi-format');
    });
    it('casing should match Train-Case', async () => {
      expect(of.changeCase(str, 'Train-Case')).toBe('Openapi-Format');
    });
    it('casing should match snake_case', async () => {
      expect(of.changeCase(str, 'snake_case')).toBe('openapi_format');
    });
    it('casing should match Ada_Case', async () => {
      expect(of.changeCase(str, 'Ada_Case')).toBe('Openapi_Format');
    });
    it('casing should match CONSTANT_CASE', async () => {
      expect(of.changeCase(str, 'CONSTANT_CASE')).toBe('OPENAPI_FORMAT');
    });
    it('casing should match COBOL-CASE', async () => {
      expect(of.changeCase(str, 'COBOL-CASE')).toBe('OPENAPI-FORMAT');
    });
    it('casing should match Dot.notation', async () => {
      expect(of.changeCase(str, 'Dot.notation')).toBe('openapi.format');
    });
    it('casing should match Space case', async () => {
      expect(of.changeCase(str, 'Space case')).toBe('openapi format');
    });
    it('casing should match Capital Case', async () => {
      expect(of.changeCase(str, 'Capital Case')).toBe('Openapi Format');
    });
    it('casing should match lower case', async () => {
      expect(of.changeCase(str, 'lower case')).toBe('openapi format');
    });
    it('casing should match UPPER CASE', async () => {
      expect(of.changeCase(str, 'UPPER CASE')).toBe('OPENAPI FORMAT');
    });
    it('casing should not match', async () => {
      expect(of.changeCase(str, 'foo bar')).toBe('openapi-format');
    });
    it('casing should handle [] with camelCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'camelCase')).toBe('createLeadMissingParams');
    });
    it('casing should handle [] with PascalCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'PascalCase')).toBe('CreateLeadMissingParams');
    });
    it('casing should handle [] with kebab-case', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'kebab-case')).toBe('create-lead-missing-params');
    });
    it('casing should handle [] with snakeCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'snakeCase')).toBe('create_lead_missing_params');
    });
    it('casing should handle [] with trainCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'trainCase')).toBe('Create-Lead-Missing-Params');
    });
    it('casing should handle [] with adaCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'adaCase')).toBe('Create_Lead_Missing_Params');
    });
    it('casing should handle [] with constantCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'constantCase')).toBe('CREATE_LEAD_MISSING_PARAMS');
    });
    it('casing should handle [] with cobolCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'cobolCase')).toBe('CREATE-LEAD-MISSING-PARAMS');
    });
    it('casing should handle [] with dotNotation', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'dotNotation')).toBe('Create.lead.missing.Params');
    });
    it('casing should handle [] with spaceCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'spaceCase')).toBe('Create lead missing Params');
    });
    it('casing should handle [] with capitalCase', async () => {
      expect(of.changeCase('Create lead[missingParams]', 'capitalCase')).toBe('Create Lead Missing Params');
    });
    it('casing should keep custom characters', async () => {
      expect(of.changeCase('{{openapi-format}}', 'snake_case', ['{{', '}}'])).toBe('{{openapi_format}}');
    });
    it('casing should keep default @$ characters', async () => {
      expect(of.changeCase('@openapi-format$}}', 'snake_case', )).toBe('@openapi_format$');
    });
    it('casing should remove all custom characters', async () => {
      expect(of.changeCase('@openapi-$format}}', 'snake_case', [])).toBe('openapi_format');
    });
  });
});
