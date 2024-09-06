'use strict';

const {changeCase} = require('openapi-format');

/**
 * Method to parse a template string
 * @param {Object} dto - Parse template DTO
 * @param {string} [dto.template] - Template string to parse
 * @param {Object} [dto.oaOperation] - OpenAPI operation object
 * @param {Object} [dto.dynamicValues] - Dynamic values to replace in the template
 * @param {Object} [dto.options] - Options for parsing
 * @param {string} [dto.options.casing] - Casing style to apply
 * @param {string} [dto.options.prefix] - Prefix to add to the generated string
 * @param {string} [dto.options.suffix] - Suffix to add to the generated string
 * @param {boolean} [dto.options.caseOnlyExpressions] - Whether to apply casing only to template expressions
 * @returns {string} - The parsed template string
 */
function parseTpl(dto) {
  const {template = '<opsRef>.<varProp>', oaOperation, dynamicValues, options} = dto;

  if (!template || typeof template !== 'string') return template;

  let varName = template;

  let partsCounter = 0;
  const pathParts = oaOperation?.path?.split('/') ?? [];
  const pathPartsObj = pathParts.reduce((acc, pathPart) => {
    if (pathPart.trim() !== '') {
      partsCounter++;
      acc[`pathPart${partsCounter}`] = pathPart;
    }
    return acc;
  }, {});

  const tags = oaOperation?.tags ?? [];
  const tagsObj = tags.reduce((acc, tag, index) => {
    acc[`tag${index + 1}`] = tag;
    return acc;
  }, {});

  const openApiInfo =
    {
      operationId: oaOperation?.id,
      path: oaOperation?.path,
      pathRef: oaOperation?.pathRef,
      method: oaOperation?.method,
      opsRef: oaOperation?.id ?? oaOperation?.pathRef,
      tag: oaOperation?.tags?.[0]
    } || {};

  const tplValues = {...pathPartsObj, ...tagsObj, ...openApiInfo, ...dynamicValues};

  const startSymbol = '<';
  const endSymbol = '>';

  const placeholderRegex = new RegExp(`${startSymbol}(.*?)${endSymbol}`, 'g');

  varName = varName.replace(placeholderRegex, (_, placeholder) => {
    placeholder = placeholder.trim();
    const tplValue = tplValues[placeholder];
    const casedTplValue =
      options?.caseOnlyExpressions === true && options?.casing ? changeCase(tplValue, options?.casing) : tplValue;
    return casedTplValue ? casedTplValue : '';
  });

  if (options?.prefix) {
    varName = options.prefix.trim() + varName;
  }

  if (options?.suffix) {
    varName = varName + options.suffix.trim();
  }

  if (options?.casing && varName && options?.caseOnlyExpressions !== true) {
    const placeholderRegex = new RegExp(`({{{?|{{)(.*?)(}}}?|}})`, 'g');
    varName = varName.replace(placeholderRegex, (_, openingBraces, placeholder, closingBraces) => {
      if (options.casing) {
        return `${openingBraces}${changeCase(placeholder.trim(), options.casing)}${closingBraces}`;
      }
      return `${openingBraces}${placeholder}${closingBraces}`;
    });
    if (!varName.includes('{{') && !varName.includes('}}')) {
      varName = changeCase(varName, options.casing);
    }
  }

  return varName;
}

function hasTpl(template) {
  if (!template) return false;
  const symbolsRegex = /<|>/;
  return symbolsRegex.test(template);
}

function getOperation(path, method, oa) {
  let operation;

  // Normalize the method to lowercase to ensure case insensitivity
  const normalizedMethod = method.toLowerCase();
  const upperMethod = method.toUpperCase();

  // Check if the path exists in the OpenAPI object
  if (oa.paths && oa.paths[path]) {
    // Check if the method exists for the specified path
    if (oa.paths[path][normalizedMethod]) {
      operation = oa.paths[path][normalizedMethod]; // Return the operation object
    } else {
      return undefined;
    }
  }

  return {
    operation: operation,
    id: operation?.operationId,
    operationId: operation?.operationId,
    method: normalizedMethod,
    path: path,
    pathRef: `${upperMethod}::${path}`,
    tags: operation?.tags
  };
}

module.exports = {
  parseTpl,
  hasTpl,
  getOperation
};
