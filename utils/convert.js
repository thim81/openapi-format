const {isObject, isArray, isNumber, isString, isUndefined} = require('./types');

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
  const dto = {};
  let i = 0;
  const ordering = Object.keys(obj);

  // Loop through the original object
  for (let prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      // If the indexes match, add the new item
      if (i === index && isNumber(index) && key && !isUndefined(value)) {
        dto[key] = value;
      }
      // Add the current item in the loop to the temp obj
      dto[prop] = obj[prop];

      // Add/overwrite item
      if (isString(index) && i === ordering.indexOf(index) && key && !isUndefined(value)) {
        dto[key] = value;
      }
      // Increase the count
      i++;
    }
  }
  // If no index, add to the end
  if (!index && key) {
    Object.assign(dto, {[key]: value});
  }
  return dto;
}

/**
 * converts:
 *   `type: 'thing'` -> `type: ['thing']`
 *   `type: 'thing', nullable: true` -> `type: ['thing', 'null']`
 *   `anyOf: ['thing'], nullable: true` -> `anyOf: ['thing', {type: 'null'}]`
 *   `oneOf: ['thing'], nullable: true` -> `oneOf: ['thing', {type: 'null'}]`
 *
 * @param {object} obj
 * @returns {*}
 */
function convertNullable(obj) {
  if (!isObject(obj)) return obj;
  if (obj.nullable === undefined) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Update for 3.1
  if (obj.type) {
    const types = [dto.type.toString()];
    if (dto.nullable === true) {
      types.push('null');
    }
    dto = setInObject(dto, 'type', types, 'type');
  } else if (dto.nullable === true && Array.isArray(dto.oneOf)) {
    const withNullType = dto.oneOf.concat({type: 'null'});
    dto = setInObject(dto, 'oneOf', withNullType, 'oneOf');
  } else if (dto.nullable === true && Array.isArray(dto.anyOf)) {
    const withNullType = dto.anyOf.concat({type: 'null'});
    dto = setInObject(dto, 'anyOf', withNullType, 'anyOf');
  }
  // Remove 3.0 prop
  delete dto.nullable;
  return dto;
}

/**
 * Convert exclusiveMinimum property
 * @param {object} obj
 * @returns {*}
 */
function convertExclusiveMinimum(obj) {
  if (!isObject(obj)) return obj;
  if (obj.exclusiveMinimum === undefined || obj.minimum === undefined) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.exclusiveMinimum === true) {
    dto = setInObject(dto, 'exclusiveMinimum', dto.minimum, 'exclusiveMinimum');
    delete dto.minimum;
  } else {
    // Remove 3.0 prop
    delete dto.exclusiveMinimum;
  }
  return dto;
}

/**
 * Convert exclusiveMinimum property
 * @param {object} obj
 * @returns {*}
 */
function convertExclusiveMaximum(obj) {
  if (!isObject(obj)) return obj;
  if (obj.exclusiveMaximum === undefined || obj.maximum === undefined) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (dto.exclusiveMaximum === true) {
    dto = setInObject(dto, 'exclusiveMaximum', dto.maximum, 'exclusiveMaximum');
    delete dto.maximum;
  } else {
    // Remove 3.0 prop
    delete dto.exclusiveMaximum;
  }
  return dto;
}

/**
 * Convert example property to array of examples
 * @param {object} obj
 * @returns {*}
 */
function convertExample(obj) {
  if (!isObject(obj)) return obj;
  if (obj.example === undefined) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  const examples = [dto.example];
  // Set 3.1 examples
  dto = setInObject(dto, 'examples', examples, 'example');
  // Remove 3.0 example
  delete dto.example;
  return dto;
}

/**
 * Convert single enum property to const
 * @param {object} obj
 * @returns {*}
 */
function convertConst(obj) {
  if (!isObject(obj)) return obj;
  if (obj.enum === undefined || !isArray(obj.enum) || obj.enum.length > 1) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Set 3.1 const
  dto = setInObject(dto, 'const', dto.enum[0], 'enum');
  // Remove 3.0 enum
  delete dto.enum;
  return dto;
}

