
function isBoolean (v) { return typeof v === 'boolean'; }
function isNumber (v) { return typeof v === 'number'; }
function isString (v) { return typeof v === 'string'; }
function isNumeric (v) { return isNumber(v) || (isString(v) && String(v * 1) === v); }
function isSymbol (v) { return typeof v === 'symbol'; }
function isObject (v) { return v !== null && v === Object(v) && Object.prototype.toString.call(v) === '[object Object]'; }
function isFunction (v) { return v && typeof v === 'function'; }
function isArray (v) { return v && Array.isArray(v); }
function isElement (v) { return v && v.tagName; }
function isset (v) { return v !== null && typeof v !== 'undefined'; }
function isNull(v) { return v === null;}
function isUndefined(v) { return typeof v === "undefined" }
function isPrimitive(v) { return isString(v) || isNumber(v) || isBoolean(v) || isNull(v) || isUndefined(v) || isSymbol(v) }
function isReference(v) { return isObject(v) }
function isNaN(v) { return Object.is(v, Number.NaN) }
function type(v) {
    var regex = /^\[object (\S+?)\]$/;
    var matches = Object.prototype.toString.call(v).match(regex) || [];

    return (matches[1] || 'undefined').toLowerCase();
}
module.exports = {
    isBoolean:isBoolean,
    isNumber:isNumber,
    isString:isString,
    isNumeric:isNumeric,
    isSymbol:isSymbol,
    isObject:isObject,
    isFunction:isFunction,
    isArray:isArray,
    isElement:isElement,
    isset:isset,
};
