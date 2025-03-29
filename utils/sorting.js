/**
 * Sort Object by Key or list of names
 * @param object
 * @param sortWith
 * @returns {*}
 */
function sortObjectByKeyNameList(object, sortWith) {
  let keys, sortFn;

  if (typeof sortWith === 'function') {
    sortFn = sortWith;
  } else {
    keys = sortWith;
  }

  let objectKeys = Object.keys(object);
  return (keys || []).concat(objectKeys.sort(sortFn)).reduce(function (total, key) {
    if (objectKeys.indexOf(key) !== -1) {
      total[key] = object[key];
    }
    return total;
  }, {});
}

/**
 * Compare function - Sort with Priority logic, keep order for non-priority items
 * @param priorityArr
 * @returns {(function(*=, *=): (number|number))|*}
 */
function propComparator(priorityArr) {
  return function (a, b) {
    if (a === b) {
      return 0;
    }
    if (!Array.isArray(priorityArr)) {
      return 0;
    }
    const ia = priorityArr.indexOf(a);
    const ib = priorityArr.indexOf(b);
    if (ia !== -1) {
      return ib !== -1 ? ia - ib : -1;
    }
    return ib !== -1 || a > b ? 1 : a < b ? -1 : 0;
  };
}

/**
 * Priority sort function
 * @param jsonProp
 * @param sortPriority
 * @param options
 * @returns {*}
 */
function prioritySort(jsonProp, sortPriority, options) {
  if (typeof jsonProp !== 'object' || jsonProp === null) {
    return jsonProp;
  }
  return sortObjectByKeyNameList(jsonProp, propComparator(sortPriority));
}

/**
 * Sort array of objects by property name
 * @param arr
 * @param propertyName
 * @returns {*}
 */
function arraySort(arr, propertyName) {
  return arr.sort((a, b) => {
    const propA = a[propertyName] ? a[propertyName].toLowerCase() : '';
    const propB = b[propertyName] ? b[propertyName].toLowerCase() : '';

    if (propA < propB) {
      return -1;
    }
    if (propA > propB) {
      return 1;
    }
    return 0;
  });
}

/**
 * Sort OpenAPI paths by alphabet
 * @param paths
 * @returns {{[p: string]: unknown}}
 */

function sortPathsByAlphabet(paths) {
  // Convert the paths object to an array of entries
  const entries = Object.entries(paths);
  // Sort the entries alphabetically by their paths
  entries.sort((a, b) => {
    const pathA = a[0].split('/');
    const pathB = b[0].split('/');

    for (let i = 1; i < Math.max(pathA.length, pathB.length); i++) {
      if (!pathA[i]) return -1;
      if (!pathB[i]) return 1;
      if (pathA[i] < pathB[i]) return -1;
      if (pathA[i] > pathB[i]) return 1;
    }

    return 0;
  });
  return Object.fromEntries(entries);
}

/**
 * Sort OpenAPI paths by tags
 * @param paths
 * @returns {{[p: string]: unknown}}
 */
function sortPathsByTags(paths) {
  const entries = Object.entries(paths);
  // Sort the entries by the first tag in the available methods
  entries.sort((a, b) => {
    const methodsA = a[1];
    const methodsB = b[1];

    const tagsOrder = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    let tagA = '';
    let tagB = '';

    for (const method of tagsOrder) {
      if (methodsA[method] && methodsA[method].tags && methodsA[method].tags.length > 0) {
        tagA = methodsA[method].tags[0];
        break;
      }
    }

    for (const method of tagsOrder) {
      if (methodsB[method] && methodsB[method].tags && methodsB[method].tags.length > 0) {
        tagB = methodsB[method].tags[0];
        break;
      }
    }

    if (tagA < tagB) {
      return -1;
    }
    if (tagA > tagB) {
      return 1;
    }
    return 0;
  });
  return Object.fromEntries(entries);
}

/**
 * A check if the OpenAPI operation item matches a target definition .
 * @param {object} operationPath the OpenAPI path item to match
 * @param {object} operationMethod the OpenAPI method item to match
 * @param {string} target the entered operation definition that is a combination of the method & path, like GET::/lists
 * @returns {boolean} matching information
 */
function isMatchOperationItem(operationPath, operationMethod, target) {
  if (operationPath && operationMethod && target) {
    const targetSplit = target.split('::');
    if (targetSplit[0] && targetSplit[1]) {
      let targetMethod = [targetSplit[0].toLowerCase()];
      const targetPath = targetSplit[1].toLowerCase();
      // Wildcard support
      if (targetMethod.includes('*')) {
        // These are the methods supported in the PathItem schema
        // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#pathItemObject
        targetMethod = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
      }
      return (
        operationMethod &&
        targetMethod.includes(operationMethod.toLowerCase()) &&
        operationPath &&
        matchPath(targetPath, operationPath.toLowerCase())
      );
    }
  }
  return false;
}

/**
 * Converts a string path to a Regular Expression.
 * Transforms path parameters into named RegExp groups.
 * @param {*} path the path pattern to match
 * @returns {RegExp} Return a regex
 * @no-unit-tests
 */
function pathToRegExp(path) {
  const pattern = path
    // Escape literal dots
    .replace(/\./g, '\\.')
    // Escape literal slashes
    .replace(/\//g, '/')
    // Escape literal question marks
    .replace(/\?/g, '\\?')
    // Ignore trailing slashes
    .replace(/\/+$/, '')
    // Replace wildcard with any zero-to-any character sequence
    .replace(/\*+/g, '.*')
    // Replace parameters with named capturing groups
    .replace(/:([^\d|^\/][a-zA-Z0-9_]*(?=(?:\/|\\.)|$))/g, (_, paramName) => `(?<${paramName}>[^\/]+?)`)
    // Allow optional trailing slash
    .concat('(\\/|$)');
  return new RegExp(pattern, 'gi');
}

/**
 * Matches a given url against a path, with Wildcard support (based on the node-match-path package)
 * @param {*} path the path pattern to match
 * @param {*} url the entered URL is being evaluated for matching
 * @returns {boolean} matching information
 */
function matchPath(path, url) {
  const expression = path instanceof RegExp ? path : pathToRegExp(path),
    match = expression.exec(url) || false;
  // Matches in strict mode: match string should equal to input (url)
  // Otherwise loose matches will be considered truthy:
  // match('/messages/:id', '/messages/123/users') // true
  // eslint-disable-next-line one-var,no-implicit-coercion
  const matches = path instanceof RegExp ? !!match : !!match && match[0] === match.input;
  return matches;
  // return {
  //   matches,
  //   params: match && matches ? match.groups || null : null
  // };
}

module.exports = {
  sortObjectByKeyNameList,
  propComparator,
  arraySort,
  prioritySort,
  sortPathsByAlphabet,
  sortPathsByTags,
  isMatchOperationItem,
  pathToRegExp,
  matchPath
};
