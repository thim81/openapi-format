const {paths: jsonPathPaths} = require('jsonpathly');

/**
 * Applies an overlay to an OpenAPI Specification (OAS).
 *
 * @param {Object} oaObj - The base OpenAPI Specification to be processed.
 * @param {Object} options - The options containing overlaySet and additional configurations.
 * @returns {Object} - An object containing the processed OpenAPI Specification and result metadata.
 */
async function openapiOverlay(oaObj, options) {
  const overlayDoc = options?.overlaySet;

  let unusedActions = [...(overlayDoc?.actions || [])]; // Track unused actions
  let totalActions = overlayDoc?.actions?.length || 0; // Total actions provided
  let usedActions = []; // Initialize usedActions array

  (overlayDoc?.actions || []).forEach(action => {
    const {target, update, remove} = action;

    if (!target) {
      console.error('Action with missing target');
      return;
    }

    // Explicitly handle the `$` target for the root object
    if (target === '$') {
      if (update) {
        oaObj = deepMerge(oaObj, update);
        usedActions.push(action);
        unusedActions = unusedActions.filter(a => a !== action);
      }
      if (remove) {
        console.error('Remove operations are not supported at the root level.');
      }
      return;
    }

    // Resolve JSONPath for other targets
    const targets = resolveJsonPath(oaObj, target);

    if (targets.length > 0) {
      // Mark this action as used
      usedActions.push(action);
      unusedActions = unusedActions.filter(a => a !== action);
    }

    if (remove) {
      // Handle remove actions
      targets.forEach(node => {
        if (node.parent && node.key !== undefined) {
          if (Array.isArray(node.parent)) {
            // Splice array item instead of setting it to null
            node.parent.splice(node.key, 1);
          } else {
            delete node.parent[node.key];
          }
        }
      });
    } else if (update) {
      // Handle update actions
      targets.forEach(node => {
        if (node.parent && node.key !== undefined) {
          // make a copy of the update object any further updates aren't applied
          // multiple times to the same object
          node.parent[node.key] = deepMerge(node.value, cloneJsonLike(update));
        }
      });
    }
  });

  // Return the processed OpenAPI Specification along with result metadata
  return {
    data: oaObj, // The processed OpenAPI document
    resultData: {
      unusedActions,
      usedActions,
      totalActions,
      totalUsedActions: totalActions - unusedActions.length,
      totalUnusedActions: unusedActions.length
    }
  };
}

/**
 * Resolves JSONPath expressions to matching nodes in an object.
 *
 * @param {Object} obj - The object to resolve paths in.
 * @param {string} path - The JSONPath expression.
 * @returns {Array} - An array of matching nodes, each with { parent, key, value }.
 */
function resolveJsonPath(obj, path) {
  if (typeof path !== 'string' || !path.startsWith('$') || obj.length === 0) {
    return [];
  }

  try {
    const lengthCompatNodes = resolveArrayLengthCompat(obj, path);
    if (lengthCompatNodes) {
      return lengthCompatNodes;
    }

    const enginePath = normalizeJsonPathForEngine(path);
    const matchPaths = jsonPathPaths(obj, enginePath);
    return matchPaths.map(matchPath => resolveNodeFromNormalizedPath(obj, matchPath));
  } catch (err) {
    console.error(`Error resolving JSONPath: ${err.message}`);
    return [];
  }
}

/**
 * Resolves JSONPath expressions to matching node values in an object.
 *
 * @param {Object} obj - The object to resolve paths in.
 * @param {string} path - The JSONPath expression.
 * @returns {Array} - An array of matching nodes' values.
 */
function resolveJsonPathValue(obj, path) {
  const nodes = resolveJsonPath(obj, path);
  return nodes.map(node => node.value);
}

/**
 * Normalizes RFC-style filter selectors for engines that prefer `?(@...)`.
 * jsonpathly v3 supports both forms, but keeping this shim is harmless and
 * preserves compatibility if parser behavior changes.
 *
 * @param {string} path - JSONPath expression.
 * @returns {string}
 */
function normalizeJsonPathForEngine(path) {
  return path.replace(/\[\?(@|\$)([^\]]*)\]/g, '[?($1$2)]');
}

/**
 * Resolves node metadata from a jsonpathly normalized path string.
 *
 * @param {Object|Array} obj - Source object.
 * @param {string} normalizedPath - RFC 9535 normalized path (e.g. $['a'][0]['b']).
 * @returns {{ value: any, parent: any, key: string|number|undefined }}
 */
function resolveNodeFromNormalizedPath(obj, normalizedPath) {
  const segments = parseNormalizedPath(normalizedPath);

  if (segments.length === 0) {
    return {value: obj, parent: undefined, key: undefined};
  }

  const key = segments[segments.length - 1];
  let parent = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    parent = parent?.[segments[i]];
  }

  return {
    value: parent?.[key],
    parent,
    key
  };
}

