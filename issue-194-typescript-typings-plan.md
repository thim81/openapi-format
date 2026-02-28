# Plan: Fix “TypeScript typings outdated” (Issue #194)

## 1) Diagnosis & scope

### Current mismatch hypothesis (to confirm in audit)
Runtime `module.exports` currently includes:

- `openapiFilter`
- `openapiGenerate`
- `openapiSort`
- `getDefaultSortSet`
- `getDefaultSortComponentsSet`
- `openapiChangeCase`
- `openapiOverlay`
- `openapiSplit`
- `openapiConvertVersion`
- `openapiRename`
- `readFile`
- `parseFile`
- `parseString`
- `stringify`
- `writeFile`
- `detectFormat`
- `analyzeOpenApi`
- `changeCase`
- `resolveJsonPath`
- `resolveJsonPathValue`

The current `types/openapi-format.d.ts` does **not** fully expose that API (at least `openapiConvertVersion`, `openapiSplit`, `openapiRename`, `readFile` are missing), so TS users cannot call supported runtime exports safely.

### Structural/type-quality issues to address in `types/openapi-format.d.ts`

- Module shape should stay CJS-friendly (`declare module 'openapi-format'` with named exports), but confirm import ergonomics in both:
  - `const of = require('openapi-format')`
  - `import * as of from 'openapi-format'`
- Several signatures are too narrow/wide or inconsistent with runtime behavior:
  - `OpenAPIResult.data` should support generic object documents (`Record<string, unknown>`) in addition to `OpenAPIV3.Document`.
  - `analyzeOpenApi` appears synchronous today; keep sync return unless runtime changes.
  - `detectFormat` should return the exact literal union used at runtime (`json | yaml | unknown`) and confirm sync/async behavior.
  - `parseFile`/`parseString`/`readFile` should reflect what utilities actually return and accept.
  - `resolveJsonPath`/`resolveJsonPathValue` currently use `any`; keep permissive where needed but tighten parent/key/value wrappers.
- Improve consistency/style in declaration file:
  - Consistent semicolons and formatting.
  - Reusable base types (shared options/result interfaces).
  - Avoid over-constraining config sets that are extensible by design (prefer index signatures where users pass custom keys).

### Validation approach for diagnosis

- Runtime export snapshot script (see section 2).
- Type declaration export snapshot script (TS compiler API or simple textual parser).
- Compile-only consumer tests that exercise all public exports.

---

## 2) Concrete API surface audit procedure (repeatable)

### A. Runtime export audit

Add a script: `scripts/audit-runtime-exports.js`

- `const api = require('../openapi-format')`
- Print sorted `Object.keys(api)`
- Optionally write to `tmp/runtime-exports.json`

Example command:

```bash
node scripts/audit-runtime-exports.js
```

### B. Typings export audit

Add a script: `scripts/audit-types-exports.js`

Low-dependency option:

- Read `types/openapi-format.d.ts`
- Extract `export function`, `export type`, `export interface`, and `export { ... }` names via regex (good enough here).
- Compare against runtime keys list.

Stronger option (preferred if adding TS as dev dep is acceptable):

- Use TypeScript compiler API to parse declarations robustly.

Example command:

```bash
node scripts/audit-_types-exports.js
```

### C. Enforce parity

- Add `npm` script:
  - `"check:exports": "node scripts/audit-runtime-exports.js && node scripts/audit-types-exports.js"`
- Fail CI if:
  - Runtime export missing in declarations.
  - Declaration exports symbol not actually exported at runtime (unless intentionally type-only, e.g., interfaces).

---

## 3) Typing design proposal

## Core shared types

- `type JsonObject = Record<string, unknown>`
- `type OpenApiDocument = OpenAPIV3.Document | JsonObject`
- `interface OpenAPIResult<TDoc = OpenApiDocument, TResult = JsonObject> { data: TDoc; resultData: TResult }`

Use these across all OpenAPI operations.

## Public operation signatures

- `openapiSort(oaObj, options): Promise<OpenAPIResult>`
- `openapiFilter(oaObj, options): Promise<OpenAPIResult>`
- `openapiGenerate(oaObj, options): Promise<OpenAPIResult>`
- `openapiChangeCase(oaObj, options): Promise<OpenAPIResult>`
- `openapiOverlay(oaObj, options): Promise<OpenAPIResult>`
- `openapiConvertVersion(oaObj, options): Promise<OpenAPIResult>`
- `openapiRename(oaObj, options): Promise<OpenAPIResult>`

## Newly-added/updated APIs (required for issue #194)

- `openapiConvertVersion`
  - `interface OpenAPIConvertVersionOptions { convertTo?: '3.0' | '3.1' | string; [key: string]: unknown }`
  - Pragmatic: keep permissive with index signature because conversion options may evolve.
