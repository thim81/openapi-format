#!/usr/bin/env node
"use strict";

const fs = require('fs');
const traverse = require('traverse');

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
    // Skip sorting, when the option "no-sort" is set
    if (options.sort === false) {
        return rawObj;
    }

    let jsonObj = JSON.parse(JSON.stringify(rawObj)); // Deep copy of the schema object
    let sortSet = options.sortSet || JSON.parse(fs.readFileSync("defaultSort.json", 'utf8'));

    // Recursive traverse through OpenAPI document
    traverse(jsonObj).forEach(function (node) {
        // if (obj.hasOwnProperty(this.key) && obj[this.key] && typeof obj[this.key] === 'object') {
        if (typeof node === 'object') {
            // Generic sorting
            if (sortSet.hasOwnProperty(this.key) && Array.isArray(sortSet[this.key])) {

                if (Array.isArray(node)) {
                    // Deep sort array of properties
                    let sortedObj = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
                    for (let i = 0; i < sortedObj.length; i++) {
                        sortedObj[i] = prioritySort(sortedObj[i], sortSet[this.key]);
                    }
                    this.update(sortedObj);

                } else if (this.key === 'responses' || this.key === 'schemas' || this.key === 'properties') {
                    // Deep sort list of properties
                    let sortedObj = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
                    for (let keyRes in sortedObj) {
                        sortedObj[keyRes] = prioritySort(sortedObj[keyRes], sortSet[this.key]);
                    }
                    this.update(sortedObj);
                } else {
                    // Sort list of properties
                    this.update(prioritySort(node, sortSet[this.key]));
                }
            }
        }
    });

    // Process root level
    if (jsonObj.openapi) {
        jsonObj = prioritySort(jsonObj, sortSet['root'])
    }
    return jsonObj;
}

// OpenAPI sort function
// Traverse through all keys and based on the key name, sort the props accoring the
function openapiFilter(rawObj, options) {
    let jsonObj = JSON.parse(JSON.stringify(rawObj)); // Deep copy of the schema object
    let defaultFilter = JSON.parse(fs.readFileSync("defaultFilter.json", 'utf8'))
    let filterSet = Object.assign({}, defaultFilter, options.filterSet);

    // Merge object filters
    const filterKeys = [...filterSet.methods];
    const filterArray = [...filterSet.tags];
    const filterProps = [...filterSet.operationIds, ...filterSet.flags];

    // console.log('openapiFilter filterSet', filterSet)
    // console.log('openapiFilter filterKeys', filterKeys)
    // console.log('openapiFilter filterKeys', filterArray)
    // console.log('openapiFilter filterProps', filterProps)

    traverse(jsonObj).forEach(function (node) {

        // Filter out object matching the "methods"
        if (filterKeys.length > 0 && filterKeys.includes(this.key)) {
            // console.log('filterKeys-key', this.key)
            // console.log('filterKeys-node', node)

            // console.log('parent', this.parent)
            // console.log('parent.key', this.parent.key)
            // console.log('parent.keys', this.parent.keys)
            // console.log('parent.path', this.parent.path)

            // if (this.parent.keys.length > 1) {
                // Parent has other nodes, so remove only targeted node
                this.remove();
            // } else {
                // Parent has no nodes after remove, so lets remove parent
                // this.parent.remove()
            // }
        }

        // Array field matching
        if (Array.isArray(node)) {
            // console.log('array-key', this.key)
            // console.log('array-node', node)
            // Filter out object matching the "tags"
            // if (filterArray.length > 0 && filterArray.includes(this.key) && filterArray.some(i => node.includes(i))) {
            if (filterArray.length > 0 && this.key === 'tags' && filterArray.some(i => node.includes(i))) {
                // console.log('array-key', this.key)
                // console.log('array-node', node)
                // console.log('parent', this.parent)
                // console.log('parent.key', this.parent.key)
                // console.log('parent.keys', this.parent.keys)
                // console.log('parent.parent.key', this.parent.parent.key)
                // console.log('parent.parent.keys', this.parent.parent.keys)
                // console.log('parent.parent.parent.keys', this.parent.parent.parent.keys)
                // console.log('parent.path', this.parent.path)

                // if (this.parent && this.parent.parent && this.parent.parent.keys && this.parent.parent.keys.length === 1) {
                    // Top Parent has no nodes after remove, so lets remove top parent of matching element
                    // this.parent.parent.delete()
                // } else {
                    // Top parent has other nodes, so remove only targeted parent node of matching element
                    this.parent.delete();
                // }
            }
        }


        // Single field matching
        if (typeof node !== 'object' && !Array.isArray(node)) {
            // Filter out fields matching the flags
            if (filterProps.length > 0 && filterProps.includes(this.key)) {
                // console.log('filterProps-key-key', this.key)
                // console.log('filterProps-key-node', node)
                // console.log('parent', this.parent)
                // console.log('parent.key', this.parent.key)
                // console.log('parent.keys', this.parent.keys.length)
                // console.log('parent.parent.keys', this.parent.parent.keys.length)
                // console.log('parent.path', this.parent.path)

                // if (this.parent && this.parent.parent && this.parent.parent.keys && this.parent.parent.keys.length === 1) {
                    // Top Parent has no nodes after remove, so lets remove top parent of matching element
                    // this.parent.parent.remove()
                // } else {
                    // Top parent has other nodes, so remove only targeted parent node of matching element
                    this.parent.remove();
                // }
            }

            // Filter out fields matching the flagValues/Tags/operationIds
            if (filterProps.length > 0 && filterProps.includes(node)) {
                // console.log('filterProps-node-key', this.key)
                // console.log('filterProps-node-node', node)
                // console.log('parent', this.parent)
                // console.log('parent.key', this.parent.key)
                // console.log('parent.keys', this.parent.keys.length)
                // console.log('parent.parent.keys', this.parent.parent.keys.length)
                // console.log('parent.path', this.parent.path)

                // if (this.parent && this.parent.parent && this.parent.parent.keys && this.parent.parent.keys.length === 1) {
                    // Top Parent has no nodes after remove, so lets remove top parent of matching element
                    // this.parent.parent.remove()
                // } else {
                    // Top parent has other nodes, so remove only targeted parent node of matching element
                    this.parent.remove();
                // }
            }

        }

    });

    // Clean-up empty objects
    traverse(jsonObj).forEach(function (node) {
        if(Object.keys(node).length === 0 && node.constructor === Object) {
            this.delete();
        }
    });

    return jsonObj;
}

module.exports = {
    openapiFilter: openapiFilter,
    openapiSort: openapiSort
};
