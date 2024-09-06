const {isString, isArray, isObject} = require('./types');

/**
 * Value replacement function
 * @param {string} valueAsString
 * @param {array} replacements
 * @returns {*}
 */
function valueReplace(valueAsString, replacements) {
  if (!isString(valueAsString)) return valueAsString;
  if (!isArray(replacements)) return valueAsString;

  replacements.map(({searchFor, replaceWith}) => {
    const pattern = searchFor.replace(/"/g, '\\\\"');
    const replacement = replaceWith.replace(/"/g, '\\"');
    valueAsString = valueAsString.replace(new RegExp(escapeRegExp(pattern), 'g'), replacement);
    return valueAsString;
  });

  return valueAsString;
}

/**
 * Function for escaping input to be treated as a literal string within a regular expression
 * @param string
 * @returns {*}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Alternative optional chaining function, to provide support for NodeJS 12
 * TODO replace this with native ?. optional chaining once NodeJS12 is deprecated.
 * @param obj object
 * @param path path to access the properties
 * @param defaultValue
 * @returns {T}
 */
function get(obj, path, defaultValue = undefined) {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Validate function if component contains a used property
 * @param obj
 * @param prop
 * @returns {boolean}
 */
function isUsedComp(obj, prop) {
  if (!isObject(obj)) return false;
  if (!isString(prop)) return false;
  const comp = obj[prop];
  if (comp.used && comp.used === true) return true;
  return false;
}

module.exports = {
  valueReplace: valueReplace,
  get: get,
  isUsedComp: isUsedComp
};
