#!/usr/bin/env node
"use strict";

const fs = require('fs');
const traverse = require('traverse');
const {isString, isArray, isObject} = require("./util-types");
const {
    camelCase,
    capitalCase,
    capitalKebabCase,
    constantCase,
    firstCapitalCase,
    kebabCase,
    lowerCase,
    pascalCase,
    snakeCase,
    upperCase
} = require("./util-case-anything");

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

    // Return result object
    return {data: jsonObj, resultData: {}}
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
    const fixedFlags = ["x-openapi-format-filter"]
    options.unusedDepth = options.unusedDepth || 0;

    // Merge object filters
    const filterKeys = [...filterSet.methods];
    const filterArray = [...filterSet.tags];
    const filterOperations = [...filterSet.operations];
    const filterProps = [...filterSet.operationIds, ...filterSet.flags, ...fixedFlags];

    // Inverse object filters
    const inverseFilterKeys = [...filterSet.inverseMethods];
    const inverseFilterProps = [...filterSet.inverseOperationIds];
    const inverseFilterArray = [...filterSet.inverseTags];

    const stripFlags = [...filterSet.stripFlags];
    const stripUnused = [...filterSet.unusedComponents];
    const textReplace = filterSet.textReplace || [];

    // Convert flag values to flags
    const filterFlagValuesKeys = Object.keys(Object.assign({}, ...filterSet.flagValues));
    const filterFlagValues = [...filterSet.flagValues];
    const filterFlagHash = filterFlagValues.map(o => (JSON.stringify(o)));

    // Initiate components tracking
    const comps = {
        schemas: {},
        responses: {},
        parameters: {},
        examples: {},
        requestBodies: {},
        headers: {},
        meta: {total: 0}
    }

    // Prepare unused components
    let unusedComp = {
        schemas: [],
        responses: [],
        parameters: [],
        examples: [],
        requestBodies: [],
        headers: [],
        meta: {total: 0}
    }
    // Use options.unusedComp to collect unused components during multiple recursion
    if (!options.unusedComp) options.unusedComp = JSON.parse(JSON.stringify(unusedComp));

    let debugFilterStep = '' // uncomment // debugFilterStep below to see which sort part is triggered

    traverse(jsonObj).forEach(function (node) {
        // Register components presence
        if (get(this, 'parent.parent.key') && this.parent.parent.key === 'components') {
            if (get(this, 'parent.key') && this.parent.key && comps[this.parent.key]) {
                comps[this.parent.key][this.key] = {...comps[this.parent.key][this.key], present: true};
                comps.meta.total = comps.meta.total++;
            }
        }

        // Register components usage
        if (this.key === '$ref') {
            if (node.startsWith('#/components/schemas/')) {
                const compSchema = node.replace('#/components/schemas/', '');
                comps.schemas[compSchema] = {...comps.schemas[compSchema], used: true};
            }
            if (node.startsWith('#/components/responses/')) {
                const compResp = node.replace('#/components/responses/', '');
                comps.responses[compResp] = {...comps.responses[compResp], used: true};
            }
            if (node.startsWith('#/components/parameters/')) {
                const compParam = node.replace('#/components/parameters/', '');
                comps.parameters[compParam] = {...comps.parameters[compParam], used: true};
            }
            if (node.startsWith('#/components/examples/')) {
                const compExample = node.replace('#/components/examples/', '');
                comps.examples[compExample] = {...comps.examples[compExample], used: true};
            }
            if (node.startsWith('#/components/requestBodies/')) {
                const compRequestBody = node.replace('#/components/requestBodies/', '');
                comps.requestBodies[compRequestBody] = {...comps.requestBodies[compRequestBody], used: true};
            }
            if (node.startsWith('#/components/headers/')) {
                const compHeader = node.replace('#/components/headers/', '');
                comps.headers[compHeader] = {...comps.headers[compHeader], used: true};
            }
        }

        // Filter out object matching the inverse "methods"
        if (inverseFilterKeys.length > 0 && !inverseFilterKeys.includes(this.key)
            && this.parent && this.parent.parent && this.parent.parent.key === 'paths') {
            // debugFilterStep = 'Filter - inverse methods'
            // Parent has other nodes, so remove only targeted node
            this.remove();
        }

        // Filter out object matching the "methods"
        if (filterKeys.length > 0 && filterKeys.includes(this.key)) {
            // debugFilterStep = 'Filter - methods'
            // Parent has other nodes, so remove only targeted node
            this.remove();
        }

        // Array field matching
        if (Array.isArray(node)) {
            // Filter out object matching the inverse "tags"
            if (inverseFilterArray.length > 0 && this.key === 'tags' && !inverseFilterArray.some(i => node.includes(i)) && this.parent.parent !== undefined) {
                // debugFilterStep = 'Filter - inverse tags'
                // Top parent has other nodes, so remove only targeted parent node of matching element
                this.parent.delete();
            }

            // Filter out the top OpenApi.tags matching the inverse "tags"
            if (inverseFilterArray.length > 0 && this.key === 'tags' && this.parent.parent === undefined) {
                // debugFilterStep = 'Filter - inverse top tags'
                node = node.filter(value => inverseFilterArray.includes(value.name))
                this.update(node);
            }

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
                    const itmObjHash = JSON.stringify(itmObj);
                    if (filterFlagHash.some(filterFlag => filterFlag === itmObjHash)) {
                        // ========================================================================
                        // HACK to overcome the issue with removing items from an array
                        if (get(this, 'parent.parent.key') && this.parent.parent.key === 'x-tagGroups') {
                            // debugFilterStep = 'Filter -x-tagGroups - flagValues - array value'
                            const tagGroup = this.parent.node
                            tagGroup['x-openapi-format-filter'] = true
                            this.parent.update(tagGroup)
                            // ========================================================================
                        } else {
                            // debugFilterStep = 'Filter - Single field - flagValues - array value'
                            this.parent.remove();
                        }
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
                const itmObjHash = JSON.stringify(itmObj);
                if (filterFlagHash.some(filterFlagHash => filterFlagHash === itmObjHash)) {
                    // ========================================================================
                    // HACK to overcome the issue with removing items from an array
                    if (get(this, 'parent.parent.key') && this.parent.parent.key === 'x-tagGroups') {
                        // debugFilterStep = 'Filter -x-tagGroups - flagValues - single value'
                        const tagGroup = this.parent.node
                        tagGroup['x-openapi-format-filter'] = true
                        this.parent.update(tagGroup)
                        // ========================================================================
                    } else {
                        // debugFilterStep = 'Filter - Single field - flagValues - single value'
                        this.parent.remove();
                    }
                }
            }

            // Filter out fields matching the inverse Tags/operationIds
            if (inverseFilterProps.length > 0 && this.key === 'operationId' && !inverseFilterProps.includes(node)) {
                // debugFilterStep = 'Filter - Single field - Inverse Tags/operationIds'
                this.parent.remove();
            }

            // Filter out fields matching the Tags/operationIds
            if (filterProps.length > 0 && filterProps.includes(node)) {
                // debugFilterStep = 'Filter - Single field - Tags/operationIds'
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

        // Filter out operations not matching inverseFilterArray
        if (inverseFilterArray.length > 0 && this.parent && this.parent.parent && this.parent.parent.key === 'paths') {
            if ((node.tags === undefined || !inverseFilterArray.some(i => node.tags.includes(i)))) {
                this.delete();
            }
        }

        // Filter out OpenApi.tags & OpenApi.x-tagGroups matching the flags
        if ((this.key === 'tags' || this.key === 'x-tagGroups') && this.parent.key === undefined && Array.isArray(node)) {
            if (filterProps.length > 0) {
                // debugFilterStep = 'Filter - tag/x-tagGroup - flags'
                // Deep filter array of tag/x-tagGroup
                let oaTags = JSON.parse(JSON.stringify(node)); // Deep copy of the object
                const oaFilteredTags = oaTags.filter(item => !filterProps.some(i => (Object.keys(item || {}).includes(i))));
                this.update(oaFilteredTags);
            }
        }

        // Filter out markdown comments in description fields
        if (this.key === 'description' && isString(node)) {
            const lines = node.split('\n');
            if (lines.length > 1) {
                const filtered = lines.filter(line => !line.startsWith('[comment]: <>'))
                const cleanDescription = filtered.join('\n');
                this.update(cleanDescription)
                node = cleanDescription
            }
        }

        // Replace words in text with new value
        if (isString(node) && textReplace.length > 0
            && (this.key === 'description' || this.key === 'summary' || this.key === 'url')) {
            const replaceRes = valueReplace(node, textReplace);
            this.update(replaceRes);
            node = replaceRes
        }
    });

    if (stripUnused.length > 0) {
        unusedComp.schemas = Object.keys(comps.schemas || {}).filter(key => !get(comps, `schemas[${key}].used`)); //comps.schemas[key]?.used);
        options.unusedComp.schemas = [...options.unusedComp.schemas, ...unusedComp.schemas];
        unusedComp.responses = Object.keys(comps.responses || {}).filter(key => !get(comps, `responses[${key}].used`));//!comps.responses[key]?.used);
        options.unusedComp.responses = [...options.unusedComp.responses, ...unusedComp.responses];
        unusedComp.parameters = Object.keys(comps.parameters || {}).filter(key => !get(comps, `parameters[${key}].used`));//!comps.parameters[key]?.used);
        options.unusedComp.parameters = [...options.unusedComp.parameters, ...unusedComp.parameters];
        unusedComp.examples = Object.keys(comps.examples || {}).filter(key => !get(comps, `examples[${key}].used`));//!comps.examples[key]?.used);
        options.unusedComp.examples = [...options.unusedComp.examples, ...unusedComp.examples];
        unusedComp.requestBodies = Object.keys(comps.requestBodies || {}).filter(key => !get(comps, `requestBodies[${key}].used`));//!comps.requestBodies[key]?.used);
        options.unusedComp.requestBodies = [...options.unusedComp.requestBodies, ...unusedComp.requestBodies];
        unusedComp.headers = Object.keys(comps.headers || {}).filter(key => !get(comps, `headers[${key}].used`));//!comps.headers[key]?.used);
        options.unusedComp.headers = [...options.unusedComp.headers, ...unusedComp.headers];
        unusedComp.meta.total = unusedComp.schemas.length + unusedComp.responses.length + unusedComp.parameters.length + unusedComp.examples.length + unusedComp.requestBodies.length + unusedComp.headers.length
    }

    // Clean-up jsonObj
    traverse(jsonObj).forEach(function (node) {
        // Remove unused component
        if (this.path[0] === 'components' && stripUnused.length > 0) {
            if (stripUnused.includes(this.path[1]) && unusedComp[this.path[1]].includes(this.key)) {
                // debugFilterStep = 'Filter - Remove unused components'
                this.delete();
            }
        }

        // Filter out OpenApi.tags & OpenApi.x-tagGroups matching the fixedFlags
        if ((this.key === 'tags' || this.key === 'x-tagGroups') && this.parent.key === undefined && Array.isArray(node)) {
            if (fixedFlags.length > 0) {
                // debugFilterStep = 'Filter - tag/x-tagGroup - fixed flags'
                // Deep filter array of tag/x-tagGroup
                let oaTags = JSON.parse(JSON.stringify(node)); // Deep copy of the object
                const oaFilteredTags = oaTags
                    .filter(item => !fixedFlags.some(i => (Object.keys(item || {}).includes(i))))
                    .filter(e => e);
                this.update(oaFilteredTags);
            }
        }

        // Remove empty objects
        if (node && Object.keys(node).length === 0 && node.constructor === Object && this.parent.key !== 'security') {
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

    // Recurse to strip any remaining unusedComp, to a maximum depth of 10
    if (stripUnused.length > 0 && unusedComp.meta.total > 0 && options.unusedDepth <= 10) {
        options.unusedDepth++;
        const resultObj = openapiFilter(jsonObj, options);
        jsonObj = resultObj.data;
        unusedComp = JSON.parse(JSON.stringify(options.unusedComp));
    }

    // Return result object
    return {data: jsonObj, resultData: {unusedComp: unusedComp}}
}

/**
 * OpenAPI Change Case function
 * Traverse through all keys and based on the key name, change the case the props according to the casing configuration.
 * @param {object} oaObj OpenApi document
 * @param {object} options OpenApi-format casing options
 * @returns {object} Change casing OpenApi document
 */
function openapiChangeCase(oaObj, options) {
    let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object
    let defaultCasing = {}; // JSON.parse(fs.readFileSync(__dirname + "/defaultFilter.json", 'utf8'))
    let casingSet = Object.assign({}, defaultCasing, options.casingSet);

    let debugCasingStep = '' // uncomment // debugFilterStep below to see which sort part is triggered

    // Initiate components tracking
    const comps = {
        parameters: {},
    }

    // Recursive traverse through OpenAPI document to update components
    traverse(jsonObj).forEach(function (node) {
        // Focus only on the components
        if (this.path[0] === 'components') {
            // Change components/schemas - names
            if (this.path[1] === 'schemas' && this.path.length === 2 && casingSet.componentsSchemas) {
                // debugCasingStep = 'Casing - components/schemas - names
                this.update(changeObjKeysCase(node, casingSet.componentsSchemas));
            }
            // Change components/examples - names
            if (this.path[1] === 'examples' && this.path.length === 2 && casingSet.componentsExamples) {
                // debugCasingStep = 'Casing - components/examples - names
                this.update(changeObjKeysCase(node, casingSet.componentsExamples));
            }
            // Change components/headers - names
            if (this.path[1] === 'headers' && this.path.length === 2 && casingSet.componentsHeaders) {
                // debugCasingStep = 'Casing - components/headers - names
                this.update(changeObjKeysCase(node, casingSet.componentsHeaders));
            }
            // Change components/parameters - in:query/in:headers/in:path - key
            if (this.path[1] === 'parameters' && this.path.length === 2 && casingSet.componentsParametersHeader) {
                const orgObj = JSON.parse(JSON.stringify(node));
                let replacedItems = Object.keys(orgObj).map((key) => {
                    if (orgObj[key].in && orgObj[key].in === 'query' && casingSet.componentsParametersQuery) {
                        debugCasingStep = 'Casing - components/parameters - in:query - key'
                        const newKey = changeCase(key, casingSet.componentsParametersQuery);
                        comps.parameters[key] = newKey
                        return {[newKey]: orgObj[key]};
                    }
                    if (orgObj[key].in && orgObj[key].in === 'path' && casingSet.componentsParametersPath) {
                        debugCasingStep = 'Casing - components/parameters - in:path - key'
                        const newKey = changeCase(key, casingSet.componentsParametersPath);
                        comps.parameters[key] = newKey
                        return {[newKey]: orgObj[key]};
                    }
                    if (orgObj[key].in && orgObj[key].in === 'header' && casingSet.componentsParametersHeader) {
                        debugCasingStep = 'Casing - components/parameters - in:header - key'
                        const newKey = changeCase(key, casingSet.componentsParametersHeader);
                        comps.parameters[key] = newKey
                        return {[newKey]: orgObj[key]};
                    }
                });
                this.update( Object.assign({}, ...replacedItems));
            }
            // Change components/parameters - query/header name
            if (this.path[1] === 'parameters' && this.path.length === 3) {
                if (node.in && node.in === 'query' && node.name && casingSet.parametersQuery) {
                    debugCasingStep = 'Casing - path > parameters/query - name'
                    node.name = changeCase(node.name, casingSet.parametersQuery);
                    this.update(node);
                }
                if (node.in && node.in === 'header' && node.name && casingSet.parametersHeader) {
                    debugCasingStep = 'Casing - path > parameters/headers - name'
                    node.name = changeCase(node.name, casingSet.parametersHeader);
                    this.update(node);
                }
                if (node.in && node.in === 'path' && node.name && casingSet.parametersPath) {
                    debugCasingStep = 'Casing - path > parameters/path - name'
                    node.name = changeCase(node.name, casingSet.parametersPath);
                    this.update(node);
                }
            }
            // Change components/responses - names
            if (this.path[1] === 'responses' && this.path.length === 2 && casingSet.componentsResponses) {
                // debugCasingStep = 'Casing - components/responses - names
                this.update(changeObjKeysCase(node, casingSet.componentsResponses));
            }
            // Change components/requestBodies - names
            if (this.path[1] === 'requestBodies' && this.path.length === 2 && casingSet.componentsRequestBodies) {
                // debugCasingStep = 'Casing - components/requestBodies - names
                this.update(changeObjKeysCase(node, casingSet.componentsRequestBodies));
            }
            // Change components/securitySchemes - names
            if (this.path[1] === 'securitySchemes' && this.path.length === 2 && casingSet.componentsSecuritySchemes) {
                // debugCasingStep = 'Casing - components/securitySchemes - names
                this.update(changeObjKeysCase(node, casingSet.componentsSecuritySchemes));
            }
        }
    });

    // Recursive traverse through OpenAPI document to non-components
    traverse(jsonObj).forEach(function (node) {
        // Change components $ref names
        if (this.key === '$ref') {
            if (node.startsWith('#/components/schemas/') && casingSet.componentsSchemas) {
                const compName = node.replace('#/components/schemas/', '');
                this.update(`#/components/schemas/${changeCase(compName, casingSet.componentsSchemas)}`);
            }
            if (node.startsWith('#/components/examples/') && casingSet.componentsExamples) {
                const compName = node.replace('#/components/examples/', '');
                this.update(`#/components/examples/${changeCase(compName, casingSet.componentsExamples)}`);
            }
            if (node.startsWith('#/components/responses/') && casingSet.componentsResponses) {
                const compName = node.replace('#/components/responses/', '');
                this.update(`#/components/responses/${changeCase(compName, casingSet.componentsResponses)}`);
            }
            if (node.startsWith('#/components/parameters/')) {
                const compName = node.replace('#/components/parameters/', '');
                if (comps.parameters[compName]) {
                    this.update(`#/components/parameters/${comps.parameters[compName]}`);
                }
            }
            if (node.startsWith('#/components/headers/') && casingSet.componentsHeaders) {
                const compName = node.replace('#/components/headers/', '');
                this.update(`#/components/headers/${changeCase(compName, casingSet.componentsHeaders)}`);
            }
            if (node.startsWith('#/components/requestBodies/') && casingSet.componentsRequestBodies) {
                const compName = node.replace('#/components/requestBodies/', '');
                this.update(`#/components/requestBodies/${changeCase(compName, casingSet.componentsRequestBodies)}`);
            }
            if (node.startsWith('#/components/securitySchemes/') && casingSet.componentsSecuritySchemes) {
                const compName = node.replace('#/components/securitySchemes/', '');
                this.update(`#/components/securitySchemes/${changeCase(compName, casingSet.componentsSecuritySchemes)}`);
            }
        }

        // Change operationId
        if (this.key === 'operationId' && casingSet.operationId) {
            // debugCasingStep = 'Casing - Single field - OperationId'
            this.update(changeCase(node, casingSet.operationId));
        }
        // Change summary
        if (this.key === 'summary' && casingSet.summary) {
            // debugCasingStep = 'Casing - Single field - summary'
            this.update(changeCase(node, casingSet.summary));
        }
        // Change description
        if (this.key === 'description' && casingSet.description) {
            // debugCasingStep = 'Casing - Single field - description'
            this.update(changeCase(node, casingSet.description));
        }
        // Change paths > examples - name
        if (this.path[0] === 'paths' && this.key === 'examples' && casingSet.componentsExamples) {
            // debugCasingStep = 'Casing - Single field - examples name'
            this.update(changeObjKeysCase(node, casingSet.componentsExamples));
        }
        // Change components/schema - properties
        if (this.path[1] === 'schemas' && this.key === 'properties' && casingSet.properties
            && (this.parent && this.parent.key !== 'properties' && this.parent.key !== 'value')
        ) {
            // debugCasingStep = 'Casing - components/schema - properties name'
            this.update(changeObjKeysCase(node, casingSet.properties));
        }
        // Change paths > schema - properties
        if (this.path[0] === 'paths' && this.key === 'properties' && casingSet.properties
            && (this.parent && this.parent.key !== 'properties' && this.parent.key !== 'value')
        ) {
            // debugCasingStep = 'Casing - paths>schema - properties name'
            this.update(changeObjKeysCase(node, casingSet.properties));
        }
        // Change security - keys
        if (this.path[0] === 'paths' && this.key === 'security' && isArray(node) && casingSet.componentsSecuritySchemes) {
            // debugCasingStep = 'Casing - path > - security'
            this.update(changeArrayObjKeysCase(node, casingSet.componentsSecuritySchemes))
        }
        // Change parameters - name
        if (this.path[0] === 'paths' && this.key === 'parameters'
            && (casingSet.parametersQuery || casingSet.parametersHeader || casingSet.parametersPath)) {
            // debugCasingStep = 'Casing - components > parameters - name'

            // Loop over parameters array
            let params = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
            for (let i = 0; i < params.length; i++) {
                if (params[i].in && params[i].in === 'query' && params[i].name && casingSet.parametersQuery) {
                    // debugCasingStep = 'Casing - path > parameters/query- name'
                    params[i].name = changeCase(params[i].name, casingSet.parametersQuery)
                }
                if (params[i].in && params[i].in === 'header' && params[i].name && casingSet.parametersHeader) {
                    // debugCasingStep = 'Casing - path > parameters/headers - name'
                    params[i].name = changeCase(params[i].name, casingSet.parametersHeader)
                }
                if (params[i].in && params[i].in === 'path' && params[i].name && casingSet.parametersPath) {
                    // debugCasingStep = 'Casing - path > parameters/path - name'
                    params[i].name = changeCase(params[i].name, casingSet.parametersPath)
                }
            }
            this.update(params);
        }

    });


    // Return result object
    return {data: jsonObj, resultData: {}}
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

    // Return result object
    return {data: jsonObj, resultData: {}}
}

/**
 * Value replacement function
 * @param {string} valueAsString
 * @param {array} replacements
 * @returns {*}
 */
function valueReplace(valueAsString, replacements) {
    if (!isString(valueAsString)) return valueAsString
    if (!isArray(replacements)) return valueAsString

    replacements.map(({searchFor, replaceWith}) => {
        const pattern = searchFor.replace(/"/g, '\\\\"')
        const replacement = replaceWith.replace(/"/g, '\\"')
        valueAsString = valueAsString.replace(new RegExp(escapeRegExp(pattern), 'g'), replacement);
        return valueAsString
    })

    return valueAsString
}

/**
 * Change Object keys case function
 * @param {object} obj
 * @param {string} caseType
 * @returns {*}
 */
function changeObjKeysCase(obj, caseType) {
    if (!isObject(obj)) return obj

    const orgObj = JSON.parse(JSON.stringify(obj)); // Deep copy of the object
    let replacedItems = Object.keys(orgObj).map((key) => {
        const newKey = changeCase(key, caseType);
        return {[newKey]: orgObj[key]};
    });
    return Object.assign({}, ...replacedItems)
}

/**
 * Change object keys case in array  function
 * @param {object} node
 * @param {string} caseType
 * @returns {*}
 */
function changeArrayObjKeysCase(node, caseType) {
    if (!isArray(node)) return node

    const casedNode = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
    for (let i = 0; i < casedNode.length; i++) {
        casedNode[i] = changeObjKeysCase(casedNode[i], caseType)
    }
    return casedNode
}

/**
 * Change case function
 * @param {string} valueAsString
 * @param {string} caseType
 * @returns {string}
 */
function changeCase(valueAsString, caseType) {
    const caseTypes = ['camelCase', 'PascalCase', 'kebab-case', 'snake_case', 'CONSTANT_CASE', 'capitalCase', 'lowerCase', 'UPPERCASE']
    if (!isString(valueAsString) || valueAsString === "") return valueAsString
    // if (!caseTypes.includes(caseType)) return valueAsString
    const normCaseType = caseType.toLowerCase().replace('-', '').replace('_', '')

    switch (normCaseType) {
        case "camelcase":
            return camelCase(valueAsString)
        case "pascalcase":
            return pascalCase(valueAsString)
        case "kebabcase":
        case "kebapcase":
            return kebabCase(valueAsString)
        case "capitalkebabcase":
            return capitalKebabCase(valueAsString)
        case "snakecase":
            return snakeCase(valueAsString)
        case "constantcase":
            return constantCase(valueAsString)
        case "capitalcase":
            return capitalCase(valueAsString)
        case "firstcapitalcase":
            return firstCapitalCase(valueAsString)
        case "lowercase":
            return lowerCase(valueAsString)
        case "uppercase":
            return upperCase(valueAsString)
        default:
            return valueAsString
    }
}

/**
 * Function fo escaping input to be treated as a literal string within a regular expression
 * @param string
 * @returns {*}
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Alternative optional chaining function, to provide support for NodeJS 12
 * TODO replace this with native ?. optional chaining once NodeJS12 is deprecated.
 * @param obj object
 * @param path path to access the properties
 * @param defaultValue
 * @returns {T}
 */
function get(obj, path, defaultValue = undefined) {
    const travel = regexp => String.prototype.split.call(path, regexp)
        .filter(Boolean).reduce((res, key) => res !== null && res !== undefined ? res[key] : res, obj);

    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
}

module.exports = {
    openapiFilter: openapiFilter,
    openapiSort: openapiSort,
    openapiChangeCase: openapiChangeCase,
    openapiRename: openapiRename
};
