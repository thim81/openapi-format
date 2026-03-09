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
  const overlayVersion = overlayDoc?.overlay;

  let unusedActions = [...(overlayDoc?.actions || [])]; // Track unused actions
  let totalActions = overlayDoc?.actions?.length || 0; // Total actions provided
  let usedActions = []; // Initialize usedActions array

  if (!isSupportedOverlayVersion(overlayVersion)) {
    console.error(
      `Unsupported overlay version "${overlayVersion}". Supported versions are 1.0.x and 1.1.x.`
    );
    return {
      data: oaObj,
      resultData: {
        unusedActions,
        usedActions,
        totalActions,
        totalUsedActions: 0,
        totalUnusedActions: unusedActions.length
      }
    };
  }

  (overlayDoc?.actions || []).forEach((action, index) => {
    const {target, update, remove, copy, from} = action || {};
    const actionLabel = `Overlay action #${index + 1}`;

    const validationError = validateOverlayAction(action, actionLabel);
    if (validationError) {
      console.error(validationError);
      return;
    }

    let actionUsed = false;

    // remove (first)
    if (remove === true) {
      if (target === '$') {
        console.error(`${actionLabel}: remove is not supported at target "$".`);
      } else {
        const removed = applyRemoveAction(oaObj, target);
        actionUsed = actionUsed || removed;
      }
    }

    // update (second)
    if (hasOwn(action, 'update')) {
      const updated = applyUpdateAction({
        root: oaObj,
        target,
        update,
        actionLabel
      });
      actionUsed = actionUsed || updated.used;
      if (updated.root !== undefined) {
        oaObj = updated.root;
      }
    }

    // copy (third)
    if (copy === true) {
      const copied = applyCopyAction({
        root: oaObj,
        target,
        from,
        actionLabel
      });
      actionUsed = actionUsed || copied.used;
      if (copied.root !== undefined) {
        oaObj = copied.root;
      }
    }

    if (actionUsed) {
      usedActions.push(action);
      unusedActions = unusedActions.filter(a => a !== action);
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

function hasOwn(obj, key) {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

function isSupportedOverlayVersion(version) {
  if (version === undefined || version === null) {
    return true;
  }

  if (typeof version !== 'string') {
    return false;
  }

  return /^1\.(0|1)\.\d+$/.test(version);
}

function validateOverlayAction(action, actionLabel) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    return `${actionLabel}: action must be an object.`;
  }

  if (typeof action.target !== 'string' || !action.target.startsWith('$')) {
    return `${actionLabel}: action target must be a JSONPath string starting with "$".`;
  }

  const hasUpdate = hasOwn(action, 'update');
  const hasRemove = hasOwn(action, 'remove');
  const hasCopy = hasOwn(action, 'copy');

  if (!hasUpdate && !hasRemove && !hasCopy) {
    return `${actionLabel}: action must define at least one of "update", "remove", or "copy".`;
  }

  if (hasRemove && action.remove !== true) {
    return `${actionLabel}: "remove" must be set to true when present.`;
  }

  if (hasCopy) {
    if (action.copy !== true) {
      return `${actionLabel}: "copy" must be set to true when present.`;
    }
    if (typeof action.from !== 'string' || !action.from.startsWith('$')) {
      return `${actionLabel}: "from" must be a JSONPath string starting with "$" when "copy" is enabled.`;
    }
  }

  return null;
}

function applyRemoveAction(root, targetPath) {
  const targets = resolveJsonPath(root, targetPath);
  if (targets.length === 0) {
    return false;
  }

  targets.forEach(node => {
    if (node.parent && node.key !== undefined) {
      if (Array.isArray(node.parent) && typeof node.key === 'number') {
        node.parent.splice(node.key, 1);
      } else {
        delete node.parent[node.key];
      }
    }
  });
  return true;
}

function applyUpdateAction({root, target, update, actionLabel}) {
  if (target === '$') {
    if (isPlainObject(root) && isPlainObject(update)) {
      return {root: deepMerge(root, cloneJsonLike(update)), used: true};
    }
    console.error(
      `${actionLabel}: update at target "$" requires both root and update to be JSON objects.`
    );
    return {root, used: false};
  }

  const targets = resolveJsonPath(root, target);
  if (targets.length === 0) {
    return {root, used: false};
  }

  let used = false;
  targets.forEach(node => {
    if (!node.parent || node.key === undefined) {
      return;
    }

    const result = applyValueByTargetType({
      targetValue: node.value,
      incomingValue: update,
      mode: 'update',
      actionLabel
    });

    if (result.ok) {
      node.parent[node.key] = result.value;
      used = true;
    }
  });

  return {root, used};
}

function applyCopyAction({root, target, from, actionLabel}) {
  const fromNodes = resolveJsonPath(root, from);
  if (fromNodes.length !== 1) {
    console.error(
      `${actionLabel}: "from" must resolve to exactly one node, resolved ${fromNodes.length}.`
    );
    return {root, used: false};
  }

  const sourceValue = cloneJsonLike(fromNodes[0].value);

  if (target === '$') {
    if (isPlainObject(root) && isPlainObject(sourceValue)) {
      return {root: deepMerge(root, cloneJsonLike(sourceValue)), used: true};
    }
    console.error(
      `${actionLabel}: copy at target "$" requires both root and source to be JSON objects.`
    );
    return {root, used: false};
  }

  const targets = resolveJsonPath(root, target);
  if (targets.length === 0) {
    return {root, used: false};
  }

  let used = false;
  targets.forEach(node => {
    if (!node.parent || node.key === undefined) {
      return;
    }

    const result = applyValueByTargetType({
      targetValue: node.value,
      incomingValue: sourceValue,
      mode: 'copy',
      actionLabel
    });

    if (result.ok) {
      node.parent[node.key] = result.value;
      used = true;
    }
  });

  return {root, used};
}

function applyValueByTargetType({targetValue, incomingValue, mode, actionLabel}) {
  if (Array.isArray(targetValue)) {
    return {
      ok: true,
      value: [...targetValue, cloneJsonLike(incomingValue)]
    };
  }

  if (isPlainObject(targetValue)) {
    if (!isPlainObject(incomingValue)) {
      console.error(
        `${actionLabel}: ${mode} type mismatch - object target requires object value.`
      );
      return {ok: false, value: targetValue};
    }

    return {
      ok: true,
      value: deepMerge(cloneJsonLike(targetValue), cloneJsonLike(incomingValue))
    };
  }

  if (!isPrimitiveLike(incomingValue)) {
    console.error(
      `${actionLabel}: ${mode} type mismatch - primitive target requires primitive value.`
    );
    return {ok: false, value: targetValue};
  }

  return {
    ok: true,
    value: incomingValue
  };
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isPrimitiveLike(value) {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * Resolves JSONPath expressions to matching nodes in an object.
 *
 * @param {Object} obj - The object to resolve paths in.
 * @param {string} path - The JSONPath expression.
 * @returns {Array} - An array of matching nodes, each with { parent, key, value }.
 */
function resolveJsonPath(obj, path) {
  if (typeof path !== 'string' || !path.startsWith('$') || obj == null || obj.length === 0) {
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
