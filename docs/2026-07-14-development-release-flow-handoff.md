# Development and Release Flow Handoff

Date: 2026-07-14

## Purpose

This document records the recommended GitHub, Play Console, and versioning
workflow for Quick Panel Background Cropper. Use it as context when setting up
future release automation, especially the planned `build-release` command.

## Current repository state

- Permanent branches: `dev` and `main`.
- `dev` is the integration branch for the next version.
- `main` represents the production source of truth.
- Feature, release, and hotfix branches are temporary.
- The first public production release is based on the version currently tested
  through Play testing.
- The current app configuration uses `app.json` for the Expo app version:
  - `expo.version`: user-visible `versionName`.
  - `expo.android.versionCode`: Android/Play internal build number.
- `npm run build-beta` currently increments `versionCode` but does not change
  `versionName`.

Always inspect `app.json`, `app.config.ts`, and the Android build scripts before
changing release automation because generated Android files are part of the
current workflow.

## Branch model

### `main`

`main` must contain only production-ready code. Tag the exact production commit
with a release tag such as `v1.0.0` or `v1.1.0`.

### `dev`

`dev` contains accepted work for the next release. It is the integration branch,
not a permanent Play testing branch.

### Temporary branches

- `feature/<short-name>`: created from `dev`, merged back into `dev` through a PR.
- `release/<semver>`: created from `dev` to freeze a release candidate for QA.
- `hotfix/<semver>`: created from `main` for urgent production fixes.

Delete temporary branches after they are merged. Do not force-push `main`, `dev`,
or any protected shared branch.

## Normal feature workflow

1. Update local `dev`:

   ```bash
   git switch dev
   git pull --ff-only origin dev
   ```

2. Create a feature branch:

   ```bash
   git switch -c feature/buttons
   ```

3. Develop and test locally.
4. Open a PR from `feature/buttons` to `dev`.
5. Merge the PR after the change is ready.
6. Delete the feature branch.

## Release candidate workflow

When the work in `dev` is ready for a release:

1. Create a release branch from `dev`:

   ```bash
   git switch dev
   git pull --ff-only origin dev
   git switch -c release/1.1.0
   ```

2. Set the intended `versionName` in `app.json` before building.
3. Build one release AAB from the release branch.
4. Upload that exact AAB to Play internal testing for QA.
5. Fix only release-blocking issues on the release branch.
6. Rebuild with a higher `versionCode` if a new AAB is required.
7. After QA passes, open a PR from `release/1.1.0` to `main`.
8. Merge the release PR into `main`.
9. Merge the release changes back into `dev` so release fixes are not lost.
10. Prefer promoting the exact tested AAB to production instead of rebuilding a
    different artifact.
11. Tag the final production commit:

    ```bash
    git switch main
    git pull --ff-only origin main
    git tag -a v1.1.0 -m "Release v1.1.0"
    git push origin v1.1.0
    ```

12. Delete the release branch.

The Git tag is a permanent label for the exact source commit used for the
release. It does not upload the app or change the code. Tag production releases
at minimum; optional release candidates may use tags such as `v1.1.0-rc.1`.

## Hotfix workflow

For an urgent production fix:

1. Create `hotfix/1.0.1` from `main`.
2. Fix and test the issue.
3. Merge the hotfix into `main`.
4. Merge the same fix into `dev`.
5. Tag the production commit, for example `v1.0.1`.

## Versioning rules

Use semantic versioning for the user-visible version:

- patch/bug fix: `1.0.0` -> `1.0.1`
- minor/feature update: `1.0.1` -> `1.1.0`
- major/breaking update: `1.1.0` -> `2.0.0`

`versionName` is stored in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0"
  }
}
```

`versionCode` is a separate positive integer used by Android and Google Play.
It must increase for every uploaded AAB and must never be reset after a value
has been uploaded to Play. The current project has used a high `versionCode`
range around `30000000`; continue incrementing from the highest uploaded value.

The first production release can remain `versionName` `1.0.0` if that is the
version already tested. Do not rebuild solely to change the name when the same
tested AAB can be promoted.

## Planned `build-release` automation

After the first production release, add a local command such as:

```bash
npm run build-release
```

The command should:

1. Read the current `versionName` from `app.json`.
2. Prompt for `patch`, `minor`, or `major`.
3. Calculate and write the next semantic version.
4. Read the current Android version code from the source/generated config.
5. Increment `versionCode` exactly once for the release candidate AAB.
6. Ask for confirmation before modifying files or building.
7. Run the Android prebuild and release-signing setup already used by this repo.
8. Build the signed AAB.
9. Print the final `versionName`, `versionCode`, branch, and artifact path.
10. Leave version changes as normal working-tree changes for review and commit;
    do not auto-commit or auto-push.

The command should not decide whether the AAB is for testing or production.
Upload the artifact to internal testing first, then promote the same artifact to
production after QA.

Before implementing it, inspect and reuse:

- `scripts/run-android-task.cjs`
- `scripts/prepare-android-build.cjs`
- `scripts/configure-android-release-signing.cjs`
- `app.json`
- `app.config.ts`
- `package.json`

Avoid making `build-beta` and `build-release` mutate the version twice. Decide
which command owns the version bump, then keep the other command read-only with
respect to version metadata.

## Manual workflow versus CI/CD

For a solo developer, a local interactive release command plus manual Play
Console upload is a reasonable first stage. CI/CD can be added later for:

- pull request linting and checks;
- building an AAB from a release tag;
- uploading to internal testing;
- requiring manual approval before production deployment.

If CI/CD is added, keep signing keys and Play service-account credentials in
GitHub Actions secrets or environment secrets. Never commit `credentials.json`,
keystores, passwords, or service-account keys to the repository.

## Important cautions

- Do not use `git pull` to reconcile a rewritten or protected release branch;
  use PRs and `git pull --ff-only` for normal branch synchronization.
- Do not force-push `main` or `dev`.
- Do not lower or reuse an Android `versionCode` that has been uploaded to Play.
- Test the exact artifact intended for production.
- Keep release-only fixes synchronized into `dev`.
- Review `git diff` after any version/build script because the current build
  process updates generated Android files and version metadata.
