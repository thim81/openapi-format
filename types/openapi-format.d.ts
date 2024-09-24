// openapi-format.d.ts

declare module 'openapi-format' {
  import { OpenAPIV3 } from 'openapi-types'

  interface OpenAPISortSet {
    root?: Array<'openapi' | 'info' | 'servers' | 'paths' | 'components' | 'tags' | 'x-tagGroups' | 'externalDocs'>
    get?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>
    post?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>
    put?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>
    patch?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>
    delete?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>
    parameters?: Array<'name' | 'in' | 'description' | 'required' | 'schema'>
    requestBody?: Array<'description' | 'required' | 'content'>
    responses?: Array<'description' | 'headers' | 'content' | 'links'>
    content?: Array<string>
    components?: Array<'parameters' | 'schemas'>
    schema?: Array<'description' | 'type' | 'items' | 'properties' | 'format' | 'example' | 'default'>
    schemas?: Array<'description' | 'type' | 'items' | 'properties' | 'format' | 'example' | 'default'>
    properties?: Array<'description' | 'type' | 'items' | 'format' | 'example' | 'default' | 'enum'>
    sortPathsBy?: 'original' | 'path' | 'tags'
  }

  interface OpenAPISortOptions {
    sortSet: OpenAPISortSet
    sortComponentsSet?: string[]
  }

  interface OpenAPIFilterSet {
    methods?: string[]
    tags?: string[]
    operationIds?: string[]
    operations?: string[]
    flags?: string[]
    flagValues?: string[]
    inverseMethods?: string[]
    inverseTags?: string[]
    inverseOperationIds?: string[]
    responseContent?: string[]
    inverseResponseContent?: string[]
    unusedComponents?: string[]
    stripFlags?: string[]
    preserveEmptyObjects?: boolean | string[];
  }

  interface OpenAPICasingOptions {
    casingSet?: OpenAPICasingSet
  }

  interface OpenAPICasingSet {
    operationId?: string
    properties?: string
    parametersQuery?: string
    parametersHeader?: string
    parametersPath?: string
    componentsExamples?: string
    componentsSchemas?: string
    componentsHeaders?: string
    componentsResponses?: string
    componentsRequestBodies?: string
    componentsSecuritySchemes?: string
    componentsParametersQuery?: string
    componentsParametersHeader?: string
    componentsParametersPath?: string
  }

  interface OpenAPIGenerateOptions {
    generateSet?: OpenAPIGenerateSet
  }

  interface OpenAPIGenerateSet {
    operationIdTemplate?: string
    overwriteExisting?: boolean
  }

  interface OpenAPIFilterOptions {
    filterSet?: OpenAPIFilterSet
    defaultFilter?: OpenAPIFilterSet
  }

  interface OpenAPIResult {
    data: OpenAPIV3.Document | string
    resultData: Record<string, never>
  }

  export interface AnalyzeOpenApiResult {
    operations?: string[];
    methods?: string[];
    paths?: string[];
    flags?: string[];
    operationIds?: string[];
    flagValues?: string[];
    responseContent?: string[];
    tags?: string[];
    [key: string]: string[] | undefined;
  }

  export interface WriteFileOptions {
    format?: string;
    keepComments?: boolean;
    yamlComments?: Record<string, unknown>;
    lineWidth?: string | number;
    mode?: string;
  }

  /**
   * Sorts the properties of an OpenAPI document according to the specified sort configuration.
   * @param {OpenAPIV3.Document} oaObj - The OpenAPI document to be sorted.
   * @param {OpenAPISortOptions} options - The sorting options.
   * @returns {Promise<OpenAPIResult>} The sorted OpenAPI document.
   */
  export function openapiSort(
    oaObj: OpenAPIV3.Document,
    options: OpenAPISortOptions
  ): Promise<OpenAPIResult>

