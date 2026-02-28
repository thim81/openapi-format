'use strict';

const path = require('path');
const {describe, it, expect} = require('@jest/globals');
const {openapiSort, openapiFilter, openapiChangeCase} = require('../openapi-format');

describe('openapi-format core API', () => {
  it('openapiSort should return original object when sort is disabled', async () => {
    const doc = {openapi: '3.0.0', info: {title: 'API', version: '1.0.0'}, paths: {}};
    const result = await openapiSort(doc, {sort: false});
    expect(result).toBe(doc);
  });

  it('openapiFilter should handle x-tagGroups flagValues filtering branch', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      tags: [{name: 'pets'}],
      'x-tagGroups': [{name: 'Group1', tags: ['pets']}],
      paths: {}
    };

    const result = await openapiFilter(doc, {filterSet: {flagValues: [{name: 'Group1'}]}});

    expect(result.data['x-tagGroups']).toEqual([]);
    expect(result.data.tags).toEqual([{name: 'pets'}]);
  });

  it('openapiChangeCase should apply summary, description and securitySchemes ref casing', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      xRef: {$ref: '#/components/securitySchemes/MyAuth'},
      components: {
        securitySchemes: {
          MyAuth: {type: 'http', scheme: 'bearer'}
        }
      },
      paths: {
        '/pets': {
          get: {
            summary: 'List Pets',
            description: 'Returns All Pets'
          }
        }
      }
    };

    const result = await openapiChangeCase(doc, {
      casingSet: {
        componentsSecuritySchemes: 'snake_case',
        summary: 'kebab-case',
        description: 'kebab-case'
      }
    });

    expect(result.data.components.securitySchemes).toHaveProperty('my_auth');
    expect(result.data.xRef.$ref).toBe('#/components/securitySchemes/my_auth');
    expect(result.data.paths['/pets'].get.summary).toBe('list-pets');
    expect(result.data.paths['/pets'].get.description).toBe('returns-all-pets');
  });
});

describe('openapiSplit API', () => {
  it('throws when output is missing', async () => {
    jest.resetModules();
    const {openapiSplit} = require('../openapi-format');
    await expect(openapiSplit({}, {})).rejects.toThrow('Output is required');
  });

  it('calls split writers for components and paths when output is provided', async () => {
    jest.resetModules();
    jest.doMock('../utils/split', () => ({
      writePaths: jest.fn().mockResolvedValue(undefined),
      writeComponents: jest.fn().mockResolvedValue(undefined),
      writeSplitOpenAPISpec: jest.fn().mockResolvedValue(undefined)
    }));

    const {openapiSplit} = require('../openapi-format');
    const splitUtils = require('../utils/split');

    const doc = {components: {schemas: {A: {type: 'object'}}}, paths: {'/a': {get: {}}}};
    const options = {output: '/tmp/out/openapi.yaml'};
    await openapiSplit(doc, options);

    expect(splitUtils.writeComponents).toHaveBeenCalledWith(
      doc.components,
      expect.objectContaining({outputDir: '/tmp/out', extension: 'yaml'})
    );
    expect(splitUtils.writePaths).toHaveBeenCalledWith(
      doc.paths,
      expect.objectContaining({outputDir: '/tmp/out', extension: 'yaml'})
    );
    expect(splitUtils.writeSplitOpenAPISpec).toHaveBeenCalledWith(
      doc,
      expect.objectContaining({outputDir: '/tmp/out', extension: 'yaml'})
    );
  });

  it('writes only main split spec when components and paths are absent', async () => {
    jest.resetModules();
    jest.doMock('../utils/split', () => ({
      writePaths: jest.fn().mockResolvedValue(undefined),
      writeComponents: jest.fn().mockResolvedValue(undefined),
      writeSplitOpenAPISpec: jest.fn().mockResolvedValue(undefined)
    }));

    const {openapiSplit} = require('../openapi-format');
    const splitUtils = require('../utils/split');

    const doc = {openapi: '3.0.0', info: {title: 'API', version: '1.0.0'}};
    const options = {output: 'openapi.json'};
    await openapiSplit(doc, options);

    expect(splitUtils.writeComponents).not.toHaveBeenCalled();
    expect(splitUtils.writePaths).not.toHaveBeenCalled();
    expect(splitUtils.writeSplitOpenAPISpec).toHaveBeenCalledWith(
      doc,
      expect.objectContaining({outputDir: '.', extension: 'json'})
    );
  });
});
