/**
 * Applies an overlay to an OpenAPI Specification (OAS).
 *
 * @param {Object} baseOAS - The base OpenAPI Specification to be processed.
 * @param {Object} options - The options containing overlaySet and additional configurations.
 * @returns {Object} - An object containing the processed OpenAPI Specification and result metadata.
 */
async function openapiOverlay(baseOAS, options) {
  if (!baseOAS || typeof baseOAS !== 'object') {
    throw new Error('Invalid base OpenAPI Specification provided.');
  }

  const overlayDoc = options?.overlaySet;

  if (!overlayDoc || !Array.isArray(overlayDoc.actions)) {
    throw new Error('Overlay document must contain an array of actions.');
  }

  let unusedActions = [...overlayDoc.actions]; // Track unused actions
  let totalActions = overlayDoc.actions.length; // Total actions provided

  overlayDoc?.actions.forEach((action) => {
    const { target, update, remove } = action;

    if (!target) {
      console.error('Action with missing target');
      return;
    }

    const targets = resolveJsonPath(baseOAS, target);

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
      if (targets.length === 0 && target === '$') {
        baseOAS = deepMerge(baseOAS, update);
      } else {
        targets.forEach((node) => {
          node.parent[node.key] = deepMerge(node.value, update);
        });
      }
    }
  });

  // Return the processed OpenAPI Specification along with result metadata
  return {
    data: baseOAS, // The processed OpenAPI document
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
  const segments = path
    .replace(/\['?([^.\[\]]+)'?\]/g, '.$1') // Convert bracket notation to dot notation
    .split('.')
    .slice(1);

  const results = [];

  function traverse(current, currentPath = [], parent = null, key = null) {
    const segment = segments[currentPath.length];

    if (segment === undefined) {
      results.push({ parent, key, value: current });
      return;
    }

    if (segment === '*') {
      if (Array.isArray(current)) {
        current.forEach((item, index) => traverse(item, [...currentPath, index], current, index));
      } else if (typeof current === 'object' && current !== null) {
        Object.keys(current).forEach((childKey) =>
          traverse(current[childKey], [...currentPath, childKey], current, childKey)
        );
      }
    } else if (segment === '..') {
      traverse(current, currentPath, parent, key); // Include current level
      if (typeof current === 'object' && current !== null) {
        Object.values(current).forEach((value) => traverse(value, currentPath, parent, key));
      }
    } else if (Array.isArray(current) && /^[0-9]+$/.test(segment)) {
      traverse(current[parseInt(segment)], [...currentPath, segment], current, segment);
    } else if (typeof current === 'object' && current !== null && current.hasOwnProperty(segment)) {
      traverse(current[segment], [...currentPath, segment], current, segment);
    }
  }

  traverse(obj);
  return results;
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
    return [...target, ...source];
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
  openapiOverlay
};
