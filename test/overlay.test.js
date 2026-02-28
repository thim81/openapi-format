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
    expect(consoleSpy).toHaveBeenCalledWith('Action with missing target');
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
    expect(consoleSpy).toHaveBeenCalledWith('Remove operations are not supported at the root level.');
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

    const result = resolveJsonPathValue({"a\\": 1}, '$.a');

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
