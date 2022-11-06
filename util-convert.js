const {isObject} = require("./util-types");

/**
 * Convert nullable property to type
 * @param {object} obj
 * @returns {*}
 */
function convertNullable(obj) {
  if (!isObject(obj)) return obj
  const dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.nullable !== undefined) {
    const types = [dto.type.toString()]
    if (dto.nullable === true) {
      types.push('null')
    }
    // Remove 3.0 prop
    delete dto.nullable
    // Update 3.1 type
    dto.type = types
  }
  return dto
}

/**
 * Convert exclusiveMinimum/exclusiveMaximum property
 * @param {object} obj
 * @returns {*}
 */
function convertExclusive(obj) {
  if (!isObject(obj)) return obj
  const dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object

  if (dto.exclusiveMinimum !== undefined && dto.minimum !== undefined) {
    if (dto.exclusiveMinimum === true) {
      dto.exclusiveMinimum = dto.minimum
      delete dto.minimum
    } else {
      // Remove 3.0 prop
      delete dto.exclusiveMinimum
    }
  }

  if (dto.exclusiveMaximum !== undefined && dto.maximum !== undefined) {
    if (dto.exclusiveMaximum === true) {
      dto.exclusiveMaximum = dto.maximum
      delete dto.maximum
    } else {
      // Remove 3.0 prop
      delete dto.exclusiveMaximum
    }
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
  const dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.example !== undefined) {
    const examples = [dto.example]
    // Remove 3.0 example
    delete dto.example
    // Set 3.1 examples
    dto.examples = examples
  }
  return dto
}

/**
 * Convert Uploading an image with base64 encoding
 * @param {object} obj
 * @returns {*}
 */
function convertImageBase64(obj) {
  if (!isObject(obj)) return obj
  const dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.schema && dto.schema.format === 'base64') {
    // Set 3.1 contentEncoding
    dto.schema.contentEncoding = dto.schema.format
    // Remove 3.0 format
    delete dto.schema.format

  }
  return dto
}

/**
 * Convert Multipart file uploads with a binary file
 * @param {object} obj
 * @returns {*}
 */
function convertMultiPartBinary(obj) {
  if (!isObject(obj)) return obj
  const dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto && dto.format === 'binary') {
    // Set 3.1 contentMediaType
    dto.contentMediaType = 'application/octet-stream'
    // Remove 3.0 binary format
    delete dto.format

  }
  return dto
}

module.exports = {
  convertNullable: convertNullable,
  convertExample: convertExample,
  convertExclusive: convertExclusive,
  convertImageBase64: convertImageBase64,
  convertMultiPartBinary: convertMultiPartBinary
};
