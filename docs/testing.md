# Expo Test Setup Guide

Use this as a handoff doc for another Expo project's agent. It describes a small Jest setup that matches how this repo handles tests, without pulling in unnecessary test infrastructure.

## Goal

Set up lightweight automated tests for an Expo app with:

- Jest as the test runner
- `jest-expo` as the Expo preset
- `@testing-library/react-native` for rendered UI tests
- targeted module mocks for Expo and native dependencies
- a single shared Jest setup file

This setup is meant for logic tests, state tests, service tests, and focused screen regression tests. It is not meant for emulator or end-to-end coverage.

## Dependencies

Add these dev dependencies:

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^13.3.3",
    "@types/jest": "29.5.14",
    "jest": "~29.7.0",
    "jest-expo": "~56.0.4",
    "react-test-renderer": "19.2.3"
  }
}
```

Keep the versions aligned with the target Expo SDK and React version. If the target repo uses Expo 56, use the Expo-56-compatible `jest-expo` line.

## Package Scripts

Add these scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

Typical commands:

```bash
npm test
npm test -- --runInBand
npm run test:watch
```

Use `npm test` for normal runs.

Use `npm test -- --runInBand` for the most stable local verification and before closing out refactors.

Use `npm run test:watch` while iterating on one area.

## Jest Config

Put the Jest config in `package.json` or `jest.config.js`. A minimal `package.json` form looks like this:

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": [
      "<rootDir>/jest.setup.ts"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

If the repo already uses the `@/` alias in TypeScript or Metro, mirror that alias in Jest. If not, remove the alias mapping and use whatever import strategy the project already uses.

## Shared Setup File

Create `jest.setup.ts` at the repo root.

Keep it small. It should only contain shared test environment wiring that multiple tests need.

Typical contents:

```ts
import "react-native-gesture-handler/jestSetup";

process.env.EXPO_OS = "web";

Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: jest.fn(),
  writable: true,
});

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

Only add more shared mocks when they are broadly useful across the suite.

Good candidates for shared mocks:

- localization defaults
- simple storage shims
- global browser or fetch shims
- reanimated baseline mocking

Bad candidates for shared mocks:

- one-off screen dependencies
- heavy dialog or sheet components
- feature-specific hook stubs

Those should stay local to the test file that needs them.

## Directory Layout

Use one top-level `__tests__/` directory at the repo root:

```text
project/
  __tests__/
    feature-a-state.test.ts
    feature-a-service.test.ts
    feature-a-screen.test.tsx
  src/
  jest.setup.ts
  package.json
```

This keeps all tests easy to find and avoids mixing production files with test files.

If a repo already uses colocated tests and the team prefers that, keep the existing convention. Do not introduce two test layout styles in the same repo.

## File Naming

Use:

- `*.test.ts` for pure logic, state, and service tests
- `*.test.tsx` for rendered components or screens

Name files after the unit under test, not after the test style.

Good:

- `auth-store.test.ts`
- `export-files.test.ts`
- `settings-screen.test.tsx`

Bad:

- `unit1.test.ts`
- `screen-test.test.tsx`

## Test Structure

Keep tests narrow. Prefer one of these shapes:

- pure function tests
- store transition tests
- persistence restore/save tests
- service tests with mocked native modules
- screen-shell regression tests

For screen tests, do not try to render the whole app tree unless that is the exact thing under test. Mock heavy leaf dependencies and assert the visible contract.

That usually means:

- mock child dialogs, sheets, previews, and other heavy visual leaves
- mock feature hooks when the screen contract matters more than hook internals
- assert the text, test IDs, and visible state that the screen is responsible for

This keeps the suite fast and avoids fragile failures from unrelated native wiring.

## Mocking Rules

Use shared setup only for cross-cutting environment needs.

Use local `jest.mock(...)` inside a test file for:

- feature hooks
- one-off Expo modules
- heavy UI leaves
- native branches that only one test cares about

If a component import drags in Reanimated, worklets, bottom sheets, or other native-heavy behavior and the test only cares about screen layout or copy, mock that leaf component locally instead of expanding the global Jest setup.

## What To Cover First

For a new Expo app, start with the tests that usually pay off fastest:

- store and reducer transitions
- persistence load/save behavior
- service functions with permission or failure branches
- critical fallback UI states

Leave these for manual testing unless the project explicitly needs more:

- gesture feel
- animation polish
- real device layout quirks
- full native integration flows

## Minimal Agent Checklist

When handing this to another project's agent, ask it to:

1. Add the Jest-related dev dependencies.
2. Add `test` and `test:watch` scripts.
3. Add a Jest config using `jest-expo`.
4. Create `jest.setup.ts` with only shared environment mocks.
5. Create a root `__tests__/` directory.
6. Add one `*.test.ts` logic test and one `*.test.tsx` screen test as proof the setup works.
7. Run `npm test -- --runInBand`.

## Non-Goals

Skip these unless the target project actually needs them:

- snapshot testing by default
- end-to-end tooling
- global mocks for every feature
- emulator/device test automation
- coverage thresholds before the suite has useful tests
