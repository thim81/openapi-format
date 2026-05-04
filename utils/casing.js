const {isObject, isArray, isString} = require('./types');
const {
  camelCase,
  pascalCase,
  kebabCase,
  trainCase,
  snakeCase,
  adaCase,
  constantCase,
  cobolCase,
  dotNotation,
  spaceCase,
  capitalCase,
  lowerCase,
  upperCase
} = require('case-anything');

/**
 * Determines whether Change casing should be performed based on whether the parameters are set or not.
 * @param casingSet The casing options.
 * @returns {*}
 */
function changeComponentParametersCasingEnabled(casingSet) {
  return (
    casingSet &&
    (casingSet.componentsParametersHeader ||
      casingSet.componentsParametersPath ||
      casingSet.componentsParametersQuery ||
      casingSet.componentsParametersCookie)
  );
}

/**
 * Determines whether Change casing should be performed based on whether the parameters are set or not.
 * @param casingSet The casing options.
 * @returns {*}
 */
function changeParametersCasingEnabled(casingSet) {
  return (
    casingSet &&
    (casingSet.parametersHeader || casingSet.parametersPath || casingSet.parametersQuery || casingSet.parametersCookie)
  );
}

/**
 * Change Object keys case function
 * @param {object} obj
 * @param {string} caseType
 * @param {string[]} customKeepChars Custom characters to keep
 * @returns {*}
 */
function changeObjKeysCase(obj, caseType, customKeepChars = null) {
  if (!isObject(obj)) return obj;

  const orgObj = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  let replacedItems = Object.keys(orgObj).map(key => {
    const newKey = changeCase(key, caseType, customKeepChars);
    return {[newKey]: orgObj[key]};
  });
  return Object.assign({}, ...replacedItems);
}

/**
 * Change object keys case in array function
 * @param {object} node
 * @param {string} caseType
 * @param {string[]} customKeepChars Custom characters to keep
 * @returns {*}
 */
function changeArrayObjKeysCase(node, caseType, customKeepChars = null) {
  if (!isArray(node)) return node;

  const casedNode = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
  for (let i = 0; i < casedNode.length; i++) {
    casedNode[i] = changeObjKeysCase(casedNode[i], caseType, customKeepChars);
  }
  return casedNode;
}

/**
 * Build the keep character list for case-anything.
 * Always preserves the built-in defaults and appends any custom characters.
 * @param {string[]} customKeepChars Custom characters to keep
 * @returns {string[]}
 */
function normalizeKeepChars(customKeepChars = null) {
  if (customKeepChars == null) {
    return ['$', '@'];
  }

  if (!isArray(customKeepChars)) {
    return customKeepChars;
  }

  if (customKeepChars.length === 0) {
    return [];
  }

  const keepChars = ['$', '@'];
  customKeepChars.forEach(char => {
    if (!keepChars.includes(char)) {
      keepChars.push(char);
    }
  });
  return keepChars;
}

/**
 * Change case function
 * @param {string} valueAsString The value to change
 * @param {string} caseType The case type to change to
 * @param {string[]} customKeepChars Custom characters to keep
 * @returns {string}
 */
function changeCase(valueAsString, caseType, customKeepChars = null) {
  if (!isString(valueAsString) || valueAsString === '') return valueAsString;
  const keepChars = normalizeKeepChars(customKeepChars);
  const cleanedString = valueAsString.replace(/\[(.*?)]/g, (match, p1) => {
    return ' ' + p1.replace(/([A-Z])/g, ' $1') + ' ';
  });
  const normCaseType = camelCase(caseType);

  switch (normCaseType) {
    case 'camelCase':
      return camelCase(cleanedString, {keep: keepChars});
    case 'pascalCase':
    case 'upperCamelCase':
      return pascalCase(cleanedString, {keep: keepChars});
    case 'kebabCase':
    case 'kebapCase':
      return kebabCase(cleanedString, {keep: keepChars});
    case 'trainCase':
    case 'capitalKebabCase':
    case 'capitalKebapCase':
      return trainCase(cleanedString, {keep: keepChars});
    case 'snakeCase':
      return snakeCase(cleanedString, {keep: keepChars});
    case 'adaCase':
      return adaCase(cleanedString, {keep: keepChars});
    case 'constantCase':
      return constantCase(cleanedString, {keep: keepChars});
    case 'cobolCase':
      return cobolCase(cleanedString, {keep: keepChars});
    case 'dotNotation':
      return dotNotation(cleanedString, {keep: keepChars});
    case 'spaceCase':
      return spaceCase(cleanedString, {keep: keepChars});
    case 'capitalCase':
      return capitalCase(cleanedString, {keep: keepChars});
    case 'lowerCase':
      return lowerCase(valueAsString, {keep: keepChars});
    case 'upperCase':
      return upperCase(valueAsString, {keep: keepChars});
    default:
      return valueAsString;
  }
}

module.exports = {
  changeComponentParametersCasingEnabled: changeComponentParametersCasingEnabled,
  changeParametersCasingEnabled: changeParametersCasingEnabled,
  changeObjKeysCase: changeObjKeysCase,
  changeArrayObjKeysCase: changeArrayObjKeysCase,
  changeCase: changeCase
};
