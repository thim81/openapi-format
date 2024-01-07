'use strict';

const testUtils = require('./__utils__/test-utils')
const of = require('./../openapi-format')
const {
  convertNullable, convertExclusiveMinimum, convertExclusiveMaximum, convertExample, convertConst,
  convertImageBase64, convertMultiPartBinary, setInObject
} = require("../utils/convert");
const { describe, it, expect } = require('@jest/globals');

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
    it('convertNullable - should convert nullable into a type', async () => {
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

    it('convertNullable - should not convert nullable into a type', async () => {
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

    it('convertExclusiveMinimum - should convert exclusiveMinimum', async () => {
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

    it('convertExclusiveMaximum - should convert exclusiveMaximum', async () => {
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

    it('convertExclusiveMinimum - should convert remove exclusiveMinimum', async () => {
      const obj = {
        type: "integer",
        format: "int64",
        minimum: 7,
        exclusiveMinimum: false,
        example: 10
      }
      const res = convertExclusiveMinimum(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'format', 'minimum', 'example'])
      expect(res).toStrictEqual({
        type: "integer",
        format: "int64",
        minimum: 7,
        example: 10
      });
    });

    it('convertExclusiveMaximum - convert should remove exclusiveMaximum', async () => {
      const obj = {
        type: "integer",
        format: "int64",
        maximum: 7,
        exclusiveMaximum: false,
        example: 10
      }
      const res = convertExclusiveMaximum(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'format', 'maximum', 'example'])
      expect(res).toStrictEqual({
        type: "integer",
        format: "int64",
        maximum: 7,
        example: 10,
      });
    });

    it('convertExample - should convert example property to array of examples', async () => {
      const obj = {
        type: "integer",
        format: "int64",
        example: 10,
        maximum: 7
      }
      const res = convertExample(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'format', 'examples', 'maximum'])
      expect(res).toStrictEqual({
        type: "integer",
        format: "int64",
        examples: [10],
        maximum: 7,
      });
    });

    it('convertConst - should convert single enum property to const', async () => {
      const obj = {
        type: 'integer',
        enum: [1],
        format: 'int32'
      }
      const res = convertConst(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'const', 'format'])
      expect(res).toStrictEqual({
        type: 'integer',
        const: 1,
        format: 'int32'
      });
    });

    it('convertConst - should not convert multiple enum properties to const', async () => {
      const obj = {
        type: 'integer',
        enum: [1, 2, 3, 4],
        format: 'int32'
      }
      const res = convertConst(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'enum', 'format'])
      expect(res).toStrictEqual({
        type: 'integer',
        enum: [1, 2, 3, 4],
        format: 'int32'
      });
    });

    it('convertImageBase64 - should convert an image upload with base64 encoding', async () => {
      const obj = {
        schema: {
          type: "string",
          format: "base64"
        }
      }
      const res = convertImageBase64(obj)
      // console.log('result',res)
      expect(Object.keys(res.schema)).toEqual(['type', 'contentEncoding'])
      expect(res).toStrictEqual({
        schema: {
          type: "string",
          contentEncoding: "base64"
        }
      });
    });

    it('convertMultiPartBinary - should convert Multipart file uploads with a binary file', async () => {
      const obj = {
        "type": "string",
        "format": "binary"
      }
      const res = convertMultiPartBinary(obj)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'contentMediaType'])
      expect(res).toStrictEqual({
        type: "string",
        contentMediaType: "application/octet-stream"
      });
    });

    it('setInObject - should set property for new property', async () => {
      const obj = {
        "type": "string",
        "format": "binary"
      }
      const res = setInObject(obj, 'foo', 'bar', null)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'format', 'foo'])
      expect(res).toStrictEqual({
        type: "string",
        format: "binary",
        foo: "bar"
      });
    });

    it('setInObject - should set property on numeric index', async () => {
      const obj = {
        "type": "string",
        "format": "binary"
      }
      const res = setInObject(obj, 'foo', 'bar', 1)
      // console.log('result',res)
      expect(Object.keys(res)).toEqual(['type', 'foo', 'format'])
      expect(res).toStrictEqual({
        type: "string",
        foo: "bar",
        format: "binary",
      });
    });

    it('util-convert - should not convert if no obj', async () => {
      const obj = ["foo"]

      const resNullable = convertNullable(obj)
      expect(resNullable).toStrictEqual(obj);
      const resConst = convertConst(obj)
      expect(resConst).toStrictEqual(obj);
      const resMultiPartBinary = convertMultiPartBinary(obj)
      expect(resMultiPartBinary).toStrictEqual(obj);
      const resExample = convertExample(obj)
      expect(resExample).toStrictEqual(obj);
      const resImageBase64 = convertImageBase64(obj)
      expect(resImageBase64).toStrictEqual(obj);
      const resExclusiveMinimum = convertExclusiveMinimum(obj)
      expect(resExclusiveMinimum).toStrictEqual(obj);
      const resExclusiveMaximum = convertExclusiveMaximum(obj)
      expect(resExclusiveMaximum).toStrictEqual(obj);
    });

  })
});