/**
 * Parses jsonpathly normalized paths (RFC 9535 bracket notation) into segments.
 *
 * @param {string} normalizedPath - Normalized path string.
 * @returns {Array<string|number>}
 */
function parseNormalizedPath(normalizedPath) {
  if (normalizedPath === '$') {
    return [];
  }

  if (typeof normalizedPath !== 'string' || !normalizedPath.startsWith('$')) {
    throw new Error(`Invalid normalized path: ${normalizedPath}`);
  }

  const segments = [];
  let i = 1;

  while (i < normalizedPath.length) {
    if (normalizedPath[i] !== '[') {
      throw new Error(`Invalid normalized path: ${normalizedPath}`);
    }
    i++;

    if (normalizedPath[i] === "'") {
      i++;
      let token = '';
      while (i < normalizedPath.length) {
        const ch = normalizedPath[i];
        if (ch === '\\') {
          i++;
          if (i >= normalizedPath.length) {
            throw new Error(`Invalid normalized path: ${normalizedPath}`);
          }
          token += normalizedPath[i];
          i++;
          continue;
        }
        if (ch === "'") {
          i++;
          break;
        }
        token += ch;
        i++;
      }
      if (normalizedPath[i] !== ']') {
        throw new Error(`Invalid normalized path: ${normalizedPath}`);
      }
      i++;
      segments.push(token);
      continue;
    }

    let token = '';
    while (i < normalizedPath.length && normalizedPath[i] !== ']') {
      token += normalizedPath[i];
      i++;
    }
    if (normalizedPath[i] !== ']') {
      throw new Error(`Invalid normalized path: ${normalizedPath}`);
    }
    i++;
    if (!/^-?\d+$/.test(token)) {
      throw new Error(`Invalid normalized path segment: ${normalizedPath}`);
    }
    segments.push(Number(token));
  }

  return segments;
}

/**
 * Compatibility shim for array `.length` access used by existing tests.
 *
 * @param {Object|Array} obj - Source object.
 * @param {string} path - JSONPath expression.
 * @returns {Array<{ value: any; parent: any; key: string | number }>|null}
 */
function resolveArrayLengthCompat(obj, path) {
  const lengthDotMatch = path.match(/^(.*)\.length$/);
  const lengthBracketMatch = path.match(/^(.*)\[['"]length['"]\]$/);
  const parentPath = lengthDotMatch?.[1] || lengthBracketMatch?.[1];

  if (!parentPath || !parentPath.startsWith('$')) {
    return null;
  }

  const parentNodes = resolveJsonPath(obj, parentPath);
  return parentNodes
    .filter(node => Array.isArray(node.value))
    .map(node => ({
      value: node.value.length,
      parent: node.value,
      key: 'length'
    }));
}

/**
 * Clone JSON-like values (plain objects/arrays/primitives) in the local realm.
 *
 * @param {any} value - Value to clone.
 * @returns {any}
 */
function cloneJsonLike(value) {
  if (Array.isArray(value)) {
    return value.map(cloneJsonLike);
  }

  if (value && typeof value === 'object') {
    const cloned = {};
    for (const key in value) {
      cloned[key] = cloneJsonLike(value[key]);
    }
    return cloned;
  }

  return value;
}

/**
 * Deep merges two objects or arrays.
 *
 * @param {Object|Array} target - The target object or array.
 * @param {Object|Array} source - The source object or array.
 * @returns {Object|Array} - The merged result.
 */
function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    // Merge arrays by unique 'name' and 'in' for OpenAPI parameters
    const mergedArray = [...target];
    source.forEach(sourceItem => {
      if (sourceItem && sourceItem.name && sourceItem.in) {
        const existingIndex = mergedArray.findIndex(
          targetItem => targetItem && targetItem.name === sourceItem.name && targetItem.in === sourceItem.in
        );
        if (existingIndex !== -1) {
          // Merge existing item with source item
          mergedArray[existingIndex] = deepMerge(mergedArray[existingIndex], sourceItem);
        } else {
          // Add new item
          mergedArray.push(sourceItem);
        }
      } else {
        // For non-parameter arrays, append the item
        mergedArray.push(sourceItem);
      }
    });
    return mergedArray;
  }

  // If source is an array but the target isn't an array, return a shallow copy.
  if (Array.isArray(source)) {
    return source.slice();
  }

  // If source is not an object or is null, return it directly.
  if (typeof source !== 'object' || source === null) return source;

  // If target is not an object or is null, initialize it as an object.
  if (typeof target !== 'object' || target === null) {
    target = {};
  }

  for (const key in source) {
    target[key] = deepMerge(target[key], source[key]);
  }

  return target;
}

module.exports = {
  openapiOverlay,
  deepMerge,
  resolveJsonPath,
  resolveJsonPathValue
};
