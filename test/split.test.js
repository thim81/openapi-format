'use strict';

const {writeMainOpenAPISpec, writePaths, writeComponents, sanitizeFileName} = require('./../utils/split');
const of = require('./../openapi-format');
const {describe, it, expect} = require('@jest/globals');
const path = require('path');
const {writeFile} = require('./../utils/file');
const {convertComponentsToRef} = require('../utils/split');

jest.mock('./../utils/file', () => ({
  writeFile: jest.fn()
}));

describe('openapi-format CLI splits tests', () => {
  const options = {
    outputDir: '/fake/output/dir',
    someOtherOption: true
  };

  const openapiDoc = {
    paths: {
      '/example/foo/{id}': {
        get: {description: 'An example GET endpoint'}
      }
    },
    components: {
      schemas: {
        ExampleSchema: {
          type: 'object',
          properties: {
            id: {type: 'integer'}
          }
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should split and write main openapi spec with $refs', async () => {
    await writeMainOpenAPISpec(openapiDoc, options);

    // Assert that the main openapi.yaml file is written with $refs
    expect(writeFile).toHaveBeenCalledWith(
      path.join(options.outputDir, 'openapi.yaml'),
      {
        paths: {
          '/example/foo/{id}': {
            $ref: 'paths/example_foo_{id}.yaml'
          }
        },
        components: {
          schemas: {
            ExampleSchema: {
              $ref: 'components/schemas/ExampleSchema.yaml'
            }
          }
        }
      },
      options
    );
  });

  it('should split and write paths to individual files', async () => {
    const paths = openapiDoc.paths;

    await writePaths(paths, options);

    // Assert that each path is written to its own file
    expect(writeFile).toHaveBeenCalledWith(
      path.join(options.outputDir, 'paths', 'example_foo_{id}.yaml'),
      {'/example/foo/{id}': paths['/example/foo/{id}']},
      options
    );
  });

  it('should split and write components to individual files', async () => {
    const components = openapiDoc.components;

    await writeComponents(components, options);

    // Assert that each component is written to its own file
    expect(writeFile).toHaveBeenCalledWith(
      path.join(options.outputDir, 'components/schemas', 'ExampleSchema.yaml'),
      {ExampleSchema: components.schemas.ExampleSchema},
      options
    );
  });

  it('should sanitize file names properly', () => {
    const fileName = '/example/path/{id}';
    const sanitized = sanitizeFileName(fileName);
    expect(sanitized).toBe('example_path_{id}');
  });

  // Test for convertComponentsToRef using real traversal
  it('should convert component $ref to file path', () => {
    const components = {
      schemas: {
        ExampleSchema: {
          type: 'object',
          properties: {
            id: {type: 'integer'},
            related: {
              $ref: '#/components/schemas/RelatedSchema'
            }
          }
        }
      }
    };

    const ext = 'yaml';

    // Call convertComponentsToRef without mocking traverse
    const result = convertComponentsToRef(components, ext);

    // Assert that the $ref is converted correctly
    expect(result.schemas.ExampleSchema.properties.related.$ref).toBe('components/schemas/RelatedSchema.yaml');

    // Assert that non-$ref values remain unchanged
    expect(result.schemas.ExampleSchema.properties.id.type).toBe('integer');
  });

  it('should handle nested $ref structures in components', () => {
    const components = {
      schemas: {
        NestedSchema: {
          type: 'object',
          properties: {
            nested: {
              type: 'object',
              properties: {
                deep: {
                  $ref: '#/components/schemas/DeepSchema'
                }
              }
            }
          }
        }
      }
    };

    const ext = 'yaml';

    // Call convertComponentsToRef to check nested $ref conversion
    const result = convertComponentsToRef(components, ext);

    // Assert that the deeply nested $ref is converted
    expect(result.schemas.NestedSchema.properties.nested.properties.deep.$ref).toBe(
      'components/schemas/DeepSchema.yaml'
    );
  });
});
