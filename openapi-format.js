#!/usr/bin/env node
"use strict";

const fs = require('fs');
const traverse = require('traverse');
const {isString, isArray, isObject} = require("./util-types");
const {
  prioritySort,
  isMatchOperationItem,
} = require("./util-sort");
const {
  changeComponentParametersCasingEnabled,
  changeParametersCasingEnabled,
  changeCase,
  changeArrayObjKeysCase,
  changeObjKeysCase
} = require("./util-casing");
const {
  valueReplace,
  get,
  isUsedComp
} = require("./util-filter");
const {
  convertNullable,
  convertExample,
  convertImageBase64,
  convertMultiPartBinary, convertConst, convertExclusiveMinimum, convertExclusiveMaximum, setInObject
} = require("./util-convert");

/**
 * OpenAPI sort function
 * Traverse through all keys and based on the key name, sort the props according the preferred order.
 * @param {object} oaObj OpenAPI document
 * @param {object} options OpenAPI-format sort options
 * @returns {object} Sorted OpenAPI document
 */
async function openapiSort(oaObj, options) {
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

    if (typeof node === 'object') {

      // Components sorting by alphabet
      if (this.parent && this.parent.key && this.path[0] === 'components' && this.parent.key === 'components'
        && sortComponentsSet.length > 0 && sortComponentsSet.includes(this.key)
      ) {
        // debugStep = 'Component sorting by alphabet'
        let sortedObj = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
        node = prioritySort(sortedObj, []);
        this.update(node);
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
          && (this.parent && this.parent.key !== 'properties' && this.parent.key !== 'value' && this.path[1] !== 'examples')
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
 * @param {object} oaObj OpenAPI document
 * @param {object} options OpenAPI-format filter options
 * @returns {object} Filtered OpenAPI document
 */
async function openapiFilter(oaObj, options) {
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
  const filterResponseContent = [...filterSet.responseContent];

  // Inverse object filters
  const inverseFilterKeys = [...filterSet.inverseMethods];
  const inverseFilterProps = [...filterSet.inverseOperationIds];
  const inverseFilterArray = [...filterSet.inverseTags];
  const inverseFilterResponseContent = [...filterSet.inverseResponseContent];

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

    // Filter out object matching the "response content"
    if (filterResponseContent.length > 0 && filterResponseContent.includes(this.key)
      && this.parent && this.parent.key === 'content'
      && this.parent.parent && this.parent.parent.parent && this.parent.parent.parent.key === 'responses') {
      // debugFilterStep = 'Filter - response content'
      this.remove();
    }

    // Filter out object matching the inverse "response content"
    if (inverseFilterResponseContent.length > 0 && !inverseFilterResponseContent.includes(this.key)
      && this.parent && this.parent.key === 'content'
      && this.parent.parent && this.parent.parent.parent && this.parent.parent.parent.key === 'responses') {
      // debugFilterStep = 'Filter - inverse response content'
      this.remove();
    }

    // Filter out object matching the inverse "methods"
    if (inverseFilterKeys.length > 0 && !inverseFilterKeys.includes(this.key)
      && this.parent && this.parent.parent && this.parent.parent.key === 'paths') {
      // debugFilterStep = 'Filter - inverse methods'
      this.remove();
    }

    // Filter out object matching the "methods"
    if (filterKeys.length > 0 && filterKeys.includes(this.key)) {
      // debugFilterStep = 'Filter - methods'
      this.remove();
    }

    // Filter out fields without operationIds, when Inverse operationIds is set
    if (node !== null && inverseFilterProps.length > 0 && this.path[0] === 'paths' && node.operationId === undefined
      && httpVerbs.includes(this.key)
    ) {
      // debugFilterStep = 'Filter - Single field - Inverse operationIds without operationIds'
      this.remove();
    }

    // Array field matching
    if (Array.isArray(node)) {
      // Filter out object matching the inverse "tags"
      if (inverseFilterArray.length > 0 && this.key === 'tags' && !inverseFilterArray.some(i => node.includes(i)) && this.parent.parent !== undefined) {
        // debugFilterStep = 'Filter - inverse tags'
        this.parent.delete();
      }

      // Filter out the top level tags matching the inverse "tags"
      if (inverseFilterArray.length > 0 && this.key === 'tags' && this.parent.parent === undefined) {
        // debugFilterStep = 'Filter - inverse top tags'
        node = node.filter(value => inverseFilterArray.includes(value.name))
        this.update(node);
      }

      // Filter out object matching the "tags"
      if (filterArray.length > 0 && this.key === 'tags' && filterArray.some(i => node.includes(i))) {
        // debugFilterStep = 'Filter - tags'
        this.parent.delete();
      }

      // Filter out the top OpenAPI.tags matching the "tags"
      if (filterArray.length > 0 && this.key === 'tags' && this.path[0] === 'tags') {
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

      // Filter out fields matching the inverse operationIds
      if (inverseFilterProps.length > 0 && this.key === 'operationId' && !inverseFilterProps.includes(node)) {
        // debugFilterStep = 'Filter - Single field - Inverse operationIds'
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

    // Filter out OpenAPI.tags & OpenAPI.x-tagGroups matching the flags
    if ((this.key === 'tags' || this.key === 'x-tagGroups') && this.parent.key === undefined && Array.isArray(node)) {
      let oaTags = JSON.parse(JSON.stringify(node)); // Deep copy of the object

      if (filterProps.length > 0) {
        // debugFilterStep = 'Filter - tag/x-tagGroup - flags'
        // Deep filter array of tag/x-tagGroup
        oaTags = oaTags.filter(item => !filterProps.some(i => (Object.keys(item || {}).includes(i))));
        this.update(oaTags);
        // const oaFilteredTags = oaTags.filter(item => !filterProps.some(i => (Object.keys(item || {}).includes(i))));
        // this.update(oaFilteredTags);
      }

      if (filterFlagValues.length > 0) {
        // debugFilterStep = 'Filter - tag - flagValues'
        // Deep filter array of tag/x-tagGroup
        for (let i = 0; i < filterFlagValues.length; i++) {
          let [key, value] = Object.entries(filterFlagValues[i])[0]
          oaTags = oaTags.filter(item => item[key] !== value)
        }

        this.update(oaTags);
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
    const optFs = get(options, 'filterSet.unusedComponents', []) || [];
    unusedComp.schemas = Object.keys(comps.schemas || {}).filter(key => !isUsedComp(comps.schemas, key));
    if (optFs.includes('schemas')) options.unusedComp.schemas = [...options.unusedComp.schemas, ...unusedComp.schemas];
    unusedComp.responses = Object.keys(comps.responses || {}).filter(key => !isUsedComp(comps.responses, key));
    if (optFs.includes('responses')) options.unusedComp.responses = [...options.unusedComp.responses, ...unusedComp.responses];
    unusedComp.parameters = Object.keys(comps.parameters || {}).filter(key => !isUsedComp(comps.parameters, key));
    if (optFs.includes('parameters')) options.unusedComp.parameters = [...options.unusedComp.parameters, ...unusedComp.parameters];
    unusedComp.examples = Object.keys(comps.examples || {}).filter(key => !isUsedComp(comps.examples, key));
    if (optFs.includes('examples')) options.unusedComp.examples = [...options.unusedComp.examples, ...unusedComp.examples];
    unusedComp.requestBodies = Object.keys(comps.requestBodies || {}).filter(key => !isUsedComp(comps.requestBodies, key));
    if (optFs.includes('requestBodies')) options.unusedComp.requestBodies = [...options.unusedComp.requestBodies, ...unusedComp.requestBodies];
    unusedComp.headers = Object.keys(comps.headers || {}).filter(key => !isUsedComp(comps.headers, key));
    if (optFs.includes('headers')) options.unusedComp.headers = [...options.unusedComp.headers, ...unusedComp.headers];
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

    // Filter out OpenAPI.tags & OpenAPI.x-tagGroups matching the fixedFlags
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
    if (node && Object.keys(node).length === 0 && node.constructor === Object && !['security', 'schemas'].includes(this.parent.key)) {
      debugFilterStep = 'Filter - Remove empty objects'
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
    const resultObj = await openapiFilter(jsonObj, options);
    jsonObj = resultObj.data;
    unusedComp = JSON.parse(JSON.stringify(options.unusedComp));
  }

  // Return result object
  return {data: jsonObj, resultData: {unusedComp: unusedComp}}
}

/**
 * OpenAPI Change Case function
 * Traverse through all keys and based on the key name, change the case the props according to the casing configuration.
 * @param {object} oaObj OpenAPI document
 * @param {object} options OpenAPI-format casing options
 * @returns {object} Change casing OpenAPI document
 */
async function openapiChangeCase(oaObj, options) {
  let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object
  let defaultCasing = {}; // JSON.parse(fs.readFileSync(__dirname + "/defaultFilter.json", 'utf8'))
  let casingSet = Object.assign({}, defaultCasing, options.casingSet);

  let debugCasingStep = '' // uncomment // debugCasingStep below to see which sort part is triggered

  // Could add a default for all types pretty easily.
  const changeCasingKeyPlans = {
    'query': casingSet.componentsParametersQuery,
    'path': casingSet.componentsParametersPath,
    'header': casingSet.componentsParametersHeader,
    'cookie': casingSet.componentsParametersCookie
  }

  // Could add a default for all types pretty easily.
  const changeCasingNamePlans = {
    'query': casingSet.parametersQuery,
    'path': casingSet.parametersPath,
    'header': casingSet.parametersHeader,
    'cookie': casingSet.parametersCookie
  }

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
      // Change components/parameters - in:query/in:headers/in:path/in:cookie - key
      if (this.path[1] === 'parameters' && this.path.length === 2 && changeComponentParametersCasingEnabled(casingSet)) {
        const orgObj = JSON.parse(JSON.stringify(node));
        let replacedItems = Object.keys(orgObj).map((key) => {
          const parameterFoundIn = orgObj[key].in
          if (orgObj[key].in && changeCasingKeyPlans.hasOwnProperty(parameterFoundIn)) {
            const changeCasingKeyPlan = changeCasingKeyPlans[parameterFoundIn]
            if (changeCasingKeyPlan) {
              debugCasingStep = `Casing - components/parameters - in:${parameterFoundIn} - key`
              const newKey = changeCase(key, changeCasingKeyPlan);
              comps.parameters[key] = newKey
              return {[newKey]: orgObj[key]};
            }
          }
        });
        this.update(Object.assign({}, ...replacedItems));
      }
      // Change components/parameters - query/header/path/cookie name
      if (this.path[1] === 'parameters' && this.path.length === 3) {
        if (node.in && changeCasingNamePlans.hasOwnProperty(node.in)) {
          const changeCasingNamePlan = changeCasingNamePlans[node.in]
          if (changeCasingNamePlan) {
            debugCasingStep = `Casing - path > parameters/${node.in} - name`
            node.name = changeCase(node.name, changeCasingNamePlan);
            this.update(node);
          }
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

  // Recursive traverse through OpenAPI document for non-components
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
    if (this.key === 'operationId' && casingSet.operationId && this.path[0] === 'paths' && this.path.length === 4) {
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
    // Change components/schemas - properties
    if (this.path[1] === 'schemas' && this.key === 'properties' && casingSet.properties
      && (this.parent && this.parent.key !== 'properties' && this.parent.key !== 'value')
    ) {
      // debugCasingStep = 'Casing - components/schemas - properties name'
      this.update(changeObjKeysCase(node, casingSet.properties));
    }
    // Change paths > schema - properties
    if (this.path[0] === 'paths' && this.key === 'properties' && casingSet.properties
      && (this.parent && this.parent.key !== 'properties' && this.parent.key !== 'value')
    ) {
      // debugCasingStep = 'Casing - paths > schema - properties name'
      this.update(changeObjKeysCase(node, casingSet.properties));
    }
    // Change security - keys
    if (this.path[0] === 'paths' && this.key === 'security' && isArray(node) && casingSet.componentsSecuritySchemes) {
      // debugCasingStep = 'Casing - path > - security'
      this.update(changeArrayObjKeysCase(node, casingSet.componentsSecuritySchemes))
    }
    // Change parameters - name
    if (this.path[0] === 'paths' && this.key === 'parameters'
      && changeParametersCasingEnabled(casingSet)) {
      // debugCasingStep = 'Casing - components > parameters - name'

      // Loop over parameters array
      let params = JSON.parse(JSON.stringify(node)); // Deep copy of the schema object
      for (let i = 0; i < params.length; i++) {
        if (params[i].in && changeCasingNamePlans.hasOwnProperty(params[i].in)) {
          const changeCasingNamePlan = changeCasingNamePlans[params[i].in]
          if (changeCasingNamePlan) {
            // debugCasingStep = 'Casing - path > parameters/query- name'
            params[i].name = changeCase(params[i].name, changeCasingNamePlan)
          }
        }
      }
      this.update(params);
    }

  });

  // Return result object
  return {data: jsonObj, resultData: {}}
}

/**
 * OpenAPI convert version function
 * Convert OpenAPI from version 3.0 to 3.1
 * @param {object} oaObj OpenAPI document
 * @param {object} options OpenAPI-format convert options
 * @returns {object} converted OpenAPI document
 */
async function openapiConvertVersion(oaObj, options) {
  let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object

  // let debugConvertVersionStep = '' // uncomment // debugConvertVersionStep below to see which sort part is triggered

  // Change OpenAPI version
  jsonObj.openapi = "3.1.0"

  // Change x-webhooks to webhooks
  if (jsonObj['x-webhooks']) {
    jsonObj = setInObject(jsonObj,'webhooks', jsonObj['x-webhooks'] ,'x-webhooks')
    // jsonObj.webhooks = jsonObj['x-webhooks']
    delete jsonObj['x-webhooks']
  }

  // Recursive traverse through OpenAPI document for deprecated 3.0 properties
  traverse(jsonObj).forEach(function (node) {
    if (typeof node === 'object') {
      // Change components/schemas - properties
      if (node.type) {
        // Change type > nullable
        node = convertNullable(node);

        // Change type > example
        node = convertExample(node);

        // Change type > exclusiveMinimum
        node = convertExclusiveMinimum(node);

        // Change type > exclusiveMaximum
        node = convertExclusiveMaximum(node);

        // Change type > single enum
        node = convertConst(node);

        this.update(node);
      }

      // Change components/schemas - schema
      if (node.schema) {
        // File Upload Payloads
        if ((get(this, 'parent.key') && this.parent.key === 'content')
          && (get(this, 'parent.parent.key') && this.parent.parent.key === 'requestBody')) {

          // Remove schema for application/octet-stream
          if (this.key === 'application/octet-stream') {
            this.update({})
          }

          // Convert schema for images
          if (this.key && this.key.startsWith('image/')) {
            node = convertImageBase64(node)
            this.update(node)
          }
        }
      }

      // Convert schema for multipart file uploads with a binary file
      if (get(this, 'parent.parent.parent.key') && this.parent.parent.parent.key === 'multipart/form-data') {
        node = convertMultiPartBinary(node)
        this.update(node)
      }
    }
  });

  // Return result object
  return {data: jsonObj, resultData: {}}
}

/**
 * OpenAPI rename function
 * Change the title of the OpenAPI document with a provided value.
 * @param {object} oaObj OpenAPI document
 * @param {object} options OpenAPI-format options
 * @returns {object} Renamed OpenAPI document
 */
async function openapiRename(oaObj, options) {
  let jsonObj = JSON.parse(JSON.stringify(oaObj)); // Deep copy of the schema object

  // OpenAPI 3
  if (jsonObj.info && jsonObj.info.title && options.rename && options.rename !== "") {
    jsonObj.info.title = options.rename
  }

  // Return result object
  return {data: jsonObj, resultData: {}}
}

module.exports = {
  openapiFilter: openapiFilter,
  openapiSort: openapiSort,
  openapiChangeCase: openapiChangeCase,
  openapiConvertVersion: openapiConvertVersion,
  openapiRename: openapiRename,
  changeCase: changeCase
};