/**
 * Convert Uploading an image with base64 encoding
 * @param {object} obj
 * @returns {*}
 */
function convertImageBase64(obj) {
  if (!isObject(obj)) return obj;
  if (!obj.schema || !obj.schema.format || obj.schema.format !== 'base64') return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Set 3.1 contentEncoding
  dto.schema = setInObject(dto.schema, 'contentEncoding', dto.schema.format, 'format');
  // Remove 3.0 format
  delete dto.schema.format;
  return dto;
}

/**
 * Convert Multipart file uploads with a binary file
 * @param {object} obj
 * @returns {*}
 */
function convertMultiPartBinary(obj) {
  if (!isObject(obj)) return obj;
  if (obj.format !== 'binary') return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  // Set 3.1 contentMediaType
  dto = setInObject(dto, 'contentMediaType', 'application/octet-stream', 'format');
  // Remove 3.0 binary format
  delete dto.format;
  return dto;
}

/**
 * Convert tag x-displayName extension to summary
 * @param {object} obj
 * @returns {*}
 */
function convertTagDisplayName(obj) {
  if (!isObject(obj)) return obj;
  if (!Object.prototype.hasOwnProperty.call(obj, 'x-displayName')) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  const displayName = dto['x-displayName'];

  if (isString(displayName) && displayName.trim() && !dto.summary) {
    dto = setInObject(dto, 'summary', displayName, 'name');
  }

  delete dto['x-displayName'];
  return dto;
}

/**
 * Convert x-tagGroups extension to native parent relationships
 * @param {object} obj
 * @returns {*}
 */
