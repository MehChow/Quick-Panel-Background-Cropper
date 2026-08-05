# Play Internal Upload Automation Design

**Date:** 2026-08-05
**Status:** Approved for implementation planning

## Purpose

Extend `npm run build-release` so the existing verified local Android App
Bundle can be uploaded directly to the Google Play Internal testing track from
either macOS or Windows.

The automated release must create the same Play release details currently
entered by hand:

- release name: `<versionCode> (<version>)`, for example
  `30000028 (1.3.1)`;
- language: `en-US`;
- release notes: the reviewed text from
  `docs/release-notes/play-en-US.txt`; and
- final generated line: `Build version: <versionCode>`.

The local build, signing, certificate verification, and Git workflow remain the
source of release safety. EAS Build and EAS Submit are not part of this design.

## Current baseline

The current `scripts/build-release.cjs` already:

- requires an interactive terminal;
- accepts only clean `release/<semver>` and `hotfix/<semver>` branches;
- distinguishes a new Play candidate from an unuploaded local retry;
- derives `expo.version` from the branch name;
- increments or retains `expo.android.versionCode`;
- runs Jest, lint, and TypeScript;
- runs Expo Android prebuild locally;
- reapplies the local Play upload-key signing configuration;
- builds `android/app/build/outputs/bundle/release/app-release.aab`;
- verifies the AAB upload-certificate SHA1; and
- reports the AAB path, size, SHA-256, version, and version code.

The command intentionally stops before Play upload. The new work starts only
after the AAB and certificate checks succeed.

## Considered approaches

### Fastlane `supply` invoked by the Node command — selected

Use the existing Node command for release rules and orchestration. Invoke a
small Fastlane Android lane only for Google Play API authentication, AAB
upload, Internal-track release creation, release name, and localized release
notes.

This keeps the current release behavior intact, uses the established Google
Play publishing tool, and works through the same `npm run build-release`
entrypoint on macOS and Windows.

### Custom Node Google Play API client — rejected

A custom client could remain entirely in JavaScript, but it would add and own
OAuth service-account handling, Android Publisher edit lifecycle management,
multipart AAB upload, track updates, retries, and ambiguous network-failure
handling. That is unnecessary maintenance for behavior already provided by
Fastlane.

### EAS Submit — rejected

EAS Submit can upload a local AAB but does not manage the required Play release
notes. The user also explicitly requires a non-EAS release workflow.

## Toolchain and platform contract

Both macOS and Windows release machines require:

- the repository's existing Node.js, npm, JDK, Android SDK, and Gradle setup;
- Ruby 3.3 or newer;
- Bundler; and
- the repository-pinned Fastlane version installed with `bundle install`.

The repository will pin Fastlane `2.237.0` in `Gemfile` and commit the generated
`Gemfile.lock`. Release commands always use `bundle exec fastlane`; they never
depend on an unpinned global Fastlane installation.

The Node command selects platform commands explicitly:

- macOS: `bundle` and `./gradlew`;
- Windows: `bundle.bat` and `gradlew.bat`.

Dynamic release values are passed to Fastlane through child-process environment
variables rather than shell-composed command strings. This avoids quoting and
injection differences between zsh and Windows PowerShell/cmd.

## Google Play identity and permissions

Fastlane authenticates with a Google Cloud service-account JSON key. This key
is not the Android upload keystore and is not `credentials.json`.

The service account receives app-level access only to
`com.meh_chow.quickpanelbackgroundcropper` with these Play Console permissions:

- View app information (read-only); and
- Release apps to testing tracks.

Do not grant production-release permission. Production promotion remains a
separate, user-controlled operation after manual QA.

Use one JSON key per physical release machine under the same service account so
one lost machine can be revoked without replacing every machine's key. Store
the key outside the repository and expose only its path through:

```text
QPBC_PLAY_SERVICE_ACCOUNT_JSON
```

Neither the key path nor its content is written into tracked project files or
printed in release output.

## Release-note source and formatting

The tracked source file is:

```text
docs/release-notes/play-en-US.txt
```

It contains only user-visible English (United States) release-note lines. It
must not contain:

- `<en-US>` or `</en-US>` tags;
- a `Build version:` line; or
- blank-only content.

The Node release helper trims the source and produces:

```text
<reviewed source text>
Build version: <versionCode>
```

The generated note must remain at or below Google Play's 500 Unicode-character
limit for one language. Fastlane supplies `en-US` structurally through its
metadata directory, so Play Console language tags are not included in the text
file.

The release name is generated, not edited:

```text
<versionCode> (<version>)
```

The command validates Play's 50-character release-name limit even though this
project's numeric code and semantic version are well below it.

## Build and upload flow

Before expensive checks or file mutation, `build-release` will:

1. validate the clean release/hotfix branch as it does today;
2. verify Ruby/Bundler dependencies with `bundle check`;
3. verify `QPBC_PLAY_SERVICE_ACCOUNT_JSON` points to a readable file;
4. read and validate `docs/release-notes/play-en-US.txt`; and
5. show the generated release name and final release notes in its summary.

After the user confirms the build, the command preserves the existing test,
prebuild, signing, Gradle, artifact, hash, and certificate workflow.

After the verified AAB exists, the command displays one final upload summary
and asks:

```text
Upload this verified AAB to Play Internal testing now? [y/N]
```

Declining leaves the verified local AAB and release metadata exactly as the
current command does. Confirming invokes the pinned Fastlane lane with:

- package: `com.meh_chow.quickpanelbackgroundcropper`;
- track: `internal`;
- release status: `completed`;
- AAB: the verified `app-release.aab`;
- release name: the generated `<versionCode> (<version>)`; and
- one `en-US` changelog containing the generated release notes.

The lane skips permanent store-listing metadata, images, screenshots, APKs,
production promotion, and tester-list changes.

## Failure and recovery behavior

Failures before the AAB build keep the current rollback behavior for
`app.json` and the Landing build flag.

Once a verified AAB exists, an upload failure must not automatically restore or
decrement release metadata. A timeout or interrupted network request can be
ambiguous: Google may have accepted the version code even if Fastlane did not
receive the final response.

On any upload failure, the command reports:

- the exact version code;
- that the code may already be consumed;
- the AAB path and SHA-256; and
- that Play Console must be checked before choosing `retry` or `new`.

The service-account key is never echoed. Temporary Fastlane metadata is created
under the operating-system temporary directory and removed after the lane
finishes.

## Git and release boundaries

Before running the command, the release-note source must be reviewed and
committed so the existing clean-worktree gate continues to pass.

After a successful build/upload, the command still does not commit, stage,
push, merge, tag, promote to Production, or clear app data. The generated
`app.json` and build-flag changes remain available for user review and commit.

Manual Samsung/device QA remains user-owned. Production promotion uses the
exact Internal-tested artifact and remains outside `build-release`.

## Test strategy

Automated tests cover:

- exact release-name generation;
- release-note trimming and build-version suffixing;
- rejection of empty notes, language tags, duplicate build-version lines, and
  notes exceeding 500 Unicode characters;
- macOS and Windows Bundler command selection;
- missing service-account environment/path errors;
- final upload confirmation behavior;
- Fastlane environment construction without credential output; and
- preserving release metadata after an upload attempt fails.

Repository verification covers:

- `bundle check`;
- Fastlane configuration parsing and lane discovery;
- focused Jest tests;
- the full Jest suite;
- Expo lint;
- TypeScript; and
- `git diff --check`.

No automated test performs a real Play upload. The first real Internal-track
upload and all device QA are performed manually by the user.

## Operational documentation

- `docs/play-upload-setup.md` is the one-time macOS/Windows installation and
  service-account guide.
- `docs/dev-release-flow.md` owns the recurring pre-build and release flow.
- `docs/how-to-build.md` continues to own Android signing and fresh-machine
  build credentials.
- `docs/superpowers/plans/2026-08-05-play-internal-upload-automation.md`
  contains the executable implementation plan.

## Primary references

- [Fastlane installation](https://docs.fastlane.tools/getting-started/ios/setup/)
- [Fastlane supply](https://docs.fastlane.tools/actions/supply/)
- [Google Play Developer API setup](https://developers.google.com/android-publisher/getting_started)
- [Play Console user permissions](https://support.google.com/googleplay/android-developer/answer/9844686)
- [Google Play release details](https://support.google.com/googleplay/android-developer/answer/9859348)
