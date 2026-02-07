# Minimal config patterns

Start from defaults and specify only what the user requested.

## Pattern: default sort with single output file

Use no config file when defaults are enough.

```bash
openapi-format input.yaml --output output.yaml
```

## Pattern: custom path ordering only

`sortPathsBy` is the only override.

```yaml
# config/sort-paths.yaml
sortSet:
  sortPathsBy: path
```

```bash
openapi-format input.yaml --configFile config/sort-paths.yaml --output output.yaml
```

## Pattern: filter internal endpoints and strip filter flags

```yaml
# config/public-docs.yaml
filterFile: ./config/public-filter.yaml
```

```yaml
# config/public-filter.yaml
flags:
  - x-internal
stripFlags:
  - x-internal
unusedComponents:
  - schemas
  - parameters
  - responses
```

```bash
openapi-format input.yaml --configFile config/public-docs.yaml --output public.yaml
```

## Pattern: inverse keep-only tags

```yaml
# config/partner-filter.yaml
filterSet:
  inverseTags:
    - partner
  stripFlags:
    - x-openapi-format-filter
```

```bash
openapi-format input.yaml --configFile config/partner-filter.yaml --output partner.yaml
```

## Pattern: generate operationIds only when missing

```yaml
# config/generate-opids.yaml
generateSet:
  operationIdTemplate: "{{method}}_{{path}}"
  overwriteExisting: false
```

```bash
openapi-format input.yaml --configFile config/generate-opids.yaml --output output.yaml
```

## Pattern: casing selected components and properties

```yaml
# config/casing.yaml
casingSet:
  operationId: camelCase
  properties: camelCase
  componentsSchemas: PascalCase
  componentsParametersQuery: camelCase
```

```bash
openapi-format input.yaml --configFile config/casing.yaml --output output.yaml
```

## Pattern: overlay with explicit base file

```yaml
# config/overlay-actions.yaml
actions:
  - target: "$.paths['/pets'].get"
    update:
      summary: "List pets"
```

```bash
openapi-format input.yaml --overlayFile config/overlay-actions.yaml --output output.yaml
```

## Pattern: overlay using `extends` fallback input

```yaml
# config/overlay-extends.yaml
extends: ./base.yaml
actions:
  - target: "$.info"
    update:
      title: "Public API"
```

```bash
openapi-format --overlayFile config/overlay-extends.yaml --output output.yaml
```

## Pattern: convert to 3.2 and rename title

No extra config required.

```bash
openapi-format input.yaml --convertTo 3.2 --rename "New API" --output output.yaml
```

## Pattern: split output tree

```bash
openapi-format input.yaml --split --output ./openapi/root.yaml
```

## Pattern: project defaults in `.openapiformatrc`

```yaml
# .openapiformatrc
lineWidth: 120
keepComments: true
sort: true
bundle: true
sortSet:
  sortPathsBy: original
```

Then run:

```bash
openapi-format input.yaml --output output.yaml
```

## Pattern: override only one setting from config at runtime

```bash
openapi-format input.yaml --configFile config/base.yaml --no-sort --output output.yaml
```

This keeps all other config keys and only disables sorting.
