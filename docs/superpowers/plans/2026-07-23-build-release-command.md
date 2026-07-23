# Build Release Command Implementation Plan

> **For agentic workers:** Execute inline only. This repository forbids
> sub-agents, commits, and pushes.

**Goal:** Replace the public `build-beta` workflow with a safe, interactive
`npm run build-release` command for Play testing and production promotion.

**Architecture:** A small pure CommonJS module owns release-branch/version
validation and app-config updates. A separate CommonJS command handles prompts,
verification commands, Expo prebuild, signing, Gradle bundling, rollback on
failure, and artifact reporting. Existing APK and development workflows remain
unchanged.

**Tech Stack:** Node.js CommonJS, Jest, Expo SDK 56 CLI, Android Gradle, Google
Play Android App Bundles.

## Global Constraints

- Run only on `release/<semver>` or `hotfix/<semver>`.
- `app.json` remains the source of `expo.version` and Android `versionCode`.
- A new Play candidate increments `versionCode`; a local retry keeps it.
- Preserve the intentional landing-page build-version display.
- Test the exact internal-track AAB and promote that artifact to Production.
- Never commit, push, upload, or clear app data automatically.
- Preserve the user's current uncommitted `app.json` downgrade.

---

### Task 1: Release metadata rules

**Files:**
- Create: `scripts/build-release-core.cjs`
- Create: `__tests__/build-release-core.test.js`

**Interfaces:**
- Produces: `getReleaseVersion(branchName)`
- Produces: `createReleaseAppJson(appJson, targetVersion, action)`
- Produces: `assertCleanWorktree(status)`

- [x] **Step 1: Write failing tests**

Cover:

```js
expect(getReleaseVersion("release/1.1.0")).toBe("1.1.0");
expect(getReleaseVersion("hotfix/1.0.1")).toBe("1.0.1");
expect(() => getReleaseVersion("feature/v3")).toThrow("release/* or hotfix/*");

expect(
  createReleaseAppJson(appJson, "1.1.0", "new").expo.android.versionCode,
).toBe(30000022);
expect(
  createReleaseAppJson(appJson, "1.1.0", "retry").expo.android.versionCode,
).toBe(30000021);
expect(createReleaseAppJson(appJson, "1.1.0", "new").expo.version).toBe(
  "1.1.0",
);
```

- [x] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/build-release-core.test.js
```

Expected: fail because `scripts/build-release-core.cjs` does not exist.

- [x] **Step 3: Implement the pure rules**

Use strict semantic versions, require a positive integer version code, clone the
input JSON, and reject non-empty worktree status.

- [x] **Step 4: Run the focused test and verify GREEN**

Run the same Jest command. Expected: all focused tests pass.

### Task 2: Interactive release build orchestration

**Files:**
- Create: `scripts/build-release.cjs`
- Modify: `package.json`
- Modify: `scripts/run-android-task.cjs`
- Modify: `app.config.ts`

**Interfaces:**
- Consumes: core helpers from Task 1.
- Produces: `npm run build-release`.

- [x] **Step 1: Add a failing command-contract test**

Extend the focused test to run:

```js
spawnSync(process.execPath, ["scripts/build-release.cjs", "--help"]);
```

Assert exit `0` and output describing `new`, `retry`, release branches, and no
automatic upload.

- [x] **Step 2: Verify RED**

Expected: failure because `scripts/build-release.cjs` does not exist.

- [x] **Step 3: Implement the command**

The command must:

1. Support `--help`.
2. Require a clean `release/<semver>` or `hotfix/<semver>` branch.
3. Ask for `new`, `retry`, or cancel.
4. Show branch, commit, package, current/target version, current/target
   versionCode, and commands before mutation.
5. Run Jest, lint, and TypeScript.
6. Update `app.json` and set `shouldShowBuildVersion = true`.
7. Run Expo Android prebuild with `APP_VARIANT=release`.
8. Reapply release signing and run `app:bundleRelease`.
9. Restore `app.json` and `buildFlags.ts` if any build step fails.
10. Print AAB path, size, SHA-256, branch, commit, version, and versionCode.

- [x] **Step 4: Wire the public command**

Replace `build-beta` with:

```json
"build-release": "node ./scripts/build-release.cjs"
```

Remove the unused beta task from `run-android-task.cjs`. Rename the Firebase
constant in `app.config.ts` from beta terminology to release terminology while
keeping `google-services-open.json`.

- [x] **Step 5: Run focused tests**

Expected: release metadata and `--help` contract pass.

### Task 3: Release documentation

**Files:**
- Modify: `docs/dev-release-flow.md`
- Modify: `docs/how-to-build.md`
- Modify: `README.md`

- [x] **Step 1: Rewrite the release-candidate flow**

Document that the branch name owns the semantic target, `new` increments
`versionCode`, `retry` keeps it, the landing build label is intentional, and
the exact internal-track AAB is promoted.

- [x] **Step 2: Rewrite build setup references**

Replace public `build-beta` references with `build-release`, use
`APP_VARIANT=release`, and retain current signing/Firebase requirements.

- [x] **Step 3: Add the beginner v1.1.0 walkthrough**

Explain how to merge the feature to `dev`, create `release/1.1.0`, run the
command with `new`, review/commit the generated metadata, upload to Internal
testing, test the v1.0.0 update, fix/rebuild with a new candidate code, and
promote the exact tested AAB.

### Task 4: Verification

**Files:** all files above.

- [x] **Step 1: Run focused tests**

```bash
npm test -- --runInBand __tests__/build-release-core.test.js
```

- [x] **Step 2: Run full checks**

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

- [x] **Step 3: Run non-mutating command checks**

```bash
npm run build-release -- --help
```

Confirm the help output is accurate. Do not execute a real AAB build because it
would intentionally mutate version metadata, run Gradle, and consume user time;
the user will perform the documented first real run on `release/1.1.0`.
