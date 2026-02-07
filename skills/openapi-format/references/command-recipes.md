# Command recipes

These are direct CLI recipes for common and advanced workflows.

## Basic formatting

```bash
openapi-format openapi.yaml --output openapi.formatted.yaml
```

## Print to stdout as JSON

```bash
openapi-format openapi.yaml --json
```

## Print to stdout as YAML

```bash
openapi-format openapi.json --yaml
```

## Use a specific config file

```bash
openapi-format openapi.yaml --configFile config/format.yaml --output dist/openapi.yaml
```

## Use custom sort file

```bash
openapi-format openapi.yaml --sortFile config/sort.json --output dist/openapi.yaml
```

## Sort specific component groups alphabetically

```bash
openapi-format openapi.yaml --sortComponentsFile config/sort-components.json --output dist/openapi.yaml
```

## Sort schema properties within components

```bash
openapi-format openapi.yaml --sortComponentsProps --output dist/openapi.yaml
```

## Disable sort

```bash
openapi-format openapi.yaml --no-sort --output dist/openapi.yaml
```

## Disable bundling

```bash
openapi-format openapi.yaml --no-bundle --output dist/openapi.yaml
```

## Filter with filter file

```bash
openapi-format openapi.yaml --filterFile config/filter.yaml --output dist/openapi.filtered.yaml
```

## Apply casing rules

```bash
openapi-format openapi.yaml --casingFile config/casing.yaml --output dist/openapi.cased.yaml
```

## Generate operationIds

```bash
openapi-format openapi.yaml --generateFile config/generate.yaml --output dist/openapi.generated.yaml
```

## Apply overlay to input

```bash
openapi-format openapi.yaml --overlayFile config/overlay.yaml --output dist/openapi.overlay.yaml
```

## Apply overlay with `extends` as implicit input

```bash
openapi-format --overlayFile config/overlay.yaml --output dist/openapi.overlay.yaml
```

## Convert to OpenAPI 3.1

```bash
openapi-format openapi.yaml --convertTo 3.1 --output dist/openapi.3.1.yaml
```

## Convert to OpenAPI 3.2

```bash
openapi-format openapi.yaml --convertTo 3.2 --output dist/openapi.3.2.yaml
```

## Rename API title

```bash
openapi-format openapi.yaml --rename "Example API" --output dist/openapi.renamed.yaml
```

## Split into multi-file structure

```bash
openapi-format openapi.yaml --split --output dist/openapi/root.yaml
```

## Preserve YAML comments and set line width

```bash
openapi-format openapi.yaml --keepComments --lineWidth 120 --output dist/openapi.yaml
```

## Verbose diagnostics

```bash
openapi-format openapi.yaml --filterFile config/filter.yaml --output dist/openapi.yaml -vv
```

## Playground share link generation

```bash
openapi-format openapi.yaml --configFile config/format.yaml --playground
```

## Composite example: generate, filter, overlay, casing, convert, rename

```bash
openapi-format openapi.yaml \
  --generateFile config/generate.yaml \
  --filterFile config/filter.yaml \
  --overlayFile config/overlay.yaml \
  --casingFile config/casing.yaml \
  --convertTo 3.2 \
  --rename "Public API" \
  --output dist/openapi.public.3.2.yaml
```

Expected processing order is fixed by CLI internals; flags do not reorder stages.
