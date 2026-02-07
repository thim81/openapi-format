# openapi-format feature matrix

This matrix summarizes CLI/config options, defaults, and notable interactions.

## Input and output

| Option | Type | Default | Effect | Notes |
|---|---|---|---|---|
| `oaFile` | argument | required unless overlay `extends` | Input OpenAPI/AsyncAPI source | Supports local path and remote URL.
| `--output`, `-o` | path | none | Write output to file or split root | Required for `--split`.
| `--json` | boolean | false | Print stdout as JSON | Affects stdout formatting when no output file is given.
| `--yaml` | boolean | false | Print stdout as YAML | Affects stdout formatting when no output file is given.

## Config loading and precedence

| Source | Applied when | Priority |
|---|---|---|
| `.openapiformatrc` in CWD | only when `--configFile` is absent | lowest |
| `--configFile` | when provided | middle |
| CLI flags | always | highest |

Normalization behavior:
- `--no-sort` sets `sort=false`.
- `--no-bundle` sets `bundle=false`.

Defaults with explicit fallback logic:
- `sort=true`
- `bundle=true`
- `keepComments=false`
- `sortComponentsProps=false`
- `split=false`
- `lineWidth=-1`

## Sorting

| Option | Type | Default | Effect | Notes |
|---|---|---|---|---|
| `--sortFile`, `-s` | path | `defaultSort.json` | Field order priorities | Used when `sort=true`.
| `--no-sort` | boolean | false | Disable sorting | Skips sort stage entirely.
| `--sortComponentsFile` | path | none | Alphabetize listed component groups | See `defaultSortComponents.json`.
| `--sortComponentsProps` | boolean | false | Alphabetize schema properties in components | Scope is `components.schemas.*.properties`.
| `sortSet.sortPathsBy` | enum | `original` | Path order mode | Values: `original`, `path`, `tags`.

## Filtering

| Key | Type | Semantics |
|---|---|---|
| `methods` | string[] | Remove matching HTTP methods from path items |
| `inverseMethods` | string[] | Keep only matching methods |
| `tags` | string[] | Remove operations/tag entries with matching tags |
| `inverseTags` | string[] | Keep operations/tag entries with matching tags |
| `operationIds` | string[] | Remove matching operationIds |
| `inverseOperationIds` | string[] | Keep only matching operationIds |
| `operations` | string[] | Remove matching `path#method` patterns |
| `flags` | string[] | Remove objects containing matching marker keys |
| `inverseFlags` | string[] | Keep objects containing matching marker keys |
| `flagValues` | object[] | Remove objects/values matching key-value markers |
| `inverseFlagValues` | object[] | Keep objects matching marker key-values |
| `responseContent` | string[] | Remove matching response media types |
| `inverseResponseContent` | string[] | Keep only matching response media types |
| `requestContent` | string[] | Remove matching request media types |
| `inverseRequestContent` | string[] | Keep only matching request media types |
| `unusedComponents` | string[] | Remove unreferenced components recursively |
| `stripFlags` | string[] | Remove flag keys after filtering |
| `textReplace` | object[] | Replace text in `description`, `summary`, and `url` |
| `preserveEmptyObjects` | boolean/string[] | Preserve selected empty objects instead of pruning |

Important behavior:
- Filter stage is recursive and may run multiple passes to remove now-unused components.
- Empty path items are removed when no operations remain.

## Casing

| Option (`casingSet`) | Effect |
|---|---|
| `operationId` | Casing for operation IDs |
| `properties` | Casing for schema/path property keys and required names |
| `parametersQuery` / `parametersHeader` / `parametersPath` / `parametersCookie` | Casing for inline parameter names by location |
| `componentsSchemas` / `componentsExamples` / `componentsHeaders` / `componentsResponses` / `componentsRequestBodies` / `componentsSecuritySchemes` | Casing for component keys |
| `componentsParametersQuery` / `componentsParametersHeader` / `componentsParametersPath` / `componentsParametersCookie` | Casing for `components.parameters` keys by parameter `in` |

Reference behavior:
- Related `$ref` values are updated for renamed component keys.

## Generate

| Key (`generateSet`) | Type | Default | Effect |
|---|---|---|---|
| `operationIdTemplate` | string | none | Template used to generate operationIds |
| `overwriteExisting` | boolean | false | If true, regenerate even existing operationIds |

Template resolves against operation context using internal parse template utilities.

## Overlay

| Option | Type | Effect |
|---|---|---|
| `--overlayFile`, `-l` | path | Load overlay actions and apply to input document |

Notable behavior:
- If no input file is provided and overlay includes `extends`, CLI uses that value as effective input.
- Local `extends` is resolved relative to overlay file directory.
- CLI reports action usage summary and unused actions in verbose logs.

## Convert and rename

| Option | Type | Effect |
|---|---|---|
| `--convertTo` | string | Convert OpenAPI to 3.1 or 3.2 |
| `--rename` | string | Replace `info.title` |

Convert stage details:
- Converts nullable/exclusive limits/example/const forms as needed.
- `x-webhooks` migration is handled.
- Additional 3.2 transforms are applied when target is 3.2.

## Split and bundle

| Option | Type | Default | Effect |
|---|---|---|---|
| `--split` | boolean | false | Write multi-file output structure |
| `--no-bundle` | boolean | false | Disable local/remote `$ref` bundling during parse |

Split behavior:
- Requires `--output`.
- Writes component files, path files, and a root split spec.

## Pipeline order

The CLI runs transformations in this exact sequence:
1. generate
2. filter
3. overlay
4. sort
5. casing
6. convertTo
7. rename
8. write output (single file or split) or print stdout
