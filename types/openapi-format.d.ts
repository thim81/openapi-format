declare module 'openapi-format' {
  import {OpenAPIV3} from 'openapi-types';

  export type JsonObject = Record<string, unknown>;
  export type OpenApiDocument = OpenAPIV3.Document | JsonObject;

  export interface OpenAPIResult<TDoc = OpenApiDocument, TResult = JsonObject> {
    data: TDoc;
    resultData: TResult;
  }

  export interface OpenAPISortSet {
    root?: Array<'openapi' | 'info' | 'servers' | 'paths' | 'components' | 'tags' | 'x-tagGroups' | 'externalDocs'>;
    get?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>;
    query?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>;
    post?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>;
    put?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>;
    patch?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>;
    delete?: Array<'operationId' | 'summary' | 'description' | 'parameters' | 'requestBody' | 'responses'>;
    parameters?: Array<'name' | 'in' | 'description' | 'required' | 'schema'>;
    requestBody?: Array<'description' | 'required' | 'content'>;
    responses?: Array<'description' | 'headers' | 'content' | 'links'>;
    content?: string[];
    components?: Array<'parameters' | 'schemas' | 'mediaTypes'>;
    schema?: Array<'description' | 'type' | 'items' | 'properties' | 'format' | 'example' | 'default'>;
    schemas?: Array<'description' | 'type' | 'items' | 'properties' | 'format' | 'example' | 'default'>;
    properties?: Array<'description' | 'type' | 'items' | 'format' | 'example' | 'default' | 'enum'>;
    sortPathsBy?: 'original' | 'path' | 'tags';
    [key: string]: unknown;
  }

  export interface OpenAPISortOptions {
    sort?: boolean;
    sortSet?: OpenAPISortSet;
    sortComponentsSet?: string[];
    sortComponentsProps?: boolean;
    [key: string]: unknown;
  }

  export interface OpenAPIFilterSet {
    methods?: string[];
    tags?: string[];
    operationIds?: string[];
    operations?: string[];
    flags?: string[];
    flagValues?: Array<Record<string, unknown>>;
    inverseMethods?: string[];
    inverseTags?: string[];
    inverseOperationIds?: string[];
    inverseFlags?: string[];
    inverseFlagValues?: Array<Record<string, unknown>>;
    responseContent?: string[];
    inverseResponseContent?: string[];
    requestContent?: string[];
    inverseRequestContent?: string[];
    unusedComponents?: string[];
    stripFlags?: string[];
    preserveEmptyObjects?: boolean | string[];
    textReplace?: Array<Record<string, unknown>>;
    [key: string]: unknown;
  }

  export interface OpenAPIFilterOptions {
    filterSet?: OpenAPIFilterSet;
    defaultFilter?: OpenAPIFilterSet;
    unusedDepth?: number;
    [key: string]: unknown;
  }

  export interface OpenAPICasingSet {
    operationId?: string;
    properties?: string;
    parametersQuery?: string;
    parametersHeader?: string;
    parametersPath?: string;
    componentsExamples?: string;
    componentsSchemas?: string;
    componentsHeaders?: string;
    componentsResponses?: string;
    componentsRequestBodies?: string;
    componentsSecuritySchemes?: string;
    componentsParametersQuery?: string;
    componentsParametersHeader?: string;
    componentsParametersPath?: string;
    [key: string]: unknown;
  }

  export interface OpenAPICasingOptions {
    casingSet?: OpenAPICasingSet;
    [key: string]: unknown;
  }

  export interface OpenAPIGenerateSet {
    operationIdTemplate?: string;
    overwriteExisting?: boolean;
    [key: string]: unknown;
  }

  export interface OpenAPIGenerateOptions {
    generateSet?: OpenAPIGenerateSet;
    [key: string]: unknown;
  }

  export interface OpenAPIOverlayAction {
    target: string;
    update?: Record<string, unknown>;
    remove?: boolean;
    description?: string;
  }

  export interface OpenAPIOverlayOptions {
    overlaySet: {
      actions: OpenAPIOverlayAction[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  export interface OpenAPIConvertVersionOptions {
    convertTo?: '3.0' | '3.1' | '3.2' | string;
    [key: string]: unknown;
  }

  export interface OpenAPISplitOptions {
    output: string;
    [key: string]: unknown;
  }

  export interface OpenAPIRenameOptions {
    rename?: string;
    [key: string]: unknown;
  }

  export interface AnalyzeOpenApiResult {
    operations?: string[];
    methods?: string[];
    paths?: string[];
    flags?: string[];
    operationIds?: string[];
    flagValues?: string[];
    responseContent?: string[];
    requestContent?: string[];
    tags?: string[];
    [key: string]: string[] | undefined;
  }

  export interface WriteFileOptions {
    format?: string;
    json?: boolean;
    keepComments?: boolean;
    yamlComments?: Record<string, unknown>;
    lineWidth?: string | number;
    mode?: string;
    [key: string]: unknown;
  }

  export interface ParseOptions extends WriteFileOptions {
    bundle?: boolean;
  }

  export interface JsonPathNode {
    value: unknown;
    parent: unknown;
    key: string | number | undefined;
  }

  export function openapiSort(oaObj: OpenApiDocument, options: OpenAPISortOptions): Promise<OpenAPIResult>;
  export function getDefaultSortSet(): Promise<OpenAPISortSet>;
  export function getDefaultSortComponentsSet(): Promise<string[]>;
  export function openapiFilter(oaObj: OpenApiDocument, options: OpenAPIFilterOptions): Promise<OpenAPIResult>;
  export function openapiGenerate(oaObj: OpenApiDocument, options: OpenAPIGenerateOptions): Promise<OpenAPIResult>;
  export function openapiChangeCase(oaObj: OpenApiDocument, options: OpenAPICasingOptions): Promise<OpenAPIResult>;
  export function openapiOverlay(oaObj: OpenApiDocument, options: OpenAPIOverlayOptions): Promise<OpenAPIResult>;
  export function openapiSplit(oaObj: OpenApiDocument, options: OpenAPISplitOptions): Promise<void>;
  export function openapiConvertVersion(
    oaObj: OpenApiDocument,
    options: OpenAPIConvertVersionOptions
  ): Promise<OpenAPIResult>;
  export function openapiRename(oaObj: OpenApiDocument, options: OpenAPIRenameOptions): Promise<OpenAPIResult>;

  export function readFile(filePath: string, options?: ParseOptions): Promise<string>;
  export function parseFile(filePath: string, options?: ParseOptions): Promise<JsonObject | string | SyntaxError>;
  export function parseString(input: string, options?: ParseOptions): Promise<JsonObject | string | SyntaxError>;
  export function stringify<T extends Record<string, unknown>>(document: T, options?: WriteFileOptions): Promise<string>;
  export function writeFile(filePath: string, data: Record<string, unknown>, options?: WriteFileOptions): Promise<void>;
  export function detectFormat(input: string): Promise<'json' | 'yaml' | 'unknown'>;
  export function analyzeOpenApi(oaObj: OpenApiDocument): AnalyzeOpenApiResult;

  export function changeCase(valueAsString: string, caseType: string): string;
  export function resolveJsonPath(obj: Record<string, unknown> | unknown[], path: string): JsonPathNode[];
  export function resolveJsonPathValue(obj: Record<string, unknown> | unknown[], path: string): unknown[];
}
