'use strict';

const {openapiOverlay} = require('../utils/overlay');

const {describe, it, expect} = require('@jest/globals');

describe('openapi-format CLI overlay tests', () => {
  it('should log an error if an action is missing a target', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [{ update: { description: 'Update description without a target' } }],
    };

    await openapiOverlay(baseOAS, { overlaySet });
    expect(consoleSpy).toHaveBeenCalledWith('Action with missing target');
    consoleSpy.mockRestore();
  });

  it('should remove elements from the baseOAS', async () => {
    const baseOAS = {
      openapi: '3.0.0',
      servers: [
        { url: 'https://api.example.com', description: 'Default server' },
        { url: 'https://api.new-example.com', description: 'New server' },
      ],
    };
    const overlaySet = {
      actions: [{ target: '$.servers[0]', remove: true }],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data.servers).toEqual([{ url: 'https://api.new-example.com', description: 'New server' }]);
  });

  it('should apply updates to the root object if target is `$` and no matches', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [
        {
          target: '$',
          update: { externalDocs: { url: 'https://docs.example.com' } },
        },
      ],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data).toHaveProperty('externalDocs', { url: 'https://docs.example.com' });
  });

  it('should update the root object when target is $', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [
        {
          target: '$',
          update: { externalDocs: { url: 'https://docs.example.com' } },
        },
      ],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data).toHaveProperty('externalDocs', { url: 'https://docs.example.com' });
    expect(result.resultData.appliedActions).toBe(1);
    expect(result.resultData.unusedActions.length).toBe(0);
  });

  it('should log an error for remove actions on the root object', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [
        {
          target: '$',
          remove: true,
        },
      ],
    };

    await openapiOverlay(baseOAS, { overlaySet });
    expect(consoleSpy).toHaveBeenCalledWith('Remove operations are not supported at the root level.');
    consoleSpy.mockRestore();
  });

  it('should properly handle no matches for the target', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [{ target: '$.nonExistentPath', update: { description: 'New description' } }],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.resultData.unusedActions).toEqual(overlaySet.actions);
  });

  it('should track unused, total, and applied actions correctly', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [
        { target: '$.info', update: { description: 'Updated description' } },
        { target: '$.nonExistentPath', update: { description: 'New description' } },
      ],
    };
  });

  it('should log an error if an action is missing a target', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [{ update: { description: 'Update description without a target' } }],
    };

    await openapiOverlay(baseOAS, { overlaySet });
    expect(consoleSpy).toHaveBeenCalledWith('Action with missing target');
    consoleSpy.mockRestore();
  });

  it('should remove elements from the OAS', async () => {
    const baseOAS = {
      openapi: '3.0.0',
      servers: [
        { url: 'https://api.example.com', description: 'Default server' },
        { url: 'https://api.new-example.com', description: 'New server' },
      ],
    };
    const overlaySet = {
      actions: [{ target: '$.servers[0]', remove: true }],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data.servers).toEqual([{ url: 'https://api.new-example.com', description: 'New server' }]);
  });

  it('should apply updates to the root object if target is `$` and no matches', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [
        {
          target: '$',
          update: { externalDocs: { url: 'https://docs.example.com' } },
        },
      ],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data).toHaveProperty('externalDocs', { url: 'https://docs.example.com' });
    expect(result.resultData.totalActions).toBe(1);
    expect(result.resultData.appliedActions).toBe(1);
    expect(result.resultData.unusedActions.length).toBe(0);
  });

  it('should properly handle no matches for the target', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [{ target: '$.nonExistentPath', update: { description: 'New description' } }],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.resultData.unusedActions).toEqual(overlaySet.actions);
    expect(result.resultData.totalActions).toBe(1);
    expect(result.resultData.appliedActions).toBe(0);
  });

  it('should track unused, total, and applied actions correctly', async () => {
    const baseOAS = { openapi: '3.0.0', info: { title: 'Test API' } };
    const overlaySet = {
      actions: [
        { target: '$.info', update: { description: 'Updated description' } },
        { target: '$.nonExistentPath', update: { description: 'New description' } },
      ],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.resultData.totalActions).toBe(2);
    expect(result.resultData.appliedActions).toBe(1);
    expect(result.resultData.unusedActions.length).toBe(1);
    expect(result.resultData.unusedActions[0]).toEqual(overlaySet.actions[1]);
  });

  it('should deepmerge update nested properties correctly', async () => {
    const baseOAS = { info: { title: 'Test API', contact: { name: 'Old Contact' } } };
    const overlaySet = {
      actions: [
        {
          target: '$.info',
          update: { contact: { email: 'contact@example.com' } },
        },
      ],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data.info.contact).toEqual({
      name: 'Old Contact',
      email: 'contact@example.com',
    });
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
                description: 'Pattern to search time series definitions. Cannot be used at the same time as name parameter.',
                required: false,
                schema: {
                  type: 'string',
                },
              },
            ],
          },
        },
      },
    };

    const overlaySet = {
      actions: [
        {
          target: '$',
          update: {
            paths: {
              '/timeseries': {
                get: {
                  description: 'Retrieve a list of all time series definitions. This endpoint supports search and pagination.',
                  parameters: [
                    {
                      name: 'searchPattern',
                      in: 'query',
                      description: 'A pattern used to search time series definitions.',
                      schema: {
                        example: 'temp-',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ],
    };

    const result = await openapiOverlay(baseOAS, { overlaySet });
    expect(result.data.paths['/timeseries'].get.parameters).toEqual([
      {
        name: 'searchPattern',
        in: 'query',
        description: 'A pattern used to search time series definitions.',
        required: false,
        schema: {
          type: 'string',
          example: 'temp-',
        },
      },
    ]);
  });
});