function convertTagGroups(obj) {
  if (!isObject(obj)) return obj;
  if (!isArray(obj['x-tagGroups']) || obj['x-tagGroups'].length === 0) return obj;

  let dto = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
  if (!isArray(dto.tags)) {
    dto.tags = [];
  }

  const tagGroups = dto['x-tagGroups'];
  const tags = dto.tags;

  const tagEntries = new Map();
  tags.forEach((tag, index) => {
    if (isObject(tag) && isString(tag.name) && tag.name) {
      tagEntries.set(tag.name, {index, tag});
    }
  });

  const findTagEntry = name => {
    if (!isString(name) || !name) return undefined;
    if (tagEntries.has(name)) return tagEntries.get(name);
    const lowerName = name.toLowerCase();
    for (const [key, value] of tagEntries.entries()) {
      if (key.toLowerCase() === lowerName) return value;
    }
    for (const value of tagEntries.values()) {
      const tag = value.tag || {};
      if (isString(tag.summary) && tag.summary.toLowerCase() === lowerName) return value;
      if (isString(tag['x-displayName']) && tag['x-displayName'].toLowerCase() === lowerName) return value;
    }
    return undefined;
  };

  const slugify = value => {
    if (!isString(value)) return '';
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const ensureUniqueName = baseName => {
    let name = baseName || 'tag-group';
    if (!tagEntries.has(name)) return name;
    let counter = 1;
    while (tagEntries.has(`${name}-${counter}`)) {
      counter += 1;
    }
    return `${name}-${counter}`;
  };

  let converted = false;

  tagGroups.forEach(group => {
    if (!isObject(group) || !isArray(group.tags) || group.tags.length === 0) return;

    const groupName = isString(group.name) ? group.name : undefined;
    const groupDescription = isString(group.description) ? group.description : undefined;

    let parentEntry = groupName ? findTagEntry(groupName) : undefined;
    if (!parentEntry && groupName) {
      parentEntry = findTagEntry(slugify(groupName));
    }

    if (!parentEntry && groupName) {
      const uniqueName = ensureUniqueName(slugify(groupName) || groupName);
      let parentTag = {name: uniqueName};
      if (groupName) {
        parentTag = setInObject(parentTag, 'summary', groupName, 'name');
      }
      if (groupDescription) {
        parentTag = setInObject(parentTag, 'description', groupDescription, 'summary');
      }
      parentTag = setInObject(
        parentTag,
        'kind',
        'nav',
        groupDescription ? 'description' : groupName ? 'summary' : 'name'
      );
      tags.push(parentTag);
      parentEntry = {index: tags.length - 1, tag: parentTag};
      tagEntries.set(parentTag.name, parentEntry);
      converted = true;
    }

    if (!parentEntry) return;

    converted = true;

    let parentTag = parentEntry.tag;

    if (groupName && !parentTag.summary) {
      parentTag = setInObject(parentTag, 'summary', groupName, 'name');
      converted = true;
    }
    if (groupDescription && !parentTag.description) {
      parentTag = setInObject(parentTag, 'description', groupDescription, parentTag.summary ? 'summary' : 'name');
      converted = true;
    }
    if (!parentTag.kind) {
      const insertAfter = parentTag.description ? 'description' : parentTag.summary ? 'summary' : 'name';
      parentTag = setInObject(parentTag, 'kind', 'nav', insertAfter);
      converted = true;
    }

    tags[parentEntry.index] = parentTag;
    parentEntry.tag = parentTag;
    tagEntries.set(parentTag.name, parentEntry);

    const parentName = parentTag.name;

    group.tags.forEach(tagName => {
      if (!isString(tagName) || !tagName) return;
      const childEntry = findTagEntry(tagName);
      if (!childEntry) return;
      if (childEntry === parentEntry) return;

      let childTag = childEntry.tag;
      if (!childTag.parent) {
        const insertParentAfter = childTag.description ? 'description' : childTag.summary ? 'summary' : 'name';
        childTag = setInObject(childTag, 'parent', parentName, insertParentAfter);
        converted = true;
      }
      if (!childTag.kind) {
        const insertKindAfter = childTag.parent
          ? 'parent'
          : childTag.description
            ? 'description'
            : childTag.summary
              ? 'summary'
              : 'name';
        childTag = setInObject(childTag, 'kind', 'nav', insertKindAfter);
        converted = true;
      }

      tags[childEntry.index] = childTag;
      childEntry.tag = childTag;
      tagEntries.set(childTag.name, childEntry);
    });
  });

  if (converted) {
    delete dto['x-tagGroups'];
    dto.tags = tags;
  }

  return dto;
}

/**
 * Resolve the OpenAPI target version for conversion.
 * Supports converting to OpenAPI 3.1 and 3.2.
 *
 * @param {object|string|number} value Version value coming from options.
 * @returns {{label: string, normalized: string}|undefined}
 */
function normalizeConvertVersion(value) {
  if (value === undefined || value === null) return undefined;

  const versionString = value.toString().trim();
  if (versionString === '') return undefined;

  const match = versionString.match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!match) return undefined;

  const [, major, minor] = match;
  const label = `${major}.${minor}`;

  switch (label) {
    case '3.1':
      return {label, normalized: '3.1.0'};
    case '3.2':
      return {label, normalized: '3.2.0'};
    default:
      return undefined;
  }
}

/**
 * Resolve the conversion target information from available options.
 *
 * @param {object} [options]
 * @returns {{label: string, normalized: string}|undefined}
 */
function resolveConvertTargetVersion(options = {}) {
  const candidates = [options.convertTargetVersion, options.convertTo, options.convertToVersion];

  for (const candidate of candidates) {
    const normalized = normalizeConvertVersion(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

module.exports = {
  setInObject: setInObject,
  convertNullable: convertNullable,
  convertExample: convertExample,
  convertExclusiveMinimum: convertExclusiveMinimum,
  convertExclusiveMaximum: convertExclusiveMaximum,
  convertConst: convertConst,
  convertImageBase64: convertImageBase64,
  convertMultiPartBinary: convertMultiPartBinary,
  convertTagDisplayName: convertTagDisplayName,
  convertTagGroups: convertTagGroups,
  normalizeConvertVersion: normalizeConvertVersion,
  resolveConvertTargetVersion: resolveConvertTargetVersion
};
