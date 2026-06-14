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

  it('openapiFilter should keep inverseFlags-matched operations when stripFlags removes the same key', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      paths: {
        '/pets': {
          get: {'x-public': true, responses: {200: {description: 'ok'}}},
          post: {responses: {200: {description: 'ok'}}}
        }
      }
    };

    const onlyInverse = await openapiFilter(doc, {filterSet: {inverseFlags: ['x-public']}});
    expect(onlyInverse.data.paths).toHaveProperty('/pets.get');

    const inverseAndStrip = await openapiFilter(doc, {
      filterSet: {inverseFlags: ['x-public'], stripFlags: ['x-public']}
    });
    expect(inverseAndStrip.data.paths).toHaveProperty('/pets.get');
    expect(inverseAndStrip.data.paths['/pets'].get['x-public']).toBeUndefined();
    expect(inverseAndStrip.data.paths['/pets'].post).toBeUndefined();
  });

  it('adding responses to unusedComponents should not remove still-referenced schemas', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      paths: {
        '/pets': {
          get: {
            'x-public': true,
            responses: {
              200: {description: 'ok', content: {'application/json': {schema: {$ref: '#/components/schemas/Pet'}}}}
            }
          },
          post: {
            responses: {
              200: {description: 'ok', content: {'application/json': {schema: {$ref: '#/components/schemas/Pet'}}}}
            }
          }
        }
      },
      components: {
        schemas: {
          Pet: {type: 'object'}
        }
      }
    };

    const base = {
      inverseFlags: ['x-public'],
      stripFlags: ['x-public'],
      unusedComponents: ['schemas', 'parameters', 'examples', 'headers', 'requestBodies']
    };
    const withResponses = {...base, unusedComponents: [...base.unusedComponents, 'responses']};

    const resultBase = await openapiFilter(doc, {filterSet: base});
    const resultWithResponses = await openapiFilter(doc, {filterSet: withResponses});

    expect(resultBase.data).toEqual(resultWithResponses.data);
    expect(resultWithResponses.data.paths).toHaveProperty('/pets.get');
    expect(resultWithResponses.data.components.schemas).toHaveProperty('Pet');
  });

  it('openapiFilter should keep schemas referenced by discriminator mapping', async () => {
    const doc = {
      openapi: '3.1.2',
      info: {title: 'Example - OpenAPI 3.1.2', version: '0.0.1'},
      paths: {
        '/stuff': {
          post: {
            operationId: 'stuff',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {$ref: '#/components/schemas/Base'}
                }
              }
            },
            responses: {
              200: {
                description: 'successful',
                content: {
                  'application/json': {
                    schema: {$ref: '#/components/schemas/Base'}
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          Base: {
            type: 'object',
            properties: {
              discriminatorProperty: {
                type: 'string',
                enum: ['derivedA', 'derivedB']
              }
            },
            required: ['discriminatorProperty'],
            discriminator: {
              propertyName: 'discriminatorProperty',
              mapping: {
                derivedA: '#/components/schemas/DerivedA',
                derivedB: '#/components/schemas/DerivedB'
              }
            }
          },
          DerivedA: {
            allOf: [
              {$ref: '#/components/schemas/Base'},
              {
                type: 'object',
                properties: {a: {type: 'string'}},
                required: ['a']
              }
            ]
          },
          DerivedB: {
            allOf: [
              {$ref: '#/components/schemas/Base'},
              {
                type: 'object',
                properties: {b: {type: 'string'}},
                required: ['b']
              }
            ]
          },
          Unused: {
            type: 'object'
          }
        }
      }
    };

    const result = await openapiFilter(doc, {
      filterSet: {
        unusedComponents: ['schemas']
      }
    });

    expect(result.data.components.schemas).toHaveProperty('Base');
    expect(result.data.components.schemas).toHaveProperty('DerivedA');
    expect(result.data.components.schemas).toHaveProperty('DerivedB');
    expect(result.data.components.schemas).not.toHaveProperty('Unused');
  });

  it('openapiFilter should not crash when unusedComponents recurses over an empty securitySchemes type', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      components: {
        securitySchemes: {
          MyAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      paths: {}
    };

    await expect(
      openapiFilter(doc, {
        filterSet: {
          unusedComponents: ['securitySchemes']
        }
      })
    ).resolves.toHaveProperty('data');
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

  it('openapiChangeCase should keep configured separator characters for parameter names', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                name: 'cursor.created_at',
                in: 'query',
                schema: {type: 'string'}
              }
            ],
            responses: {200: {description: 'ok'}}
          }
        }
      }
    };

    const result = await openapiChangeCase(doc, {
      casingSet: {
        parametersQuery: 'camelCase',
        parametersQueryKeepChars: ['.']
      }
    });

    expect(result.data.paths['/pets'].get.parameters[0].name).toBe('cursor.createdAt');
  });

  it('openapiChangeCase should keep configured separator characters for component schema keys and refs', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      paths: {
        '/pets': {
          get: {
            responses: {
              200: {
                description: 'ok',
                content: {'application/json': {schema: {$ref: '#/components/schemas/Pet.v1'}}}
              }
            }
          }
        }
      },
      components: {
        schemas: {
          'Pet.v1': {type: 'object'}
        }
      }
    };

    const result = await openapiChangeCase(doc, {
      casingSet: {
        componentsSchemas: 'camelCase',
        componentsSchemasKeepChars: ['.']
      }
    });

    expect(Object.keys(result.data.components.schemas)).toContain('pet.v1');
    expect(result.data.paths['/pets'].get.responses[200].content['application/json'].schema.$ref).toBe(
      '#/components/schemas/pet.v1'
    );
  });

  it('openapiChangeCase should keep configured separator characters for component parameter keys and refs', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/Cursor.v1'
              }
            ],
            responses: {200: {description: 'ok'}}
          }
        }
      },
      components: {
        parameters: {
          'Cursor.v1': {
            name: 'cursor.v1',
            in: 'query',
            schema: {type: 'string'}
          }
        }
      }
    };

    const result = await openapiChangeCase(doc, {
      casingSet: {
        componentsParametersQuery: 'camelCase',
        componentsParametersQueryKeepChars: ['.']
      }
    });

    expect(Object.keys(result.data.components.parameters)).toContain('cursor.v1');
    expect(result.data.components.parameters['cursor.v1'].name).toBe('cursor.v1');
    expect(result.data.paths['/pets'].get.parameters[0].$ref).toBe('#/components/parameters/cursor.v1');
  });

  it('openapiChangeCase should leave unconfigured component parameter keys unchanged', async () => {
    const doc = {
      openapi: '3.0.0',
      info: {title: 'API', version: '1.0.0'},
      paths: {
        '/pets': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/Cursor.v1'
              },
              {
                $ref: '#/components/parameters/X-Request-Id'
              }
            ],
            responses: {200: {description: 'ok'}}
          }
        }
      },
      components: {
        parameters: {
          'Cursor.v1': {
            name: 'cursor.v1',
            in: 'query',
            schema: {type: 'string'}
          },
          'X-Request-Id': {
            name: 'X-Request-Id',
            in: 'header',
            schema: {type: 'string'}
          }
        }
      }
    };

    const result = await openapiChangeCase(doc, {
      casingSet: {
        componentsParametersQuery: 'camelCase',
        componentsParametersQueryKeepChars: ['.']
      }
    });

    expect(Object.keys(result.data.components.parameters)).toContain('cursor.v1');
    expect(Object.keys(result.data.components.parameters)).toContain('X-Request-Id');

    expect(result.data.paths['/pets'].get.parameters[0].$ref).toBe('#/components/parameters/cursor.v1');
    expect(result.data.paths['/pets'].get.parameters[1].$ref).toBe('#/components/parameters/X-Request-Id');
  });

  it('openapiChangeCase should transform discriminator propertyName with properties casing', async () => {
    const doc = {
      openapi: '3.1.0',
      info: {title: 'Discriminator casing bug', version: '1.0.0'},
      paths: {},
      components: {
        schemas: {
          CatEvent: {
            type: 'object',
            properties: {
              event_type: {
                type: 'string',
                const: 'CAT'
              },
              full_name: {
                type: 'string'
              }
            }
          },
          DogEvent: {
            type: 'object',
            properties: {
              event_type: {
                type: 'string',
                const: 'DOG'
              },
              breed: {
                type: 'string'
              }
            }
          },
          AnimalEvent: {
            oneOf: [{$ref: '#/components/schemas/CatEvent'}, {$ref: '#/components/schemas/DogEvent'}],
            discriminator: {
              propertyName: 'event_type'
            }
          }
        }
      }
    };

    const result = await openapiChangeCase(doc, {
      casingSet: {
        properties: 'camelCase'
      }
    });

    expect(result.data.components.schemas.CatEvent.properties).toHaveProperty('eventType');
    expect(result.data.components.schemas.CatEvent.properties).toHaveProperty('fullName');
    expect(result.data.components.schemas.DogEvent.properties).toHaveProperty('eventType');
    expect(result.data.components.schemas.DogEvent.properties).toHaveProperty('breed');
    expect(result.data.components.schemas.AnimalEvent.discriminator.propertyName).toBe('eventType');
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
