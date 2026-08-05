# Play Internal Upload Automation Implementation Plan

> **For agentic workers:** Execute inline only. This repository forbids
> sub-agents, commits, and pushes. Apply the tasks in order with a test-first
> cycle and stop before the first real Play upload; the user owns that run.

**Goal:** Extend `npm run build-release` to upload its verified local AAB to
Google Play Internal testing with the generated release name and reviewed
`en-US` release notes on both macOS and Windows.

**Architecture:** Keep release rules, prompts, checks, local Expo/Gradle build,
signing, and artifact verification in Node CommonJS. Add a repository-pinned
Fastlane lane whose only responsibility is submitting the already-verified AAB
and localized release metadata to the Internal track. Pass dynamic values by
environment variable so the same orchestration avoids shell quoting differences
on macOS and Windows.

**Tech Stack:** Node.js CommonJS, Jest, Ruby 3.3+, Bundler, Fastlane 2.237.0,
Google Play Android Publisher API, Expo SDK 56 CLI, Android Gradle.

## Global Constraints

- Do not use EAS Build, EAS Submit, EAS Workflows, or EAS version management.
- Support macOS and Windows from the existing `npm run build-release` command.
- Keep `scripts/build-release.cjs` as the only Play AAB/version-code command.
- Keep `app.json` as the source of `expo.version` and Android `versionCode`.
- Preserve `new` versus unuploaded `retry` behavior.
- Release name must be exactly `<versionCode> (<version>)`.
- Release notes come from `docs/release-notes/play-en-US.txt` and receive one
  generated `Build version: <versionCode>` line.
- Do not put `<en-US>` tags or a build-version line in the source text file.
- Keep generated release notes at or below 500 Unicode characters.
- Upload only to the `internal` track with release status `completed`.
- Do not change permanent store metadata, images, screenshots, tester lists, or
  Production.
- Never print or commit the Play service-account JSON key.
- Never commit, stage, push, merge, tag, promote, or clear app data.
- Leave the first live Play upload and all physical-device QA to the user.
- Preserve unrelated dirty work; implementation begins only from the intended
  clean working state.

---

### Task 1: Pin the cross-platform Fastlane uploader

**Files:**

- Create: `Gemfile`
- Create through Bundler: `Gemfile.lock`
- Create: `fastlane/Fastfile`

**Interfaces:**

- Consumes environment variables:
  `QPBC_PLAY_SERVICE_ACCOUNT_JSON`, `QPBC_PLAY_PACKAGE`, `QPBC_PLAY_AAB`,
  `QPBC_PLAY_RELEASE_NAME`, `QPBC_PLAY_VERSION_CODE`, and
  `QPBC_PLAY_RELEASE_NOTES`.
- Produces lane: `android upload_internal`.

- [ ] **Step 1: Add the pinned Gemfile**

Create `Gemfile` with:

```ruby
source "https://rubygems.org"

gem "fastlane", "2.237.0"
```

- [ ] **Step 2: Install and lock Fastlane**

Generate a lockfile that remains usable from macOS and current x64
RubyInstaller Windows builds, then install:

```bash
bundle lock --add-platform ruby
bundle lock --add-platform x64-mingw-ucrt
bundle install
```

Expected: `Gemfile.lock` records Fastlane `2.237.0`, includes `ruby`, the local
macOS platform, and `x64-mingw-ucrt`, and `bundle check` exits successfully. Do
not edit `Gemfile.lock` by hand.

- [ ] **Step 3: Create the narrow Android lane**

Create `fastlane/Fastfile` with one lane equivalent to:

