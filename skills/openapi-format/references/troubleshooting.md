# Troubleshooting

Use this guide when command output is missing, transformations look wrong, or the CLI exits early.

## Error: input file not found

Symptoms:
- CLI reports input file read failure.

Checks:
1. Confirm `oaFile` path is correct.
2. Confirm relative path is resolved from current working directory.
3. If relying on overlay `extends`, confirm `extends` exists and is correct.

Fix:
- Provide explicit input path or fix overlay `extends` path.

## Error: config/sort/filter/casing/generate/overlay file not found

Symptoms:
- CLI exits with file-specific "no such file" message.

Checks:
1. Verify file path and extension.
2. Verify current working directory.
3. Avoid stale relative paths after moving config files.

Fix:
- Use absolute path or correct relative path.

## Output not written

Symptoms:
- Command succeeds but no file appears.

Checks:
1. Confirm `--output` was provided.
2. For stdout mode, check whether `--json`/`--yaml` printed to terminal instead.
3. Confirm output directory exists and is writable.

Fix:
- Add `--output` or capture stdout to file.

## Split mode failed

Symptoms:
- Split error appears.

Checks:
1. Confirm `--split` is paired with `--output`.
2. Confirm output path directory is valid.

Fix:
- Provide `--output` root file path such as `dist/openapi/root.yaml`.

## Filter removed too much

Symptoms:
- Large sections disappear unexpectedly.

Checks:
1. Distinguish removal filters vs inverse keep filters.
2. Check `methods` and `tags` lists for inverted intent.
3. Check `unusedComponents` list, which can prune recursively.

Fix:
- Switch to inverse filters when intent is keep-only.
- Narrow `unusedComponents` to required component groups.

## Filter did not remove expected operations

Symptoms:
- Operations remain after filter.

Checks:
1. Verify exact operationId/tag/method spelling.
2. Verify `operations` pattern matches path and method.
3. Increase verbosity (`-v`, `-vv`, `-vvv`) for process diagnostics.

Fix:
- Correct filter values and rerun.

## Casing changed component names but refs look broken

Symptoms:
- References appear inconsistent.

Checks:
1. Ensure casing keys match intended component groups.
2. Confirm refs use standard `#/components/...` format.

Fix:
- Apply casing only to intended groups.
- Re-run without conflicting manual key edits.

## ConvertTo produced unexpected schema differences

Symptoms:
- Schema fields changed shape after conversion.

Checks:
1. Confirm target version (`3.1` vs `3.2`).
2. Expect conversion of nullable/exclusive limits/example/const patterns.
3. Expect additional transforms for 3.2 mode.

Fix:
- Validate changes against target OpenAPI spec expectations.
- Use versioned output files for diff review.

## Config precedence confusion

Symptoms:
- CLI behavior differs from config file values.

Checks:
1. If `--configFile` is passed, `.openapiformatrc` is not loaded.
2. CLI flags override loaded config values.
3. `--no-sort` and `--no-bundle` override to false.

Fix:
- Remove conflicting CLI flags or consolidate into one config source.

## Overlay actions not applied

Symptoms:
- Overlay summary shows unused actions.

Checks:
1. Validate action `target` JSONPath expressions.
2. Confirm target nodes exist after earlier stages.
3. Remember overlay runs after generate/filter and before sort/casing/convert.

Fix:
- Correct target paths.
- Adjust filtering if it removes target nodes before overlay.

## Remote references or remote input issues

Symptoms:
- Bundling or parse fails for remote refs.

Checks:
1. Confirm remote URLs are reachable.
2. If debugging, try `--no-bundle` to isolate bundling-related issues.

Fix:
- Restore connectivity or localize dependencies.
- Re-enable bundle once refs are valid.
