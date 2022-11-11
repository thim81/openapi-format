const {isObject, isArray, isNumber, isString} = require("./util-types");

/**
 * Add property to object at certain position
 * @param obj
 * @param key
 * @param value
 * @param index
 * @returns {{}}
 */
function setInObject(obj, key, value, index) {
  // Create a temp object and index variable
  const dto = {}
  let i = 0
  const ordering = Object.keys(obj)

  // Loop through the original object
  for (let prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      // If the indexes match, add the new item
      if (i === index && isNumber(index) && key && value) {
        dto[key] = value
      }
      // Add the current item in the loop to the temp obj
      dto[prop] = obj[prop]

      // Add/overwrite item
      if (isString(index) && i === ordering.indexOf(index) && key && value) {
        dto[key] = value
      }
      // Increase the count
      i++
    }
  }
  // If no index, add to the end
  if (!index && key) {
    Object.assign(dto, {[key]: value})
  }
  return dto
}

/**
 * Convert nullable property to type
 * @param {object} obj
 * @returns {*}
 */
function convertNullable(obj) {
  if (!isObject(obj)) return obj
  if (obj.nullable === undefined) return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  const types = [dto.type.toString()]
  if (dto.nullable === true) {
    types.push('null')
  }
  // Update 3.1 type
  dto = setInObject(dto, 'type', types, 'type')
  // Remove 3.0 prop
  delete dto.nullable
  return dto
}

/**
 * Convert exclusiveMinimum property
 * @param {object} obj
 * @returns {*}
 */
function convertExclusiveMinimum(obj) {
  if (!isObject(obj)) return obj
  if (obj.exclusiveMinimum === undefined || obj.minimum === undefined) return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.exclusiveMinimum === true) {
    dto = setInObject(dto, 'exclusiveMinimum', dto.minimum, 'exclusiveMinimum')
    delete dto.minimum
  } else {
    // Remove 3.0 prop
    delete dto.exclusiveMinimum
  }
  return dto
}

/**
 * Convert exclusiveMinimum property
 * @param {object} obj
 * @returns {*}
 */
function convertExclusiveMaximum(obj) {
  if (!isObject(obj)) return obj
  if (obj.exclusiveMaximum === undefined || obj.maximum === undefined) return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.exclusiveMaximum === true) {
    dto = setInObject(dto, 'exclusiveMaximum', dto.maximum, 'exclusiveMaximum')
    delete dto.maximum
  } else {
    // Remove 3.0 prop
    delete dto.exclusiveMaximum
  }
  return dto
}

/**
 * Convert example property to array of examples
 * @param {object} obj
 * @returns {*}
 */
function convertExample(obj) {
  if (!isObject(obj)) return obj
  if (obj.example === undefined) return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  const examples = [dto.example]
  // Set 3.1 examples
  dto = setInObject(dto, 'examples', examples, 'example')
  // Remove 3.0 example
  delete dto.example
  return dto
}

/**
 * Convert single enum property to const
 * @param {object} obj
 * @returns {*}
 */
function convertConst(obj) {
  if (!isObject(obj)) return obj
  if (obj.enum === undefined || !isArray(obj.enum) || obj.enum.length > 1) return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Set 3.1 const
  dto = setInObject(dto, 'const', dto.enum[0], 'enum')
  // Remove 3.0 enum
  delete dto.enum
  return dto
}

/**
 * Convert Uploading an image with base64 encoding
 * @param {object} obj
 * @returns {*}
 */
function convertImageBase64(obj) {
  if (!isObject(obj)) return obj
  if (!obj.schema || !obj.schema.format || obj.schema.format !== 'base64') return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Set 3.1 contentEncoding
  dto.schema = setInObject(dto.schema, 'contentEncoding', dto.schema.format, 'format')
  // Remove 3.0 format
  delete dto.schema.format
  return dto
}

/**
 * Convert Multipart file uploads with a binary file
 * @param {object} obj
 * @returns {*}
 */
function convertMultiPartBinary(obj) {
  if (!isObject(obj)) return obj
  if (obj.format !== 'binary') return obj

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Set 3.1 contentMediaType
  dto = setInObject(dto, 'contentMediaType', 'application/octet-stream', 'format')
  // Remove 3.0 binary format
  delete dto.format
  return dto
}

module.exports = {
  setInObject: setInObject,
  convertNullable: convertNullable,
  convertExample: convertExample,
  convertExclusiveMinimum: convertExclusiveMinimum,
  convertExclusiveMaximum: convertExclusiveMaximum,
  convertConst: convertConst,
  convertImageBase64: convertImageBase64,
  convertMultiPartBinary: convertMultiPartBinary
};
