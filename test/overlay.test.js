'use strict';

const path = require('path');

const {openapiOverlay, resolveJsonPathValue, deepMerge} = require('../utils/overlay');
const {parseFile} = require('../openapi-format');

const {describe, it, expect} = require('@jest/globals');

describe('openapi-format CLI overlay tests', () => {
  it('should log an error if an action is missing a target', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [{update: {description: 'Update description without a target'}}]
    };

    await openapiOverlay(baseOAS, {overlaySet});
    expect(consoleSpy).toHaveBeenCalledWith(
      'Overlay action #1: action target must be a JSONPath string starting with "$".'
    );
    consoleSpy.mockRestore();
  });

  it('should remove elements from the baseOAS', async () => {
    const baseOAS = {
      openapi: '3.0.0',
      servers: [
        {url: 'https://api.example.com', description: 'Default server'},
        {url: 'https://api.new-example.com', description: 'New server'}
      ]
    };
    const overlaySet = {
      actions: [{target: '$.servers[0]', remove: true}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.servers).toEqual([{url: 'https://api.new-example.com', description: 'New server'}]);
  });

  it('should apply updates to the root object if target is `$` and no matches', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {
          target: '$',
          update: {externalDocs: {url: 'https://docs.example.com'}}
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data).toHaveProperty('externalDocs', {url: 'https://docs.example.com'});
  });

  it('should update the root object when target is $', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {
          target: '$',
          update: {externalDocs: {url: 'https://docs.example.com'}}
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data).toHaveProperty('externalDocs', {url: 'https://docs.example.com'});
    expect(result.resultData.totalUsedActions).toBe(1);
    expect(result.resultData.unusedActions.length).toBe(0);
  });

  it('should log an error for remove actions on the root object', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {
          target: '$',
          remove: true
        }
      ]
    };

    await openapiOverlay(baseOAS, {overlaySet});
    expect(consoleSpy).toHaveBeenCalledWith('Overlay action #1: remove is not supported at target "$".');
    consoleSpy.mockRestore();
  });

  it('should properly handle no matches for the target', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [{target: '$.nonExistentPath', update: {description: 'New description'}}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.resultData.unusedActions).toEqual(overlaySet.actions);
  });

  it('should track unused, total, and applied actions correctly', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {target: '$.info', update: {description: 'Updated description'}},
        {target: '$.nonExistentPath', update: {description: 'New description'}}
      ]
    };
  });

  it('should remove elements from the OAS', async () => {
    const baseOAS = {
      openapi: '3.0.0',
      servers: [
        {url: 'https://api.example.com', description: 'Default server'},
        {url: 'https://api.new-example.com', description: 'New server'}
      ]
    };
    const overlaySet = {
      actions: [{target: '$.servers[0]', remove: true}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.servers).toEqual([{url: 'https://api.new-example.com', description: 'New server'}]);
  });

  it('should apply updates to the root object if target is `$` and no matches', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {
          target: '$',
          update: {externalDocs: {url: 'https://docs.example.com'}}
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data).toHaveProperty('externalDocs', {url: 'https://docs.example.com'});
    expect(result.resultData.totalActions).toBe(1);
    expect(result.resultData.totalUsedActions).toBe(1);
    expect(result.resultData.unusedActions.length).toBe(0);
  });

  it('should handle multiple actions with mixed results', async () => {
    const baseOAS = {info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {target: '$.info', update: {description: 'Updated description'}},
        {target: '$.nonExistentPath', update: {summary: 'New summary'}},
        {target: '$.info', remove: true}
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data).toEqual({});
    expect(result.resultData.totalActions).toBe(3);
    expect(result.resultData.totalUsedActions).toBe(2);
    expect(result.resultData.unusedActions.length).toBe(1);
  });

  it('should handle conflicting updates by merging properties', async () => {
    const baseOAS = {info: {title: 'Test API', version: '1.0.0'}};
    const overlaySet = {
      actions: [{target: '$.info', update: {version: '2.0.0', description: 'Updated description'}}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info).toEqual({
      title: 'Test API',
      version: '2.0.0',
      description: 'Updated description'
    });
  });

  it('should properly handle no matches for the target', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [{target: '$.nonExistentPath', update: {description: 'New description'}}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.resultData.unusedActions).toEqual(overlaySet.actions);
    expect(result.resultData.totalActions).toBe(1);
    expect(result.resultData.totalUsedActions).toBe(0);
  });

  it('should track unused, total, and applied actions correctly', async () => {
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      actions: [
        {target: '$.info', update: {description: 'Updated description'}},
        {target: '$.nonExistentPath', update: {description: 'New description'}}
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.resultData.totalActions).toBe(2);
    expect(result.resultData.totalUsedActions).toBe(1);
    expect(result.resultData.unusedActions.length).toBe(1);
    expect(result.resultData.unusedActions[0]).toEqual(overlaySet.actions[1]);
  });

  it('should deepmerge update nested properties correctly', async () => {
    const baseOAS = {info: {title: 'Test API', contact: {name: 'Old Contact'}}};
    const overlaySet = {
      actions: [
        {
          target: '$.info',
          update: {contact: {email: 'contact@example.com'}}
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info.contact).toEqual({
      name: 'Old Contact',
      email: 'contact@example.com'
    });
  });

  it('should append update values to array targets', async () => {
    const baseOAS = {servers: [{url: 'https://api.example.com'}]};
    const overlaySet = {
      actions: [{target: '$.servers', update: {url: 'https://api.backup.example.com'}}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.servers).toEqual([{url: 'https://api.example.com'}, {url: 'https://api.backup.example.com'}]);
  });

  it('should spread update arrays into array targets', async () => {
    const baseOAS = {
      servers: [{url: 'https://api.example.com'}, {url: 'https://api.backup.example.com'}]
    };
    const overlaySet = {
      actions: [
        {
          target: '$.servers',
          update: [{url: 'https://api.eu.example.com'}, {url: 'https://api.us.example.com'}]
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.servers).toEqual([
      {url: 'https://api.example.com'},
      {url: 'https://api.backup.example.com'},
      {url: 'https://api.eu.example.com'},
      {url: 'https://api.us.example.com'}
    ]);
  });

  it('should replace primitive values when using update', async () => {
    const baseOAS = {info: {title: 'Old title'}};
    const overlaySet = {
      actions: [{target: '$.info.title', update: 'New title'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info.title).toBe('New title');
  });

  it('should reject type mismatch for primitive target update', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const baseOAS = {info: {title: 'Old title'}};
    const overlaySet = {
      actions: [{target: '$.info.title', update: {value: 'New title'}}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info.title).toBe('Old title');
    expect(result.resultData.totalUsedActions).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Overlay action #1: update type mismatch - primitive target requires primitive value.'
    );
    consoleSpy.mockRestore();
  });

  it('should copy object values into object targets', async () => {
    const baseOAS = {
      info: {title: 'My API', contact: {name: 'Support'}},
      components: {}
    };
    const overlaySet = {
      actions: [{target: '$.components', copy: true, from: '$.info'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.components).toEqual({
      title: 'My API',
      contact: {name: 'Support'}
    });
    expect(result.resultData.totalUsedActions).toBe(1);
  });

  it('should append copied values to array targets', async () => {
    const baseOAS = {
      servers: [{url: 'https://api.example.com'}],
      sourceServer: {url: 'https://api.backup.example.com'}
    };
    const overlaySet = {
      actions: [{target: '$.servers', copy: true, from: '$.sourceServer'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.servers).toEqual([{url: 'https://api.example.com'}, {url: 'https://api.backup.example.com'}]);
  });

  it('should spread copied arrays into array targets', async () => {
    const baseOAS = {
      servers: [{url: 'https://api.example.com'}],
      serverPool: [{url: 'https://api.eu.example.com'}, {url: 'https://api.us.example.com'}]
    };
    const overlaySet = {
      actions: [{target: '$.servers', copy: true, from: '$.serverPool'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.servers).toEqual([
      {url: 'https://api.example.com'},
      {url: 'https://api.eu.example.com'},
      {url: 'https://api.us.example.com'}
    ]);
  });

  it('should replace primitive targets when copying primitive values', async () => {
    const baseOAS = {
      info: {title: 'Old title', description: 'New title'}
    };
    const overlaySet = {
      actions: [{target: '$.info.title', copy: true, from: '$.info.description'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info.title).toBe('New title');
  });

  it('should reject copy action when from resolves zero nodes', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const baseOAS = {
      info: {title: 'API'},
      components: {}
    };
    const overlaySet = {
      actions: [{target: '$.components', copy: true, from: '$.missing'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.resultData.totalUsedActions).toBe(0);
    expect(result.resultData.totalUnusedActions).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith('Overlay action #1: "from" must resolve to exactly one node, resolved 0.');
    consoleSpy.mockRestore();
  });

  it('should reject copy action when from resolves multiple nodes', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const baseOAS = {
      servers: [{url: 'https://api.example.com'}, {url: 'https://api.backup.example.com'}],
      components: {}
    };
    const overlaySet = {
      actions: [{target: '$.components', copy: true, from: '$.servers[*]'}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.resultData.totalUsedActions).toBe(0);
    expect(result.resultData.totalUnusedActions).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith('Overlay action #1: "from" must resolve to exactly one node, resolved 2.');
    consoleSpy.mockRestore();
  });

  it('should apply remove then update then copy in action order', async () => {
    const baseOAS = {
      info: {title: 'Old title'},
      source: {description: 'Copied description'}
    };
    const overlaySet = {
      actions: [
        {
          target: '$',
          remove: true,
          update: {info: {title: 'Updated title'}},
          copy: true,
          from: '$.source'
        }
      ]
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info.title).toBe('Updated title');
    expect(result.data.description).toBe('Copied description');
    expect(result.resultData.totalUsedActions).toBe(1);
    expect(consoleSpy).toHaveBeenCalledWith('Overlay action #1: remove is not supported at target "$".');
    consoleSpy.mockRestore();
  });

  it('should reject unsupported overlay version', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const baseOAS = {openapi: '3.0.0', info: {title: 'Test API'}};
    const overlaySet = {
      overlay: '2.0.0',
      actions: [{target: '$.info', update: {description: 'Ignored'}}]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.info.description).toBeUndefined();
    expect(result.resultData.totalUsedActions).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Unsupported overlay version "2.0.0". Supported versions are 1.0.x and 1.1.x.'
    );
    consoleSpy.mockRestore();
  });

  describe('copy action semantics', () => {
    it('should treat copy with zero target matches as successful no-op without error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const baseOAS = {
        info: {title: 'API', version: '1.0.0'},
        paths: {}
      };
      const overlaySet = {
        overlay: '1.1.0',
        actions: [{target: '$.components.schemas[*]', copy: true, from: '$.info.version'}]
      };

      const result = await openapiOverlay(baseOAS, {overlaySet});
      expect(result.data).toEqual(baseOAS);
      expect(result.resultData.totalUsedActions).toBe(1);
      expect(result.resultData.totalUnusedActions).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('version compatibility', () => {
    it('should reject copy actions for overlay 1.0.0 documents', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const baseOAS = {info: {title: 'Sample API', version: '1.0.0'}};
      const overlaySet = {
        overlay: '1.0.0',
        actions: [{target: '$.info.title', copy: true, from: '$.info.version'}]
      };

      const result = await openapiOverlay(baseOAS, {overlaySet});
      expect(result.data.info.title).toBe('Sample API');
      expect(result.resultData.totalUsedActions).toBe(0);
      expect(result.resultData.totalUnusedActions).toBe(1);
      expect(consoleSpy).toHaveBeenCalledWith('Overlay action #1: "copy" is only supported for overlay 1.1.x documents.');
      consoleSpy.mockRestore();
    });

    it('should allow copy actions for overlay 1.1.0 documents', async () => {
      const baseOAS = {info: {title: 'Sample API', version: '1.0.0'}};
      const overlaySet = {
        overlay: '1.1.0',
        actions: [{target: '$.info.title', copy: true, from: '$.info.version'}]
      };

      const result = await openapiOverlay(baseOAS, {overlaySet});
      expect(result.data.info.title).toBe('1.0.0');
      expect(result.resultData.totalUsedActions).toBe(1);
      expect(result.resultData.totalUnusedActions).toBe(0);
    });
  });

  describe('primitive targeting compatibility', () => {
    it('should preserve legacy primitive-parent merge behavior for overlay 1.0.0', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const baseOAS = {info: {title: 'Old title'}};
      const overlaySet = {
        overlay: '1.0.0',
        actions: [{target: '$.info.title', update: {value: 'New title'}}]
      };

      const result = await openapiOverlay(baseOAS, {overlaySet});
      expect(result.data.info.title).toEqual({value: 'New title'});
      expect(result.resultData.totalUsedActions).toBe(1);
      expect(result.resultData.totalUnusedActions).toBe(0);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should enforce primitive strictness for overlay 1.1.0', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const baseOAS = {info: {title: 'Old title'}};
      const overlaySet = {
        overlay: '1.1.0',
        actions: [{target: '$.info.title', update: {value: 'New title'}}]
      };

      const result = await openapiOverlay(baseOAS, {overlaySet});
      expect(result.data.info.title).toBe('Old title');
      expect(result.resultData.totalUsedActions).toBe(0);
      expect(result.resultData.totalUnusedActions).toBe(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Overlay action #1: update type mismatch - primitive target requires primitive value.'
      );
      consoleSpy.mockRestore();
    });
  });

  it('should add a new unique item to the array during deepMerge', () => {
    const target = [{name: 'param1', in: 'query', description: 'First parameter'}];
    const source = [{name: 'param2', in: 'query', description: 'Second parameter'}];

    const result = deepMerge(target, source);

    expect(result).toEqual([
      {name: 'param1', in: 'query', description: 'First parameter'},
      {name: 'param2', in: 'query', description: 'Second parameter'}
    ]);
  });

  it('should deepmerge parameters without duplication', async () => {
    const baseOAS = {
      paths: {
        '/timeseries': {
          get: {
            parameters: [
              {
                name: 'searchPattern',
                in: 'query',
                description:
                  'Pattern to search time series definitions. Cannot be used at the same time as name parameter.',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ]
          }
        }
      }
    };

    const overlaySet = {
      actions: [
        {
          target: '$',
          update: {
            paths: {
              '/timeseries': {
                get: {
                  description:
                    'Retrieve a list of all time series definitions. This endpoint supports search and pagination.',
                  parameters: [
                    {
                      name: 'searchPattern',
                      in: 'query',
                      description: 'A pattern used to search time series definitions.',
                      schema: {
                        example: 'temp-'
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.paths['/timeseries'].get.parameters).toEqual([
      {
        name: 'searchPattern',
        in: 'query',
        description: 'A pattern used to search time series definitions.',
        required: false,
        schema: {
          type: 'string',
          example: 'temp-'
        }
      }
    ]);
  });
});
describe('resolveJsonPathValue tests', () => {
  it('should resolve a simple path to a property', () => {
    const obj = {info: {title: 'Test API'}};
    const result = resolveJsonPathValue(obj, '$.info.title');
    expect(result).toEqual(['Test API']);
  });

  it('should resolve a path with a wildcard for object keys', () => {
    const obj = {paths: {'/example': {get: {}}, '/test': {post: {}}}};
    const result = resolveJsonPathValue(obj, '$.paths[*]');
    expect(result.length).toBe(2);
    expect(result).toEqual([{get: {}}, {post: {}}]);
  });

  it('should resolve a path with a wildcard for array elements', () => {
    const obj = {tags: [{name: 'tag1'}, {name: 'tag2'}]};
    const result = resolveJsonPathValue(obj, '$.tags[*]');
    expect(result.length).toBe(2);
    expect(result).toEqual([{name: 'tag1'}, {name: 'tag2'}]);
  });

  it('should resolve a nested path with specific array indices', () => {
    const obj = {tags: [{name: 'tag1'}, {name: 'tag2'}]};
    const result = resolveJsonPathValue(obj, '$.tags[1].name');
    expect(result).toEqual(['tag2']);
  });

  it('should resolve a path with deep wildcard', () => {
    const obj = {
      paths: {
        '/example': {get: {summary: 'Example endpoint'}},
        '/test': {post: {summary: 'Test endpoint'}}
      }
    };
    const result = resolveJsonPathValue(obj, '$.paths[*].*');
    expect(result.length).toBe(2);
    expect(result).toEqual([{summary: 'Example endpoint'}, {summary: 'Test endpoint'}]);
  });

  it('should return an empty array for a non-existent path', () => {
    const obj = {info: {title: 'Test API'}};
    const result = resolveJsonPathValue(obj, '$.nonExistent.path');
    expect(result).toEqual([]);
  });

  it('should handle complex JSONPath expressions', () => {
    const obj = {
      items: [
        {id: 1, value: 10},
        {id: 2, value: 20}
      ]
    };
    const result = resolveJsonPathValue(obj, '$.items[?(@.id==2 && @.value>15)]');
    expect(result).toEqual([{id: 2, value: 20}]);
  });

  it('should resolve a path with a parent reference', () => {
    const obj = {paths: {'/example': {get: {}}}};
    const result = resolveJsonPathValue(obj, '$.paths..get');
    expect(result).toEqual([{}]);
  });

  it('should handle array paths with mixed indices and wildcards', () => {
    const obj = {items: [{id: 1}, {id: 2}, {id: 3}]};
    const result = resolveJsonPathValue(obj, '$.items[1].id');
    expect(result).toEqual([2]);

    const wildcardResult = resolveJsonPathValue(obj, '$.items[*].id');
    expect(wildcardResult.length).toBe(3);
    expect(wildcardResult).toEqual([1, 2, 3]);
  });

  it('should handle paths with deeply nested objects', () => {
    const obj = {
      components: {
        schemas: {
          ExampleSchema: {type: 'object', properties: {id: {type: 'string'}}}
        }
      }
    };
    const result = resolveJsonPathValue(obj, '$.components.schemas.ExampleSchema.properties.id.type');
    expect(result).toEqual(['string']);
  });

  it('should handle root path `$`', () => {
    const obj = {openapi: '3.0.0', info: {title: 'Test API'}};
    const result = resolveJsonPathValue(obj, '$');
    expect(result).toEqual([{openapi: '3.0.0', info: {title: 'Test API'}}]);
  });

  it('should handle invalid JSONPath gracefully', () => {
    const obj = {info: {title: 'Test API'}};
    const result = resolveJsonPathValue(obj, 'invalidPath');
    expect(result).toEqual([]);
  });

  it('should handle `length` property of arrays', () => {
    const obj = {items: [1, 2, 3, 4, 5]};
    const result = resolveJsonPathValue(obj, '$.items.length');
    expect(result).toEqual([5]);
  });

  it('should handle a path with escaped special characters', () => {
    const obj = {'key.with.dot': 'value'};
    const result = resolveJsonPathValue(obj, "$['key.with.dot']");
    expect(result).toEqual(['value']);
  });

  it('should handle filtering with conditions', () => {
    const obj = {items: [{id: 1}, {id: 2}, {id: 3}]};
    const result = resolveJsonPathValue(obj, '$.items[?(@.id==2)]');
    expect(result).toEqual([{id: 2}]);
  });

  it('should handle RFC 9535 filtering without surrounding parentheses', () => {
    const obj = {items: [{id: 1}, {id: 2}, {id: 3}]};
    const result = resolveJsonPathValue(obj, '$.items[?@.id==2]');
    expect(result).toEqual([{id: 2}]);
  });

  it('should handle array slicing', () => {
    const obj = {items: [1, 2, 3, 4, 5]};
    const result = resolveJsonPathValue(obj, '$.items[1:4]');
    expect(result).toEqual([2, 3, 4]);
  });

  // it('should handle union of keys', () => {
  //   const obj = { data: { key1: 'value1', key2: 'value2', key3: 'value3' } };
  //   const result = resolveJsonPathValue(obj, '$.data["key1","key3"]');
  //   expect(result).toEqual(['value1', 'value3']);
  // });

  it('should resolve a path with recursive descent', () => {
    const obj = {paths: {'/example': {get: {summary: 'Example'}}}};
    const result = resolveJsonPathValue(obj, '$.paths..summary');
    expect(result).toEqual(['Example']);
  });

  it('should resolve a path with empty oas', () => {
    const obj = '';
    const result = resolveJsonPathValue(obj, '$.paths..summary');
    expect(result).toEqual([]);
  });

  it('should apply overlay action using RFC 9535 filter without parentheses', async () => {
    const baseOAS = {
      security: [{cookieAuth: []}, {bearerAuth: []}]
    };
    const overlaySet = {
      actions: [
        {
          target: '$.security[?@.cookieAuth]',
          update: {'x-applied': true}
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data.security).toEqual([{cookieAuth: [], 'x-applied': true}, {bearerAuth: []}]);
    expect(result.resultData.totalUsedActions).toBe(1);
  });

  it('should apply overlay action to an escaped key path', async () => {
    const baseOAS = {
      'x.map': {
        value: 1
      }
    };
    const overlaySet = {
      actions: [
        {
          target: "$['x.map']",
          update: {updated: true}
        }
      ]
    };

    const result = await openapiOverlay(baseOAS, {overlaySet});
    expect(result.data['x.map']).toEqual({value: 1, updated: true});
    expect(result.resultData.totalUsedActions).toBe(1);
  });

  it('should preserve independent copies when applying a second overlay to prior overlay results', async () => {
    const dir = path.join(__dirname, 'overlay-previous-overlay');
    const input = await parseFile(path.join(dir, 'input.yaml'));
    const overlaySet = await parseFile(path.join(dir, 'overlay.yaml'));

    const firstPass = await openapiOverlay(input, {overlaySet: {actions: [overlaySet.actions[0]]}});
    const firstPassMatches = resolveJsonPathValue(firstPass.data, '$..child.oneOf[0].properties.a');
    expect(firstPassMatches.length).toBe(3);

    const result = await openapiOverlay(input, {overlaySet});
    const aBranches = result.data.properties.parent.properties;

    expect(aBranches.one.properties.child.oneOf[0].properties.a.oneOf).toBeDefined();
    expect(aBranches.two.properties.child.oneOf[0].properties.a.oneOf).toBeDefined();
    expect(aBranches.three.properties.child.oneOf[0].properties.a.oneOf).toBeDefined();
  });
});

describe('resolveJsonPath parser edge cases', () => {
  function loadOverlayWithMockedPaths(pathsToReturn) {
    jest.resetModules();
    jest.doMock('jsonpathly', () => ({
      paths: () => pathsToReturn
    }));
    return require('../utils/overlay');
  }

  it('logs and returns [] for invalid normalized path root', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const {resolveJsonPathValue} = loadOverlayWithMockedPaths(['not-root']);

    const result = resolveJsonPathValue({a: 1}, '$.a');

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid normalized path: not-root'));
    consoleSpy.mockRestore();
  });

  it('logs and returns [] for malformed path segments', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    let overlay = loadOverlayWithMockedPaths(['$.bad']);
    expect(overlay.resolveJsonPathValue({a: 1}, '$.a')).toEqual([]);

    overlay = loadOverlayWithMockedPaths(["$['abc'"]);
    expect(overlay.resolveJsonPathValue({abc: 1}, '$.a')).toEqual([]);

    overlay = loadOverlayWithMockedPaths(['$[123']);
    expect(overlay.resolveJsonPathValue({123: 1}, '$.a')).toEqual([]);

    overlay = loadOverlayWithMockedPaths(['$[abc]']);
    expect(overlay.resolveJsonPathValue({abc: 1}, '$.a')).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('logs and returns [] for malformed escaped quoted token', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const {resolveJsonPathValue} = loadOverlayWithMockedPaths(["$['a\\"]);

    const result = resolveJsonPathValue({'a\\': 1}, '$.a');

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid normalized path'));
    consoleSpy.mockRestore();
  });

  it('parses escaped quote segments in normalized paths', () => {
    const {resolveJsonPathValue} = loadOverlayWithMockedPaths(["$['a\\'b']"]);
    const obj = {"a'b": 123};

    const result = resolveJsonPathValue(obj, '$.ignored');

    expect(result).toEqual([123]);
  });
});
