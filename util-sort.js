
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
  if (!Array.isArray(priorityArr)) {
    return function (a, b) { return 0 }
  }
  return function (a, b) {
    if (a === b) {
      return 0;
    }
    const ia = priorityArr.indexOf(a);
    const ib = priorityArr.indexOf(b);
    if (ia !== -1) {
      return ib !== -1 ? ia - ib : -1;
    }
    return ib !== -1 || a > b ? 1 : a < b ? -1 : 0;
  }
}

/**
 * Sort array by property value of items
 * @param array
 * @param sortWith
 * @rturns {*}
 */
function sortArrayByItemProps(array, sortWith) {
  const sortedArray = Array.from(array);
  sortedArray.sort(sortWith);
  return sortedArray;
}

/**
 * Compare objects by their property values
 * @param priorityArr
 * @returns {(function(*=, *=): (number|number))|*}
 */
function objComparator(priorityArr) {
  if (!Array.isArray(priorityArr)) {
    return function (a, b) { return 0 }
  }
  return function (a, b) {
    if (a === b) {
      return 0;
    }
    for (const key of priorityArr) {
      if (key in a) {
        if (key in b) {
          if (a[key] > b[key]) {
            return 1;
          } else if (a[key] < b[key]) {
            return -1;
          }
        } else {
          return 1;
        }
      } else if (key in b) {
        return -1;
      }
    }
    return 0;
  }
}

/**
 * Priority sort function
 * Sort object properties by keys and arrays of objects by key of the items
 * @param jsonProp
 * @param sortPriority
 * @param options
 * @returns {*}
 */
function prioritySort(jsonProp, sortPriority, options) {
  if (Array.isArray(jsonProp)) {
    return sortArrayByItemProps(jsonProp, objComparator(sortPriority))
  } else {
    return sortObjectByKeyNameList(jsonProp, propComparator(sortPriority))
  }
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
      let targetMethod = [targetSplit[0].toLowerCase()]
      const targetPath = targetSplit[1].toLowerCase();
      // Wildcard support
      if (targetMethod.includes('*')) {
        // These are the methods supported in the PathItem schema
        // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#pathItemObject
        targetMethod = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
      }
      return ((operationMethod && targetMethod.includes(operationMethod.toLowerCase())) &&
        (operationPath && matchPath(targetPath, operationPath.toLowerCase())));
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
  sortObjectByKeyNameList:sortObjectByKeyNameList,
  propComparator:propComparator,
  prioritySort:prioritySort,
  isMatchOperationItem:isMatchOperationItem,
  pathToRegExp:pathToRegExp,
  matchPath:matchPath,
};
