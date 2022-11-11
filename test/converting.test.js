'use strict';

const testUtils = require('./__utils__/test-utils')
const of = require('./../openapi-format')
const {convertNullable, convertExclusiveMinimum, convertExclusiveMaximum} = require("../util-convert");

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

  describe('util-convert', () => {
    it('convertNullable - should convert nullable into a type ', async () => {
      const obj = {
        format: "int64",
        type: "integer",
        example: 10,
        nullable: true
      }
      const res = convertNullable(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['format', 'type', 'example'])
      expect(res).toStrictEqual({
        format: "int64",
        type: ["integer", "null"],
        example: 10,
      });
    });

    it('convertNullable - should not convert nullable into a type ', async () => {
      const obj = {
        format: "int64",
        type: "integer",
        example: 10,
        nullable: false
      }
      const res = convertNullable(obj)
      // console.log('result',res)
      expect(res).toStrictEqual({
        format: "int64",
        type: ["integer"],
        example: 10,
      });
    });

    it('convertExclusive - should convert exclusiveMinimum ', async () => {
      const obj = {
        type: "integer",
        format: "int64",
        minimum: 7,
        exclusiveMinimum: true,
        example: 10
      }
      const res = convertExclusiveMinimum(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'format', 'exclusiveMinimum', 'example'])
      expect(res).toStrictEqual({
        type: "integer",
        format: "int64",
        exclusiveMinimum: 7,
        example: 10
      });
    });

    it('convertExclusive - should convert exclusiveMaximum ', async () => {
      const obj = {
        type: "integer",
        format: "int64",
        maximum: 7,
        exclusiveMaximum: true,
        example: 10
      }
      const res = convertExclusiveMaximum(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'format', 'exclusiveMaximum', 'example'])
      expect(res).toStrictEqual({
        type: "integer",
        format: "int64",
        example: 10,
        exclusiveMaximum: 7,
      });
    });

  })
});