  /**
   * Filters the properties of an OpenAPI document based on the specified filter configuration.
   * @param {OpenAPIV3.Document} oaObj - The OpenAPI document to be filtered.
   * @param {OpenAPIFilterOptions} options - The filtering options.
   * @returns {Promise<OpenAPIResult>} The filtered OpenAPI document.
   */
  export function openapiFilter(
    oaObj: OpenAPIV3.Document,
    options: OpenAPIFilterOptions
  ): Promise<OpenAPIResult>

  /**
   * Generate elements for an OpenAPI document based on the specified generate configuration.
   * @param {OpenAPIV3.Document} oaObj - The OpenAPI document.
   * @param {OpenAPIGenerateOptions} options - The generate options.
   * @returns {Promise<OpenAPIResult>} The enriched OpenAPI document.
   */
  export function openapiGenerate(
    oaObj: OpenAPIV3.Document,
    options: OpenAPIGenerateOptions
  ): Promise<OpenAPIResult>

  /**
   * Change the case of properties an OpenAPI document based on the specified casing configuration.
   * @param {OpenAPIV3.Document} oaObj - The OpenAPI document.
   * @param {OpenAPICasingOptions} options - The casing options.
   * @returns {Promise<OpenAPIResult>} The cased OpenAPI document.
   */
  export function openapiChangeCase(
    oaObj: OpenAPIV3.Document,
    options: OpenAPICasingOptions
  ): Promise<OpenAPIResult>

  /**
   * Parses a JSON or YAML file into a JavaScript object.
   * @param {string} filePath - The path to the JSON or YAML file.
   * @param {Record<string, unknown>} [options] - Additional parsing options.
   * @returns {Promise<Record<string, any>>} The parsed data object.
   */
  export function parseFile(
    filePath: string,
    options?: Record<string, unknown>
  ): Promise<Record<string, any>>

  /**
   * Parses a JSON or YAML string into a JavaScript object.
   * @param {string} input - The JSON or YAML string.
   * @param {Record<string, unknown>} [options] - Additional parsing options.
   * @returns {Promise<Record<string, any>>} The parsed data object.
   */
  export function parseString(
    input: string,
    options?: Record<string, unknown>
  ): Promise<Record<string, any>>

  /**
   * Detects the format of a given string as either JSON or YAML.
   * @param {string} input - The string to detect the format of.
   * @returns {Promise<'json' | 'yaml' | 'unknown'>} The detected format.
   */
  export function detectFormat(
    input: string,
  ): Promise<'json' | 'yaml' | 'unknown'>

  /**
   * Writes a JavaScript object to a file in JSON or YAML format.
   * @param {string} filePath - The path to the output file.
   * @param {Record<string, unknown> | OpenAPIV3.Document} data - The data object to write.
   * @param {WriteFileOptions} [options] - Additional write options.
   * @returns {Promise<void>} Resolves when the file has been written.
   */
  export function writeFile(
    filePath: string,
    data: Record<string, unknown>,
    options?: WriteFileOptions
  ): Promise<void>;
  /**
   * Changes the case of a given string to the specified case type.
   * @param {string} valueAsString - The input string to change the case of.
   * @param {string} caseType - The target case type (e.g., 'camelCase', 'pascalCase', 'kebabCase', 'snakeCase').
   * @returns {string} The string with the specified case.
   */
  export function changeCase(valueAsString: string, caseType: string): string

  /**
   * Analyze the OpenAPI document.
   * @param {OpenAPIV3.Document} oaObj - The OpenAPI document as a JSON object.
   * @returns {AnalyzeOpenApiResult}
   */
  export function analyzeOpenApi(oaObj: Record<string, unknown> | OpenAPIV3.Document): AnalyzeOpenApiResult

  /**
   * Converts any document to a string representation (e.g., JSON or YAML).
   * @param {T} document - The document to convert.
   * @param {Record<string, unknown>} [options] - Additional stringification options.
   * @returns {Promise<string>} The string representation of the document.
   */
  export function stringify<T extends Record<string, unknown>>(
    document: T,
    options?: Record<string, unknown>
  ): Promise<string>;
}
