'use strict';

const {parseTpl, hasTpl, getOperation} = require('../utils/parseTpl');
// const fs = require('fs-extra');
const {describe, it, expect, beforeAll} = require('@jest/globals');
const {parseFile} = require('../utils/file');
const path = require('path');

describe('parseTpl', () => {
  let oaOperation;

  beforeAll(async () => {
    const inputFilePath = path.join(__dirname, '/__utils__/mockTrain.yaml');
    const oa = await parseFile(inputFilePath);
    oaOperation = getOperation('/trains/{id}', 'get', oa);
  });

  it('generates default variable name', () => {
    const dto = {
      oaOperation: oaOperation,
      dynamicValues: {varProp: 'id'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('trainDetails.id');
  });

  it('generates variable name without options', () => {
    const dto = {
      template: '<operationId>_<responseProp>',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('trainDetails_id');
  });

  it('generates variable name with all expressions', () => {
    const dto = {
      template: '<operationId>_<path>_<pathRef>_<method>_<opsRef>_<responseProp>',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('trainDetails_/trains/{id}_GET::/trains/{id}_get_trainDetails_id');
  });

  it('generates variable name with all expressions with casing', () => {
    const dto = {
      template:
        '<operationId>_<path>_<pathPart1>_<pathPart2>_<pathRef>_<method>_<opsRef>_<responseProp>_<tag>_<tag1>_<tag2>',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'kebabCase'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('train-details-trains-id-trains-id-get-trains-id-get-train-details-id-train-train-transport');
  });

  it('generates variable name with casing and prefix', () => {
    const dto = {
      template: '<operationId>_<responseProp>',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'constantCase', prefix: 'prefix_'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('PREFIX_TRAIN_DETAILS_ID');
  });

  it('handles missing dynamic values', () => {
    const dto = {
      template: '<operationId>_<missingProp>',
      oaOperation: oaOperation,
      dynamicValues: {}
    };
    const result = parseTpl(dto);
    expect(result).toBe('trainDetails_');
  });

  it('applies default casing if not provided', () => {
    const dto = {
      template: '<operationId>_<responseProp>',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {prefix: 'prefix_'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('prefix_trainDetails_id');
  });

  it('trims spaces around prefix and suffix', () => {
    const dto = {
      template: '<operationId>_<responseProp>',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {prefix: ' prefix_ ', suffix: ' _suffix '}
    };
    const result = parseTpl(dto);
    expect(result).toBe('prefix_trainDetails_id_suffix');
  });

  it('generates variable name with overwritten OpenAPI info', () => {
    const dto = {
      template: '<operationId>_<responseProp>',
      oaOperation: oaOperation,
      dynamicValues: {operationId: 'companiesAdd', responseProp: 'id'},
      options: {prefix: ' prefix_ ', suffix: ' _suffix '}
    };
    const result = parseTpl(dto);
    expect(result).toBe('prefix_companiesAdd_id_suffix');
  });

  it('generates variable name with static value', () => {
    const dto = {
      template: '<operationId>_<responseProp>_static_name',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {prefix: ' prefix_ ', suffix: ' _suffix '}
    };
    const result = parseTpl(dto);
    expect(result).toBe('prefix_trainDetails_id_static_name_suffix');
  });

  it('generates variable name with static value and spaces', () => {
    const dto = {
      template: 'static.<operationId>_<responseProp>_static_name ',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {prefix: ' prefix_ ', suffix: ' _suffix '}
    };
    const result = parseTpl(dto);
    expect(result).toBe('prefix_static.trainDetails_id_static_name _suffix');
  });

  it('generates variable name static value and spaces with casing', () => {
    const dto = {
      template: 'static.<operationId>_<responseProp>_static-name ',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'constantCase'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('STATIC_TRAIN_DETAILS_ID_STATIC_NAME');
  });

  it('generates variable name with {{', () => {
    const dto = {
      template: '{{<tag>Id}}',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('{{TrainId}}');
  });

  it('generates variable name with casing, keeping the {{}}', () => {
    const dto = {
      template: '{{<tag>Id}}',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'camelCase'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('{{trainId}}');
  });

  it('generates multiple variable names with casing, keeping the outer {{}}', () => {
    const dto = {
      template: '{{<tag>Id_<operationId>}} ',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'camelCase'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('{{trainIdTrainDetails}} ');
  });

  it('generates multiple variable names with casing, keeping the {{}}', () => {
    const dto = {
      template: '{{<tag>Id}}_{{<operationId>}} ',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'camelCase'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('{{trainId}}_{{trainDetails}} ');
  });

  it('generates variable name with casing, keeping the {{{}}}', () => {
    const dto = {
      template: '{{{<tag>MonetaryAmount}}}',
      oaOperation: oaOperation,
      dynamicValues: {responseProp: 'id'},
      options: {casing: 'camelCase'}
    };
    const result = parseTpl(dto);
    expect(result).toBe('{{{trainMonetaryAmount}}}');
  });

  it('keeps placeholder text when casing getter changes during replacement', () => {
    const options = {};
    let readCount = 0;
    Object.defineProperty(options, 'casing', {
      get() {
        readCount += 1;
        return readCount === 1 ? 'camelCase' : '';
      }
    });

    const dto = {
      template: '{{<tag>Id}}',
      oaOperation: oaOperation,
      dynamicValues: {},
      options
    };
    const result = parseTpl(dto);
    expect(result).toBe('{{TrainId}}');
  });
});

describe('hasTpl', () => {
  it('returns true if template contains template tags', () => {
    const templateWithAngleBrackets = '<example>';
    const result = hasTpl(templateWithAngleBrackets);
    expect(result).toBe(true);
  });

  it('returns false if template does not contain template tags', () => {
    const templateWithoutAngleBrackets = 'example';
    const result = hasTpl(templateWithoutAngleBrackets);
    expect(result).toBe(false);
  });

  it('returns true if template contains either < or >', () => {
    const templateWithEitherBracket = 'a < b';
    const result = hasTpl(templateWithEitherBracket);
    expect(result).toBe(true);
  });

  it('returns true if template has multiple template tags', () => {
    const templateWithMultipleTags = '<example> <example>';
    const result = hasTpl(templateWithMultipleTags);
    expect(result).toBe(true);
  });
});

describe('getOperation', () => {
  it('returns undefined when path exists but method does not', () => {
    const oa = {
      paths: {
        '/trains/{id}': {
          get: {operationId: 'trainDetails'}
        }
      }
    };

    const result = getOperation('/trains/{id}', 'post', oa);
    expect(result).toBeUndefined();
  });
});
