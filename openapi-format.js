#!/usr/bin/env node
"use strict";

// Sort Object by Key or list of names
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
    // }, Object.create(null));
}

// Compare function - Sort with Priority logic, keep order for non-priority items
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
    }
}

// Priority sort function
function prioritySort(jsonProp, sortPriority, options) {
    return sortObjectByKeyNameList(jsonProp, propComparator(sortPriority))
}

// OpenAPI sort function
// Traverse through all keys and based on the key name, sort the props accoring the
function openapiSort(rawObj, options) {
    let jsonObj = JSON.parse(JSON.stringify(rawObj)); // Deep copy of the schema object
    let sortPrio = options.sortPrio || require('defaultSort.json');

    const traverse = (obj) => {
        for (let k in obj) {
            if (obj.hasOwnProperty(k) && obj[k] && typeof obj[k] === 'object') {
                // console.log('key', k)
                // console.log('obj', obj)

                // Generic sorting
                if (sortPrio.hasOwnProperty(k) && Array.isArray(sortPrio[k])) {

                    if (Array.isArray(obj[k])) {
                        for (let i = 0; i < obj[k].length; i++) {
                            obj[k][i] = prioritySort(obj[k][i], sortPrio[k]);
                        }
                    } else if (k === 'responses' || k === 'schemas' || k === 'properties') {
                        for (let keyRes in obj[k]) {
                            obj[k][keyRes] = prioritySort(obj[k][keyRes], sortPrio[k])
                        }
                    } else {
                        obj[k] = prioritySort(obj[k], sortPrio[k]);
                    }
                }

                // Go a level deeper
                traverse(obj[k])
            } else {
                // not an object
                // console.log('key ELSE', k)
                // console.log('obj ELSE', obj)
            }
        }
    }

    // Process root level
    if (jsonObj.openapi) {
        jsonObj = prioritySort(jsonObj, sortPrio['root'])
    }

    // Process sub levels
    traverse(jsonObj);

    return jsonObj;
}

module.exports = {
    openapiSort: openapiSort
};
