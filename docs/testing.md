# Testing

Use the installed package versions in package.json and package-lock.json.
The project uses Jest, jest-expo for SDK 57, React Native Testing Library,
and jest.setup.ts for shared native/environment mocks.

## Routine checks

Run from the repository root:

```sh
npm run verify
```

`verify` runs `test:ci` (Jest in one process), `typecheck`, `lint` and
`git diff --check`, stopping on failure. For focused work, pass relevant test
paths to `npm test -- --runInBand`. The individual type/lint commands are
`npm run typecheck` and `npm run lint`.
Run the full suite after shared rendering, storage, localization, or broad
cleanup changes. Do not install an older jest-expo from historical examples.

[Verify CI](../.github/workflows/verify.yml) runs on pushes and pull requests
with Node 24 on Ubuntu, installs the lockfile with `npm ci`, then runs
`npm run verify`. Hosted CI status is separate from a local passing run. This
workflow covers JavaScript checks; native builds, device acceptance and signed
release/upload validation follow their existing guides.

## Test boundaries

- Focused model, persistence, image-import and export lifecycle tests live in
  `src/features/quick-panel/model/__tests__`, `store/__tests__`,
  `image-import/__tests__` and `customize/hooks/__tests__` respectively (the
  last three paths are relative to `src/features/quick-panel`).
- Root `__tests__` retains screen/controller integration, cross-workflow,
  geometry, cache, export surface, wrapper navigation and locale tests.
- AniUI component tests live in src/components/ani-ui/__tests__.
- `__tests__/eslint-boundaries.test.ts` exercises permitted and forbidden
  imports with real ESLint resolution. Keep it aligned with `eslint.config.js`.
- Keep shared setup limited to genuinely shared mocks; mock heavy leaves locally
  when testing a screen/controller contract.
- Preserve compatibility, geometry, image ownership, stale callback, export
  readiness and all-or-nothing capture tests through a visual redesign.
- Update UI structure/style assertions when approved designs replace them.
  Keep the behavior and accessibility assertions they protect.
- Locale checks should validate the active announcement and all three languages,
  not freeze obsolete release text. Dynamic translation keys need explicit care.

The [task map](task-map.md) points to representative tests for each owner.
Use lifecycle tests for readiness, stale callbacks and cleanup; wrapper tests
also cover successful state updates and Result navigation. Both boundaries
remain necessary when changing export integration.

Jest mocks do not prove native rendering, permissions, gesture feel or output
inside QuickStar. Use [manual acceptance](production-manual-test-checklist.md)
for device checks. Native/config/dependency changes also need an appropriate
Android build; release validation uses the exact signed artifact.
