const jp = require("jsonpath");

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
  let totalActions = overlayDoc?.actions?.length || 0;  // Total actions provided

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
 * Resolves JSONPath expressions to matching nodes in an object.
 *
 * @param {Object} obj - The object to resolve paths in.
 * @param {string} path - The JSONPath expression.
 * @returns {Array} - An array of matching nodes, each with { parent, key, value }.
 */
function resolveJsonPath(obj, path) {
  if (typeof path !== 'string' || !path.startsWith('$')) {
    return [];
  }

  try {
    const nodes = jp.nodes(obj, path); // Get nodes, including paths and values

    return nodes.map(({ path: matchPath, value }) => {
      const parentPath = matchPath.slice(0, -1); // Parent path
      const key = matchPath[matchPath.length - 1]; // Key of the current node
      const parent =
        parentPath.length > 0 ? jp.value(obj, jp.stringify(parentPath)) : null;

      return {
        value,
        parent,
        key,
      };
    });
  } catch (err) {
    console.error(`Error resolving JSONPath: ${err.message}`);
    return [];
  }
}

/**
 * Resolves JSONPath expressions to matching node values in an object.
 *
 * @param {Object} obj - The object to resolve paths in.
 * @param {string} path - The JSONPath-like expression.
 * @returns {Array} - An array of matching nodes' values.
 */
function resolveJsonPathValue(obj, path) {
  const nodes = resolveJsonPath(obj, path);
  return nodes.map((node) => node.value);
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
  resolveJsonPath,
  resolveJsonPathValue
};