- `openapiSplit`
  - `interface OpenAPISplitOptions { output?: string; [key: string]: unknown }`
  - Return type likely `Promise<OpenAPIResult | JsonObject>` depending on runtime behavior; verify implementation and narrow if safe.
- `openapiRename`
  - `interface OpenAPIRenameOptions { rename?: string; [key: string]: unknown }`
- `readFile`
  - `readFile(filePath: string): Promise<string>` (or union if runtime can return Buffer; verify in `utils/file.js`).

## Utility APIs

- `parseFile(filePath, options?): Promise<JsonObject>`
- `parseString(input, options?): Promise<JsonObject>`
- `stringify(document, options?): Promise<string>`
- `writeFile(filePath, data, options?): Promise<void>`
- `detectFormat(input): Promise<'json' | 'yaml' | 'unknown'>`
- `analyzeOpenApi(doc): AnalyzeOpenApiResult`
- `changeCase(valueAsString, caseType): string`
- `resolveJsonPath(obj, path): Array<{ value: unknown; parent: unknown; key: string | number }>`
- `resolveJsonPathValue(obj, path): unknown[]`

## Strict-vs-permissive guidance

- Be strict where stable and obvious:
  - function names
  - async/sync behavior
  - known literal unions (`detectFormat`)
- Be permissive where format/config is intentionally extensible:
  - option bags (`[key: string]: unknown`)
  - intermediate metadata (`resultData: Record<string, unknown>`)

---

## 4) Validation plan

## A. Minimal TypeScript consumer test

Prefer low-dependency compile check with `tsc`:

- Add `test/types/consumer.ts` with:
  - `import * as of from 'openapi-format'`
  - References to all runtime exports, especially `openapiConvertVersion`.
  - A small typed flow that asserts operation return shape (`{ data, resultData }`).

Example checks:

- calling `openapiConvertVersion` compiles
- calling `openapiSplit` compiles
- calling `openapiRename` compiles
- `readFile` and `parseFile` signatures compile

## B. Compiler config

- Add `tsconfig.types.json` (no emit, strict enough for API test):
  - `"noEmit": true`
  - `"module": "commonjs"`
  - `"target": "ES2020"`
  - include `test/types/**/*.ts`

## C. Package scripts + CI

- Add scripts:
  - `"check:types": "tsc -p tsconfig.types.json"`
  - `"check:exports": "node scripts/audit-runtime-exports.js && node scripts/audit-types-exports.js"`
- CI update:
  - run unit tests
  - run `npm run check:exports`
  - run `npm run check:types`

---

## 5) Deliverables

## Files to change

- `types/openapi-format.d.ts` (primary fix)
- `test/types/consumer.ts` (new)
- `tsconfig.types.json` (new)
- `scripts/audit-runtime-exports.js` (new)
- `scripts/audit-types-exports.js` (new)
- `package.json` (new scripts)
- CI workflow file (likely `.github/workflows/*.yml`) to run new checks
- Optional: `readme.md` small section documenting TypeScript support guarantees

## Suggested commit breakdown

1. **types:** align `.d.ts` with runtime exports (add missing APIs, normalize shared types)
2. **test(types):** add TS consumer compile test
3. **chore(ci):** add export parity audit + type check scripts to CI
4. **docs:** note TypeScript API coverage policy (optional)

## PR checklist

- [ ] Runtime export list captured and reviewed
- [ ] Declaration file exports updated to include all runtime functions
- [ ] `openapiConvertVersion` signature added and verified in consumer test
- [ ] `openapiSplit`, `openapiRename`, `readFile` signatures added and verified
- [ ] `npm run check:exports` passes
- [ ] `npm run check:types` passes
- [ ] Existing Jest test suite still passes
- [ ] CI updated to enforce both checks

## Definition of done

- [ ] TypeScript users can import and use every runtime-exported public function without declaration errors.
- [ ] `openapiConvertVersion` is present in typings and validated by compile test.
- [ ] Automated checks fail if runtime/type export surfaces drift.
- [ ] No runtime behavior changes.

---

## Quick win (fastest safe improvement)

1. Update `types/openapi-format.d.ts` to add missing exports (`openapiConvertVersion`, `openapiSplit`, `openapiRename`, `readFile`) with permissive option shapes.
2. Add a single `tsc` consumer test proving those exports compile.

## Long-term hardening (prevent drift)

1. Keep `check:exports` in CI to compare runtime vs declaration exports every PR.
2. Require declaration updates in PR template when `module.exports` changes.
3. Optionally migrate declarations to generated `.d.ts` from JSDoc+`tsc --declaration` later if maintainers want stronger single-source-of-truth typing.
