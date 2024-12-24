/**
 * Applies an overlay to an OpenAPI Specification (OAS).
 *
 * @param {Object} oaObj - The base OpenAPI Specification to be processed.
 * @param {Object} options - The options containing overlaySet and additional configurations.
 * @returns {Object} - An object containing the processed OpenAPI Specification and result metadata.
 */
async function openapiOverlay(oaObj, options) {
  const overlayDoc = options?.overlaySet;

  let unusedActions = [...overlayDoc.actions]; // Track unused actions
  let totalActions = overlayDoc.actions.length; // Total actions provided

  overlayDoc?.actions.forEach((action) => {
    const { target, update, remove } = action;

    if (!target) {
      console.error('Action with missing target');
      return;
    }

    // Explicitly handle the `$` target for the root object
    if (target === '$') {
      if (update) {
        oaObj = deepMerge(oaObj, update);
        unusedActions = unusedActions.filter((a) => a !== action);
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
      unusedActions = unusedActions.filter((a) => a !== action);
    }

    if (remove) {
      // Handle remove actions
      targets.forEach((node) => {
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
      targets.forEach((node) => {
        if (node.parent && node.key !== undefined) {
          node.parent[node.key] = deepMerge(node.value, update);
        }
      });
    }
  });

  // Return the processed OpenAPI Specification along with result metadata
  return {
    data: oaObj, // The processed OpenAPI document
    resultData: {
      unusedActions: unusedActions, // Actions that couldn't be applied
      totalActions: totalActions, // Total number of actions in the overlay
      appliedActions: totalActions - unusedActions.length, // Successfully applied actions
    },
  };
}

/**
 * Resolves JSONPath-like expressions to matching nodes in an object.
 *
 * @param {Object} obj - The object to resolve paths in.
 * @param {string} path - The JSONPath-like expression.
 * @returns {Array} - An array of matching nodes, each with { parent, key, value }.
 */
function resolveJsonPath(obj, path) {
  if (typeof path !== 'string' || !path.startsWith('$')) {
    return [];
  }

  const segments = path
    .replace(/\['?([^.\[\]]+)'?\]/g, '.$1') // Convert bracket notation to dot notation
    .split('.')
    .slice(1);

  const results = [];

  function traverse(current, currentPath = [], parent = null, key = null) {
    if (current === null || current === undefined) return;

    const segment = segments[currentPath.length];

    if (segment === undefined) {
      results.push({ parent, key, value: current });
      return;
    }

    if (segment === '*') {
      if (Array.isArray(current)) {
        current.forEach((item, index) => traverse(item, [...currentPath, index], current, index));
      } else if (typeof current === 'object') {
        Object.keys(current).forEach((childKey) =>
          traverse(current[childKey], [...currentPath, childKey], current, childKey)
        );
      }
    /*} else if (/^\?\((.*)\)$/.test(segment)) {
      // Handle filtering
      const condition = segment.match(/^\?\((.*)\)$/)[1];
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          try {
            if (eval(condition.replace(/@/g, 'item'))) {
              traverse(item, [...currentPath, index], current, index);
            }
          } catch {
            // Silently fail for invalid expressions
          }
        });
      }
    } else if (/^\d*:\d*(:\d+)?$/.test(segment)) {
      // Array slicing
      const [start, end, step] = segment.split(':').map((s) => (s ? parseInt(s) : undefined));
      const sliced = current.slice(start, end);
      sliced.forEach((item, index) =>
        traverse(item, [...currentPath, start + index], current, start + index)
      );
    } else if (segment.includes(',')) {
      // Handle union
      const keys = segment.split(',');
      keys.forEach((key) => {
        const normalizedKey = key.replace(/^['"]|['"]$/g, '');
        if (Array.isArray(current) && /^[0-9]+$/.test(normalizedKey)) {
          traverse(current[parseInt(normalizedKey)], [...currentPath, normalizedKey], current, normalizedKey);
        } else if (typeof current === 'object' && current.hasOwnProperty(normalizedKey)) {
          traverse(current[normalizedKey], [...currentPath, normalizedKey], current, normalizedKey);
        }
      });*/
    } else if (segment === '..') {
      // Recursive descent
      if (typeof current === 'object') {
        Object.keys(current).forEach((childKey) =>
          traverse(current[childKey], currentPath, current, childKey)
        );
      }
      traverse(current, [...currentPath]);
    } else if (segment === 'length' && Array.isArray(current)) {
      // Length of arrays
      results.push({ parent, key, value: current.length });
    } else if (Array.isArray(current) && /^[0-9]+$/.test(segment)) {
      traverse(current[parseInt(segment)], [...currentPath, segment], current, segment);
    } else if (typeof current === 'object' && current.hasOwnProperty(segment)) {
      traverse(current[segment], [...currentPath, segment], current, segment);
    }
  }

  traverse(obj);
  return results.map((node) => node.value);
}

/**
 * Deep merges two objects or arrays.
 *
 * @param {Object|Array} target - The target object or array.
 * @param {Object|Array} source - The source object or array.
 * @returns {Object|Array} - The merged result.
 */
function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) return source;

  if (Array.isArray(target) && Array.isArray(source)) {
    // Merge arrays by unique 'name' and 'in' for OpenAPI parameters
    const mergedArray = [...target];
    source.forEach((sourceItem) => {
      if (sourceItem && sourceItem.name && sourceItem.in) {
        const existingIndex = mergedArray.findIndex(
          (targetItem) =>
            targetItem && targetItem.name === sourceItem.name && targetItem.in === sourceItem.in
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
  resolveJsonPath
};