```ruby
default_platform(:android)

platform :android do
  desc "Upload the verified QPBC AAB to Play Internal testing"
  lane :upload_internal do
    require "fileutils"
    require "tmpdir"

    json_key = ENV.fetch("QPBC_PLAY_SERVICE_ACCOUNT_JSON")
    package_name = ENV.fetch("QPBC_PLAY_PACKAGE")
    aab_path = File.expand_path(ENV.fetch("QPBC_PLAY_AAB"))
    release_name = ENV.fetch("QPBC_PLAY_RELEASE_NAME")
    version_code = Integer(ENV.fetch("QPBC_PLAY_VERSION_CODE"), 10)
    release_notes_path = File.expand_path(
      ENV.fetch("QPBC_PLAY_RELEASE_NOTES"),
    )

    UI.user_error!("Play service-account key is missing") unless File.file?(json_key)
    UI.user_error!("Verified AAB is missing") unless File.file?(aab_path)
    UI.user_error!("Generated release notes are missing") unless File.file?(release_notes_path)

    Dir.mktmpdir("qpbc-play-metadata-") do |metadata_path|
      changelog_directory = File.join(metadata_path, "en-US", "changelogs")
      FileUtils.mkdir_p(changelog_directory)
      FileUtils.cp(
        release_notes_path,
        File.join(changelog_directory, "#{version_code}.txt"),
      )

      upload_to_play_store(
        json_key: json_key,
        package_name: package_name,
        aab: aab_path,
        track: "internal",
        release_status: "completed",
        version_name: release_name,
        metadata_path: metadata_path,
        skip_upload_apk: true,
        skip_upload_metadata: true,
        skip_upload_changelogs: false,
        skip_upload_images: true,
        skip_upload_screenshots: true,
        changes_not_sent_for_review: false,
      )
    end
  end
end
```

Keep the service-account path supplied at runtime. Do not create `Appfile` with
a machine-specific path.

- [ ] **Step 4: Verify Fastlane parses without uploading**

Run:

```bash
bundle check
bundle exec fastlane lanes
```

Expected: Bundler reports all dependencies satisfied and Fastlane lists
`android upload_internal`. Do not run the upload lane yet.

### Task 2: Add pure Play release-metadata rules

**Files:**

- Modify: `scripts/build-release-core.cjs`
- Modify: `__tests__/build-release-core.test.js`

**Interfaces:**

- Produces: `getPlayReleaseName(versionCode, version)`.
- Produces: `getPlayReleaseNotes(source, versionCode)`.
- Produces: `getBundlerCommand(platform)`.
- Produces: `assertPlayUploadConfig(env, fileExists)`.

- [ ] **Step 1: Write failing release-name tests**

Add imports and assertions equivalent to:

```js
expect(getPlayReleaseName(30000028, "1.3.1")).toBe("30000028 (1.3.1)");
expect(() => getPlayReleaseName(0, "1.3.1")).toThrow("version code");
expect(() => getPlayReleaseName(30000028, "invalid")).toThrow("semantic version");
```

- [ ] **Step 2: Write failing release-note tests**

Cover exact formatting and safety:

```js
expect(
  getPlayReleaseNotes(
    "New feature: Controls + Buttons mode\nOptimization: Cache cleanup\n",
    30000028,
  ),
).toBe(
  "New feature: Controls + Buttons mode\n" +
    "Optimization: Cache cleanup\n" +
    "Build version: 30000028",
);

expect(() => getPlayReleaseNotes("   ", 30000028)).toThrow("empty");
expect(() => getPlayReleaseNotes("<en-US>\nUpdate\n</en-US>", 30000028)).toThrow(
  "language tags",
);
expect(() => getPlayReleaseNotes("Update\nBuild version: 1", 30000028)).toThrow(
  "Build version",
);
expect(() => getPlayReleaseNotes("a".repeat(500), 30000028)).toThrow(
  "500",
);
```

Count Unicode code points with `[...text].length`, after appending the build
line.

- [ ] **Step 3: Write failing platform and credential tests**

Add assertions equivalent to:

```js
expect(getBundlerCommand("darwin")).toBe("bundle");
expect(getBundlerCommand("win32")).toBe("bundle.bat");

expect(() => assertPlayUploadConfig({}, () => false)).toThrow(
  "QPBC_PLAY_SERVICE_ACCOUNT_JSON",
);
expect(() =>
  assertPlayUploadConfig(
    { QPBC_PLAY_SERVICE_ACCOUNT_JSON: "/missing/key.json" },
    () => false,
  ),
).toThrow("does not exist");
expect(() =>
  assertPlayUploadConfig(
    { QPBC_PLAY_SERVICE_ACCOUNT_JSON: "/secure/key.json" },
    () => true,
  ),
).not.toThrow();
```

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```bash
npm test -- --runInBand __tests__/build-release-core.test.js
```

Expected: the new helpers are missing.

- [ ] **Step 5: Implement the minimal pure helpers**

Implement strict validation:

- positive integer version code;
- existing semantic-version pattern;
- 50 Unicode-character release-name limit;
- trimmed, non-empty note source;
- no opening or closing locale tags;
- no line beginning with `Build version:`;
- generated build-version suffix; and
- 500 Unicode-character final-note limit.

