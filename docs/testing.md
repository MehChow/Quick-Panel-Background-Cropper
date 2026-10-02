# Testing

Use the installed package versions in package.json and package-lock.json.
The project uses Jest, jest-expo for SDK 57, React Native Testing Library,
and jest.setup.ts for shared native/environment mocks.

## Routine checks

Run from the repository root:

```sh
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git diff --check
```

For focused work, pass the relevant test paths to npm test -- --runInBand.
Run the full suite after shared rendering, storage, localization, or broad
cleanup changes. Do not install an older jest-expo from historical examples.

## Test boundaries

- Root __tests__ contains feature, store, geometry, import, export and locale tests.
- AniUI component tests live in src/components/ani-ui/__tests__.
- Keep shared setup limited to genuinely shared mocks; mock heavy leaves locally
  when testing a screen/controller contract.
- Preserve compatibility, geometry, image ownership, stale callback, export
  readiness and all-or-nothing capture tests through a visual redesign.
- Update UI structure/style assertions when approved designs replace them.
  Keep the behavior and accessibility assertions they protect.
- Locale checks should validate the active announcement and all three languages,
  not freeze obsolete release text. Dynamic translation keys need explicit care.

Jest mocks do not prove native rendering, permissions, gesture feel or output
inside QuickStar. Use [manual acceptance](production-manual-test-checklist.md)
for device checks. Native/config/dependency changes also need an appropriate
Android build; release validation uses the exact signed artifact.
