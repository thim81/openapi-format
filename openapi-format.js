#!/usr/bin/env node
"use strict";

const fs = require('fs');
const traverse = require('traverse');

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
    // }, Object.create(null));
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
    }
}

/**
 * Priority sort function
 * @param jsonProp
 * @param sortPriority
 * @param options
 * @returns {*}
 */
function prioritySort(jsonProp, sortPriority, options) {
    return sortObjectByKeyNameList(jsonProp, propComparator(sortPriority))
}

/**
 * A check if the OpenApi operation item matches a target definition .
 * @param {object} operationPath the OpenApi path item to match
 * @param {object} operationMethod the OpenApi metho item to match
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

/**
 * OpenAPI sort function
 * Traverse through all keys and based on the key name, sort the props according the preferred order.
 * @param {object} oaObj OpenApi document
 * @param {object} options OpenApi-format sort options
 * @returns {object} Sorted OpenApi document
 */
function openapiSort(oaObj, options) {
    // Skip sorting, when the option "no-sort" is set
    if (options.sort === false) {
        return oaObj;
    }

    let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object
    let sortSet = options.sortSet || JSON.parse(fs.readFileSync(__dirname + "/defaultSort.json", 'utf8'));
    let sortComponentsSet = options.sortComponentsSet || JSON.parse(fs.readFileSync(__dirname + "/defaultSortComponents.json", 'utf8'));
    let debugStep = '' // uncomment // debugStep below to see which sort part is triggered

    // Recursive traverse through OpenAPI document
    traverse(jsonObj).forEach(function (node) {
        // if (obj.hasOwnProperty(this.key) && obj[this.key] && typeof obj[this.key] === 'object') {
        if (typeof node === 'object') {

            // Components sorting by alphabet
            if (this.parent && this.parent.key && this.parent.key && this.parent.key === 'components'
                && sortComponentsSet.length > 0 && sortComponentsSet.includes(this.key)
            ) {
                // debugStep = 'Component sorting by alphabet'
                node = prioritySort(node, []);
            }

            // Generic sorting
            if (sortSet.hasOwnProperty(this.key) && Array.isArray(sortSet[this.key])) {

                if (Array.isArray(node)) {
                    // debugStep = 'Generic sorting - array'
                    // Deep sort array of properties
                    let sortedObj = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
                    for (let i = 0; i < sortedObj.length; i++) {
                        sortedObj[i] = prioritySort(sortedObj[i], sortSet[this.key]);
                    }
                    this.update(sortedObj);

                } else if ((this.key === 'responses' || this.key === 'schemas' || this.key === 'properties')
                    && (this.parent && this.parent.key !== 'properties' && this.parent.key !== 'value')
                ) {
                    // debugStep = 'Generic sorting - responses/schemas/properties'
                    // Deep sort list of properties
                    let sortedObj = JSON.parse(JSON.stringify(node)); // Deep copy of the object
                    for (let keyRes in sortedObj) {
                        sortedObj[keyRes] = prioritySort(sortedObj[keyRes], sortSet[this.key]);
                    }
                    this.update(sortedObj);
                } else {
                    if (this.path[0] === 'components' && this.path[1] === 'examples' && this.path[3] === 'value') {
                        // debugStep = 'Generic sorting - skip nested components>examples'
                        // Skip nested components>examples values
                    } else {
                        // debugStep = 'Generic sorting - properties'
                        // Sort list of properties
                        this.update(prioritySort(node, sortSet[this.key]));
                    }

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

/**
 * OpenAPI filter function
 * Traverse through all keys and based on the key name, filter the props according to the filter configuration.
 * @param {object} oaObj OpenApi document
 * @param {object} options OpenApi-format filter options
 * @returns {object} Filtered OpenApi document
 */
function openapiFilter(oaObj, options) {
    let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object
    let defaultFilter = JSON.parse(fs.readFileSync(__dirname + "/defaultFilter.json", 'utf8'))
    let filterSet = Object.assign({}, defaultFilter, options.filterSet);
    const httpVerbs = ["get", "post", "put", "patch", "delete"];

    // Merge object filters
    const filterKeys = [...filterSet.methods];
    const filterArray = [...filterSet.tags];
    const filterOperations = [...filterSet.operations];
    const filterProps = [...filterSet.operationIds, ...filterSet.flags];
    const stripFlags = [...filterSet.stripFlags];
    const stripUnused = [...filterSet.unusedComponents];

    // Convert flag values to flags
    const filterFlagValuesKeys = Object.keys(Object.assign({}, ...filterSet.flagValues));
    const filterFlagValues = [...filterSet.flagValues];

    // Initiate components tracking
    const compSchemas = {}
    const compResponses = {}
    const compParams = {}
    const compExamples = {}
    const compRequestBodies = {}
    const compHeaders = {}

    let debugFilterStep = '' // uncomment // debugFilterStep below to see which sort part is triggered

    traverse(jsonObj).forEach(function (node) {
        // Register components
        if (this?.parent?.parent?.key === 'components') {
            if (this?.parent?.key === 'schemas') {
                compSchemas[this.key] = {...compSchemas[this.key], present: true};
            }
            if (this?.parent?.key === 'responses') {
                compResponses[this.key] = {...compResponses[this.key], present: true};
            }
            if (this?.parent?.key === 'parameters') {
                compParams[this.key] = {...compParams[this.key], present: true};
            }
            if (this?.parent?.key === 'examples') {
                compExamples[this.key] = {...compExamples[this.key], present: true};
            }
            if (this?.parent?.key === 'requestBodies') {
                compRequestBodies[this.key] = {...compRequestBodies[this.key], present: true};
            }
            if (this?.parent?.key === 'headers') {
                compHeaders[this.key] = {...compHeaders[this.key], present: true};
            }
        }

        // Register component/schemas usage
        if (this?.key === '$ref') {
            if (node.startsWith('#/components/schemas/')) {
                const compSchema = node.replace('#/components/schemas/', '');
                compSchemas[compSchema] = {...compSchemas[compSchema], used: true};
            }
            if (node.startsWith('#/components/responses/')) {
                const compResp = node.replace('#/components/responses/', '');
                compResponses[compResp] = {...compResponses[compResp], used: true};
            }
            if (node.startsWith('#/components/parameters/')) {
                const compParam = node.replace('#/components/parameters/', '');
                compParams[compParam] = {...compParams[compParam], used: true};
            }
            if (node.startsWith('#/components/examples/')) {
                const compExample = node.replace('#/components/examples/', '');
                compExamples[compExample] = {...compExamples[compExample], used: true};
            }
            if (node.startsWith('#/components/requestBodies/')) {
                const compRequestBody = node.replace('#/components/requestBodies/', '');
                compRequestBodies[compRequestBody] = {...compRequestBodies[compRequestBody], used: true};
            }
            if (node.startsWith('#/components/headers/')) {
                const compHeader = node.replace('#/components/headers/', '');
                compHeaders[compHeader] = {...compHeaders[compHeader], used: true};
            }
        }

        // Filter out object matching the "methods"
        if (filterKeys.length > 0 && filterKeys.includes(this.key)) {
            // debugFilterStep = 'Filter - methods'
            // Parent has other nodes, so remove only targeted node
            this.remove();
        }

        // Array field matching
        if (Array.isArray(node)) {
            // Filter out object matching the "tags"
            if (filterArray.length > 0 && this.key === 'tags' && filterArray.some(i => node.includes(i))) {
                // debugFilterStep = 'Filter - tags'
                // Top parent has other nodes, so remove only targeted parent node of matching element
                this.parent.delete();
            }

            // Filter out the top OpenApi.tags matching the "tags"
            if (filterArray.length > 0 && this.key === 'tags' && this.parent.parent === undefined) {
                // debugFilterStep = 'Filter - top tags'
                node = node.filter(value => !filterArray.includes(value.name))
                this.update(node);
            }

            // Filter out fields matching the flagValues
            if (filterFlagValuesKeys.length > 0 && filterFlagValuesKeys.includes(this.key)) {
                for (let i = 0; i < node.length; i++) {
                    const itmObj = {[this.key]: node[i]};
                    if (filterFlagValues.some(item => JSON.stringify(item) === JSON.stringify(itmObj))) {
                        // debugFilterStep = 'Filter - Single field - flagValues - array value'
                        // Top parent has other nodes, so remove only targeted parent node of matching element
                        this.parent.remove();
                    }
                }
            }
        }

        // Single field matching
        if (typeof node !== 'object' && !Array.isArray(node)) {
            // Filter out fields matching the flags
            if (filterProps.length > 0 && filterProps.includes(this.key)) {
                // debugFilterStep = 'Filter - Single field - flags'
                // Top parent has other nodes, so remove only targeted parent node of matching element
                this.parent.remove();
            }

            // Filter out fields matching the flagValues
            if (filterFlagValuesKeys.length > 0 && filterFlagValuesKeys.includes(this.key)) {
                const itmObj = {[this.key]: node};
                if (filterFlagValues.some(item => JSON.stringify(item) === JSON.stringify(itmObj))) {
                    // debugFilterStep = 'Filter - Single field - flagValues - single value'
                    // Top parent has other nodes, so remove only targeted parent node of matching element
                    this.parent.remove();
                }
            }

            // Filter out fields matching the Tags/operationIds
            if (filterProps.length > 0 && filterProps.includes(node)) {
                // debugFilterStep = 'Filter - Single field - Tags/operationIds'
                // Top parent has other nodes, so remove only targeted parent node of matching element
                this.parent.remove();
            }
        }

        // Filter out fields matching the operations
        if (filterOperations.length > 0 && this.parent && this.parent.parent && this.parent.parent.key === 'paths') {
            // debugFilterStep = 'Filter - fields - operations'
            for (let i = 0; i < filterOperations.length; i++) {
                if (isMatchOperationItem(this.parent.key, this.key, filterOperations[i])) {
                    this.delete();
                }
            }
        }

        // Filter out OpenApi.tags & OpenApi.x-tagGroups matching the flags
        if ((this?.key === 'tags' || this?.key === 'x-tagGroups') && this?.parent.key === undefined && Array.isArray(node)) {
            if (filterProps.length > 0) {
                // debugFilterStep = 'Filter - tag/x-tagGroup - flags'
                // Deep filter array of tag/x-tagGroup
                let oaTags = JSON.parse(JSON.stringify(node)); // Deep copy of the object
                const oaFilteredTags = oaTags.filter(item => !filterProps.some(i => (Object.keys(item).includes(i))));
                this.update(oaFilteredTags);
            }
        }
    });

    // Prepare unused components
    let unusedSchemas = []
    let unusedResponses = []
    let unusedParams = []
    let unusedExamples = []
    let unusedRequestBodies = []
    let unusedHeaders = []
    if (stripUnused.length > 0) {
        unusedSchemas = Object.keys(compSchemas).filter(key => !compSchemas[key]?.used);
        unusedResponses = Object.keys(compResponses).filter(key => !compResponses[key]?.used);
        unusedParams = Object.keys(compParams).filter(key => !compParams[key]?.used);
        unusedExamples = Object.keys(compExamples).filter(key => !compExamples[key]?.used);
        unusedRequestBodies = Object.keys(compRequestBodies).filter(key => !compRequestBodies[key]?.used);
        unusedHeaders = Object.keys(compHeaders).filter(key => !compHeaders[key]?.used);
    }

    // if (options.verbose >= 1 || options.verbose === true) {
    //     if (unusedSchemas.length > 0) console.log('- Removed unused components/schemas:\n', unusedSchemas.join(', '))
    //     if (unusedResponses.length > 0) console.log('- Removed unused components/responses:\n', unusedResponses.join(', '))
    //     if (unusedParams.length > 0) console.log('- Removed unused components/parameters:\n', unusedParams.join(', '))
    //     if (unusedExamples.length > 0) console.log('- Removed unused components/examples:\n', unusedExamples.join(', '))
    //     if (unusedRequestBodies.length > 0) console.log('- Removed unused components/requestBodies:\n', unusedRequestBodies.join(', '))
    //     if (unusedHeaders.length > 0) console.log('- Removed unused components/headers:\n', unusedHeaders.join(', '))
    // }

    // Clean-up jsonObj
    traverse(jsonObj).forEach(function (node) {
        // Remove unused component/schemas
        if (this.path[0] === 'components' && stripUnused.length > 0) {
            if (this.path[1] === 'schemas' && stripUnused.includes('schemas') && unusedSchemas.includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused component/schemas'
                this.delete();
            }
            if (this.path[1] === 'responses' && stripUnused.includes('responses') && unusedResponses.includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused component/responses'
                this.delete();
            }
            if (this.path[1] === 'parameters' && stripUnused.includes('parameters') && unusedParams.includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused component/parameters'
                this.delete();
            }
            if (this.path[1] === 'examples' && stripUnused.includes('examples') && unusedExamples.includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused component/examples'
                this.delete();
            }
            if (this.path[1] === 'requestBodies' && stripUnused.includes('requestBodies') && unusedRequestBodies.includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused component/requestBodies'
                this.delete();
            }
            if (this.path[1] === 'headers' && stripUnused.includes('headers') && unusedHeaders.includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused component/headers'
                this.delete();
            }
        }

        // Remove empty objects
        if (node && Object.keys(node).length === 0 && node.constructor === Object) {
            // debugFilterStep = 'Filter - Remove empty objects'
            this.delete();
        }
        // Remove path items without operations
        if (this.parent && this.parent.key === 'paths' && !httpVerbs.some(i => this.keys.includes(i))) {
            // debugFilterStep = 'Filter - Remove empty paths'
            this.delete();
        }
        // Strip flags
        if (stripFlags.length > 0 && stripFlags.includes(this.key)) {
            // debugFilterStep = 'Filter - Strip flags'
            this.delete();
        }
    });

    return jsonObj;
}

/**
 * OpenAPI rename function
 * Change the title of the OpenAPI document with a provided value.
 * @param {object} oaObj OpenApi document
 * @param {object} options OpenApi-format filter options
 * @returns {object} Renamed OpenApi document
 */
function openapiRename(oaObj, options) {
    let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object

    // OpenAPI 3
    if (jsonObj.info && jsonObj.info.title && options.rename && options.rename !== "") {
        jsonObj.info.title = options.rename
    }

    return jsonObj;
}

module.exports = {
    openapiFilter: openapiFilter,
    openapiSort: openapiSort,
    openapiRename: openapiRename
};