`assertPlayUploadConfig` must report only a missing variable or missing file. It
must never parse or print service-account JSON content.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run the same focused Jest command. Expected: all tests pass.

### Task 3: Add upload preflight and final confirmation

**Files:**

- Modify: `scripts/build-release.cjs`
- Modify: `__tests__/build-release-core.test.js`

**Interfaces:**

- Consumes the pure helpers from Task 2.
- Consumes source: `docs/release-notes/play-en-US.txt`.
- Produces child-process environment consumed by Task 1.

- [ ] **Step 1: Add a failing help-contract test**

Extend the existing `--help` test to require:

```js
expect(result.stdout).toContain("Play Internal testing");
expect(result.stdout).toContain("play-en-US.txt");
expect(result.stdout).toContain("does not promote to Production");
```

- [ ] **Step 2: Extract a testable upload-environment helper**

Add a pure helper to `build-release-core.cjs`:

```js
function createPlayUploadEnvironment({
  baseEnv,
  serviceAccountPath,
  packageName,
  artifactPath,
  releaseName,
  versionCode,
  releaseNotesPath,
}) {
  return {
    ...baseEnv,
    QPBC_PLAY_SERVICE_ACCOUNT_JSON: serviceAccountPath,
    QPBC_PLAY_PACKAGE: packageName,
    QPBC_PLAY_AAB: artifactPath,
    QPBC_PLAY_RELEASE_NAME: releaseName,
    QPBC_PLAY_VERSION_CODE: String(versionCode),
    QPBC_PLAY_RELEASE_NOTES: releaseNotesPath,
  };
}
```

Test that the returned object contains the six required values and does not add
service-account JSON content.

- [ ] **Step 3: Run focused tests and verify RED**

Run the focused Jest command. Expected: help and environment assertions fail.

- [ ] **Step 4: Add early upload preflight**

In `scripts/build-release.cjs`:

1. Import `os` and the new core helpers.
2. Define `releaseNotesSourcePath` as
   `docs/release-notes/play-en-US.txt` under `rootDir`.
3. Resolve `bundle` or `bundle.bat` with `getBundlerCommand(process.platform)`.
4. After branch/worktree validation but before tests or file mutation, run
   `bundle check`.
5. Validate `QPBC_PLAY_SERVICE_ACCOUNT_JSON` and its file existence.
6. Read the source release notes.
7. Generate release name and final release notes after `nextVersionCode` is
   known.
8. Show the release name, `en-US` note body, track `internal`, and status
   `completed` in the initial summary.

Do not print the service-account path.

- [ ] **Step 5: Add the post-build upload boundary**

After artifact and certificate verification:

1. Print the existing AAB path, SHA-256, version, and version code.
2. Print the final release name and notes again.
3. Ask `Upload this verified AAB to Play Internal testing now? [y/N]`.
4. If declined, report that the AAB remains local and do not invoke Fastlane.
5. If confirmed, create a uniquely named OS temporary directory with
   `fs.mkdtempSync(path.join(os.tmpdir(), "qpbc-play-"))`.
6. Write the generated notes to a UTF-8 file inside that directory.
7. Build the Fastlane environment with `createPlayUploadEnvironment`.
8. Invoke:

```text
bundle exec fastlane android upload_internal
```

through `spawnSync` argument arrays, using `bundle.bat` on Windows.
9. Remove only the created temporary directory in `finally`.

- [ ] **Step 6: Preserve metadata after an upload attempt**

Keep the existing rollback scope around prebuild, signing, Gradle, artifact,
and certificate verification. Place the Fastlane call after that rollback
scope.

If Fastlane fails or is interrupted after upload begins, leave `app.json` and
the build flag unchanged from the successful build. Throw an error that states:

```text
Play upload did not finish cleanly for versionCode <code>. The code may already
be consumed. Check Play Console before choosing retry or new.
```

Do not automatically retry the upload.

- [ ] **Step 7: Update successful output**

On Fastlane success, report:

- `Uploaded to: Play Internal testing`;
- release name;
- `en-US` notes;
- version and version code;
- artifact path and SHA-256; and
- that Production promotion and manual QA remain separate.

- [ ] **Step 8: Run focused tests and command help**

Run:

```bash
npm test -- --runInBand __tests__/build-release-core.test.js
npm run build-release -- --help
```

Expected: tests pass and help describes the upload without making network calls.

### Task 4: Complete cross-platform operations documentation

**Files:**

