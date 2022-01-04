'use strict';
/* istanbul ignore file */

// case-anything
// https://github.com/mesqueeb/case-anything
// Standalone version of the excellent package from @mesqueeb Luca Ban

Object.defineProperty(exports, '__esModule', {value: true});

// Latin-1 Supplement
// upper case ranges
// [À-ÖØ-ß]
// lower case ranges
// [à-öø-ÿ]
/**
 * A string.match function that will return an array of "string parts"
 *
 * @param {string} string
 * @returns {string[]}
 */
function splitOnSpecialChars(string) {
    return string.match(/^[a-zà-öø-ÿ]+|[A-ZÀ-ÖØ-ß][a-zà-öø-ÿ]+|[a-zà-öø-ÿ]+|[0-9]+|[A-ZÀ-ÖØ-ß]+(?![a-zà-öø-ÿ])/g);
}

/**
 * A string.match function that will return an array of "string parts"
 *
 * @param {string} string
 * @returns {string[]}
 */
function getParts(string, noSpecialChars) {
    if (noSpecialChars === void 0) {
        noSpecialChars = false;
    }
    const target = string.trim().normalize('NFC');
    const parts = target.includes(' ') ? target.split(' ').filter(Boolean) : splitOnSpecialChars(target);
    return noSpecialChars ? parts.map(function (part) {
        return part.normalize('NFD').replace(/[^a-zA-ZØßø0-9]/g, '');
    }) : parts;
}

/**
 * Capitalises a single word
 *
 * @export
 * @param {string} string the word
 * @returns {string} the word with the first character in uppercase and the rest in lowercase
 */
function capitaliseWord(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

const noSpecialChars = true;

/**
 * converts strings to camelCase
 *
 * @export
 * @param {string} string
 * @returns {string} in camelCase
 */
function camelCase(string) {
    return getParts(string, noSpecialChars).reduce(function (result, match, index) {
        return index === 0 ? match.toLowerCase() : result + capitaliseWord(match);
    }, '');
}

/**
 * converts strings to PascalCase
 *
 * @export
 * @param {string} string
 * @returns {string} in PascalCase
 */
function pascalCase(string) {
    return getParts(string, noSpecialChars).reduce(function (result, match) {
        return result + capitaliseWord(match);
    }, '');
}

/**
 * converts strings to kebab-case
 *
 * @export
 * @param {string} string
 * @returns {string} in kebab-case
 */
function kebabCase(string) {
    return getParts(string, noSpecialChars)
        .join('-')
        .toLowerCase();
}

/**
 * converts strings to Capital-Kebab-Case
 *
 * @export
 * @param {string} string
 * @returns {string} in Kebab-Case
 */
function capitalKebabCase(string) {
    return getParts(string, noSpecialChars)
        .map(part => capitaliseWord(part))
        .join('-')
}

/**
 * converts strings to snake_case
 *
 * @export
 * @param {string} string
 * @returns {string} in snake_case
 */
function snakeCase(string) {
    return getParts(string, noSpecialChars)
        .join('_')
        .toLowerCase();
}

/**
 * converts strings to CONSTANT_CASE
 *
 * @export
 * @param {string} string
 * @returns {string} in CONSTANT_CASE
 */
function constantCase(string) {
    return getParts(string, noSpecialChars)
        .join('_')
        .toUpperCase();
}

/**
 * converts strings to path/case
 *
 * @export
 * @param {string} string
 * @returns {string} in path/case
 */
function pathCase(string) {
    return getParts(string).join('/');
}

/**
 * converts strings to space case (will add spaces but not change casing)
 *
 * @export
 * @param {string} string
 * @returns {string} in path case
 */
function spaceCase(string) {
    return getParts(string).join(' ');
}

/**
 * converts strings to Capital Case (with spaces)
 *
 * @export
 * @param {string} string
 * @returns {string} in Capital Case (with spaces)
 */
function capitalCase(string) {
    return getParts(string)
        .reduce(function (result, match) {
            return result + " " + capitaliseWord(match);
        }, '')
        .trim();
}

/**
 * converts strings to First letter capital case (with spaces)
 * TODO - finalize implementation
 *
 * @export
 * @param {string} string
 * @returns {string} in First letter capital case (with spaces)
 */
function firstCapitalCase(string) {
    return string
        .replace(/(?<=(?:^|[.?!])\W*) [a-z]/g, i => capitaliseWord(i))
        .trim();
}

/**
 * converts strings to lower case (with spaces)
 *
 * @export
 * @param {string} string
 * @returns {string} in lower case (with spaces)
 */
function lowerCase(string) {
    return getParts(string)
        .join(' ')
        .toLowerCase();
}

/**
 * converts strings to UPPER CASE (with spaces)
 *
 * @export
 * @param {string} string
 * @returns {string} in UPPER CASE (with spaces)
 */
function upperCase(string) {
    return getParts(string)
        .join(' ')
        .toUpperCase();
}

exports.camelCase = camelCase;
exports.capitalCase = capitalCase;
exports.constantCase = constantCase;
exports.firstCapitalCase = firstCapitalCase;
exports.kebabCase = kebabCase;
exports.capitalKebabCase = capitalKebabCase;
exports.lowerCase = lowerCase;
exports.pascalCase = pascalCase;
exports.pathCase = pathCase;
exports.snakeCase = snakeCase;
exports.spaceCase = spaceCase;
exports.upperCase = upperCase;