- Modify: `.gitignore`
- Modify: `docs/play-upload-setup.md`
- Modify: `docs/dev-release-flow.md`
- Modify: `docs/how-to-build.md`
- Modify: `README.md`
- Preserve and use: `docs/release-notes/play-en-US.txt`

**Interfaces:**

- `docs/play-upload-setup.md` owns one-time machine and Play API setup.
- `docs/dev-release-flow.md` owns the recurring release checklist.
- `docs/how-to-build.md` owns all fresh-machine build prerequisites.

- [ ] **Step 1: Strengthen service-key ignore rules**

Keep the existing historical exact filename and add narrow defense-in-depth
patterns:

```gitignore
google-play-service-account*.json
play-service-account*.json
```

The documented key location remains outside the repository.

- [ ] **Step 2: Finalize the setup guide**

Update `docs/play-upload-setup.md` so it no longer describes Fastlane as
planned. Keep:

- Ruby 3.3+ and Bundler installation for macOS and Windows;
- `bundle install`, `bundle check`, and `bundle exec fastlane lanes`;
- Google Play Android Developer API enablement;
- app-level View app information and Release apps to testing tracks
  permissions;
- one service-account key per machine;
- `QPBC_PLAY_SERVICE_ACCOUNT_JSON` setup; and
- key validation commands for zsh and PowerShell.

- [ ] **Step 3: Switch the release flow from manual upload to automated upload**

In `docs/dev-release-flow.md`:

- remove the temporary note that upload automation is not implemented;
- keep the pre-build release-note checklist;
- state that confirmed `build-release` runs Fastlane after AAB verification;
- replace manual AAB upload steps with confirmation of the reported Internal
  upload;
- retain `new` for every replacement candidate;
- explain ambiguous upload failure and Play Console verification; and
- keep exact-artifact Production promotion after manual QA.

- [ ] **Step 4: Update fresh-machine and top-level docs**

In `docs/how-to-build.md` and `README.md`, add the setup-guide link and list Ruby,
Bundler, repository Fastlane dependencies, the Play service-account environment
variable, and the release-note source. Explicitly state that EAS is not used by
the build/upload command.

- [ ] **Step 5: Check release-note source formatting**

Confirm `docs/release-notes/play-en-US.txt`:

- is UTF-8 text;
- contains no language tags;
- contains no `Build version:` line;
- is non-empty; and
- remains within 500 characters after the generated build line.

### Task 5: Verify without performing a live upload

**Files:** all files above.

- [ ] **Step 1: Verify Ruby dependencies and Fastlane configuration**

Run:

```bash
ruby --version
bundle --version
bundle check
bundle exec fastlane lanes
```

Expected: Ruby is at least 3.3, Bundler succeeds, dependencies are satisfied,
and `android upload_internal` is listed.

- [ ] **Step 2: Validate the Play service-account connection**

On macOS/zsh:

```bash
bundle exec fastlane run validate_play_store_json_key \
  json_key:"$QPBC_PLAY_SERVICE_ACCOUNT_JSON"
```

On Windows PowerShell:

```powershell
bundle exec fastlane run validate_play_store_json_key `
  json_key:"$env:QPBC_PLAY_SERVICE_ACCOUNT_JSON"
```

Expected: Fastlane confirms the key can access Google Play. This validates
credentials only and does not upload an AAB.

- [ ] **Step 3: Run focused and full repository checks**

Run:

```bash
npm test -- --runInBand __tests__/build-release-core.test.js
npm test -- --runInBand
npm run lint
npx tsc --noEmit
git diff --check
```

Expected: all commands pass.

- [ ] **Step 4: Run non-mutating command checks**

Run:

```bash
npm run build-release -- --help
```

Expected: help describes local build, Internal upload, release-note source,
build-only decline behavior, and no Production promotion.

- [ ] **Step 5: Review security and scope**

Run:

```bash
git status --short
git diff --name-only
git diff --check
git ls-files | rg "service-account|\.jks$|credentials\.json$"
```

Expected: only intended source/docs/config files changed; no service-account
key, keystore, or credential JSON is tracked.

- [ ] **Step 6: Hand the first live run to the user**

Do not run a real `npm run build-release` upload during automated verification.
Provide the user with:

1. the setup-guide path;
2. the release-note file path;
3. the expected release-name format;
4. the exact command `npm run build-release`; and
5. the reminder that the first live Internal upload and Samsung/device QA are
   user-owned.
