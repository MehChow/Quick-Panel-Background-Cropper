# Development and Release Flow

Simple Git, Play testing, versioning guide.

## Branches

- `main`: production source. Production-ready only.
- `dev`: accepted work for next version. Keep tests green.
- `feature/<name>`: new work from `dev`. Merge back into `dev`.
- `release/<version>`: frozen candidate from `dev`. Testing and release fixes only.
- `hotfix/<version>`: urgent production fix from `main`.
- `sync/<version>-to-dev`: legacy fallback for copying a clean production tree
  into `dev` without importing secret-bearing history.

Keep only `main` and `dev` permanently. Delete merged temporary branches. Never
force-push `main` or `dev`.

## Feature work

Start from current `dev`:

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feature/buttons-followup
```

Develop. Run checks:

```bash
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```

Push branch. Open PR with `dev` as target:

```bash
git push -u origin feature/buttons-followup
```

Merge PR after checks pass. Delete feature branch locally and remotely.

## One-time history bridge after v1.2.0

PR #27 safely copied the v1.2.0 production tree into `dev`, but its squash commit
did not connect the `main` and `dev` histories. Run this repair once after this
documentation update is merged into `dev`.

Create the bridge from current `main`, then merge the clean `dev` history into
it:

```bash
git fetch origin main dev
git switch -c maintenance/connect-dev-main-history origin/main
git merge --no-ff origin/dev -m "merge: connect clean dev history to main"
git diff --check origin/main...HEAD
git log origin/main..HEAD -- credentials.json
git push -u origin maintenance/connect-dev-main-history
```

The credential-history command must print nothing. Open a PR from
`maintenance/connect-dev-main-history` to `main`. This PR carries the
documentation change and records `dev` as an ancestor of `main` without copying
the old secret into `dev`.

After it merges, verify the repair before new feature work advances `dev`:

```bash
git fetch origin main dev
git merge-base --is-ancestor origin/dev origin/main
```

Exit code `0` confirms the bridge. Delete the maintenance branch. Do not merge
the maintenance branch back into `dev`; `dev` is already its clean parent.

## Example: release v1.3.0

Complete intended v1.3.0 features through normal feature PRs into `dev`. When
`dev` is ready to freeze:

```bash
git fetch origin main dev
git switch dev
git pull --ff-only origin dev
git switch -c release/1.3.0
git push -u origin release/1.3.0
```

Build and test the candidate:

1. Complete the checklist under Before every release build below.
2. Start from a clean release branch.
3. Run `npm run build-release`.
4. Choose `new` for the first Play candidate.
5. Review the reported version, version code, AAB path, and SHA-256.
6. Accept the final upload prompt to send the verified AAB to Internal testing,
   or decline to keep it local for review.
7. After the command returns, review and commit the generated `app.json` and
   build-flag changes. `build: prepare 30000030 release candidate`
8. Fix release blockers on the release branch only.
9. Run `build-release` with `new` for every replacement AAB uploaded to Play.
10. Keep new, unrelated features on `dev` or new feature branches.

After testing passes:

1. Fetch `main` to refresh the remote reference, but do not merge it into the
   release branch.
2. Open PR from `release/1.3.0` to `main`.
3. If GitHub reports a conflict, stop and inspect the ancestry repair. Do not
   solve it by merging `main` into `release/1.3.0`, because that would import the
   old secret-bearing history.
4. Merge the release PR.
5. Promote the exact tested AAB to production. Avoid unnecessary rebuild.
6. Tag the production commit as `v1.3.0`.
7. Open a PR from the original `release/1.3.0` branch to `dev`. This brings back
   only release commits and release-only fixes; it does not contain `main`.
8. Delete the release branch locally and remotely after both PRs merge.

The important direction is:

```text
dev -> release/1.3.0 -> main
          |
          +------------> dev
```

Never use `main -> release/1.3.0`. `dev` may also advance with v1.4.0 work after
the release branch is cut; the tested release branch remains frozen except for
release fixes.

Tag production:

```bash
git switch main
git pull --ff-only origin main
git tag -a v1.3.0 -m "Release v1.3.0"
git push origin v1.3.0
```

Optional release-candidate tag: `v1.3.0-rc.1`.

Do not use `main -> release/1.3.0` or `main -> dev`. Those directions expose
`dev` to the historical `credentials.json` commit.

## Legacy clean sync fallback

Use this only before the one-time bridge is complete, or when a main-based
hotfix/legacy branch would import old secret-bearing commits into `dev`. A
normal dev-based release after the bridge should not need this fallback.

Do not mark a real secret as a false positive, rewrite a released/tagged branch,
or merge the blocked PR. Close it, then copy only the current safe production
tree into a new branch from `dev`:

```bash
git fetch origin main dev
git switch dev
git pull --ff-only origin dev
git switch -c sync/1.2.1-to-dev
git merge --squash origin/main
git status
git diff --cached --name-status
git diff --cached --check
```

Always fetch `origin/main` before the squash. A stale `origin/main` can merge old
production code and recreate already-resolved conflicts.

Confirm no credential, keystore, or service-account file is staged. Run the
full checks, commit the staged production changes, push the sync branch, and
open a PR to `dev`. Delete temporary branches after the clean PR merges.

This fallback copies tree content without importing the old secret-bearing
history. It is not the normal v1.3.0 release flow.

## Hotfix

Urgent production bug:

1. Create `hotfix/1.2.1` from `main`.
2. Fix and test.
3. Run `npm run build-release`, choose `new`, and upload the candidate to
   Internal testing.
4. Test the exact candidate and commit its reviewed release metadata.
5. Merge the hotfix into `main`.
6. Promote the tested artifact and tag the production commit `v1.2.1`.
7. Sync the final production tree into `dev` using the legacy clean fallback if
   GitGuardian blocks a direct hotfix back-merge.
8. Delete the hotfix branch.

## Version rules

`app.json` owns user-visible version:

```json
{
  "expo": {
    "version": "1.2.0"
  }
}
```

Use semantic versioning:

- bug fix: `1.2.0` to `1.2.1`
- feature update: `1.2.0` to `1.3.0`
- breaking update: `1.2.0` to `2.0.0`

`expo.android.versionCode` is Play build number. Increase for every uploaded
AAB. Never lower or reuse uploaded value. Continue from highest uploaded value;
this project uses range near `30000000`.

`npm run build-release` derives the user-visible version from the current
branch:

- `release/1.3.0` -> `1.3.0`
- `hotfix/1.2.1` -> `1.2.1`

The command never changes `package.json` version. For candidate builds:

- `new` increments `versionCode` for a new Play upload;
- `retry` keeps the current `versionCode` only when that code has not been
  uploaded to Play.

Android uses the higher `versionCode` to decide which build is newer. Never
reuse an uploaded code, even when the user-visible version remains unchanged.

## Before every release build

Complete this checklist before `npm run build-release`:

1. Review the release/hotfix branch name. It must contain the intended semantic
   version, for example `release/1.4.0` or `hotfix/1.3.2`.
2. Update `docs/release-notes/play-en-US.txt` with concise, user-visible changes
   for this candidate.
3. Keep only the English (United States) note body in that file. Do not add
   `<en-US>` tags or a `Build version:` line. The uploader supplies the locale
   and appends the current build version.
4. Keep the final notes within Google Play's 500 Unicode-character limit. Allow
   room for the generated `Build version: <versionCode>` line.
5. Review and commit the release-note update and every intended release change.
   `build-release` requires a clean worktree before it changes release metadata.
6. Confirm the production-package Firebase file, upload keystore, and the four
   user-level `MYAPP_UPLOAD_*` Gradle properties are present. See
   `docs/how-to-build.md`.
7. On a machine that will use automated Play upload, complete and validate
   `docs/play-upload-setup.md` before starting the long build.
8. Run `git status --short` and confirm it prints nothing.

The Play release name is generated as `<versionCode> (<version>)`, matching the
current console convention such as `30000028 (1.3.1)`.

After the verified AAB is built, `build-release` asks whether to invoke the
repository-pinned Fastlane lane for the `internal` track with status
`completed`. Declining leaves the verified AAB local. The lane does not change
permanent store metadata, tester lists, images, screenshots, or Production.

## Build rules

The release command is:

```bash
npm run build-release
```

It must run from a clean `release/<version>` or `hotfix/<version>` branch. It:

1. Reads the semantic version from the branch name.
2. Asks whether this is a `new` Play candidate or a local `retry`.
3. Shows branch, base commit, package, version, and version-code changes before
   writing.
4. Requires confirmation that the proposed code is higher than every uploaded
   Play build.
5. Runs Jest, lint, and TypeScript.
6. Updates `app.json` and keeps the intentional build-version label visible on
   the Landing screen.
7. Runs Expo Android prebuild with `APP_VARIANT=release`.
8. Reapplies upload-key signing and builds the release AAB.
9. Verifies the finished AAB uses the expected upload-certificate SHA1.
10. Restores `app.json` and the build flag if prebuild, signing, Gradle, or
    certificate verification fails.
11. Prints the AAB path, size, SHA-256, upload SHA1, branch, base commit,
    version, version code, generated release name, and `en-US` notes.
12. Asks before uploading the verified AAB to Play Internal testing.

The command never commits, pushes, promotes to Production, or clears app data.
Successful version changes remain uncommitted so they can be reviewed. If an
upload fails after it starts, the version code may already be consumed; check
Play Console before choosing `retry` or `new`. Generated Android files can
change during prebuild; review `git diff` after building.

`build-release` is the only Play AAB command. Do not reintroduce a second command
that also changes `versionCode`.

### Retry versus replacement

- Build failed before producing an AAB: the script restores its file changes.
  Run it again and choose `new`; the same next code will be proposed.
- Build succeeded, but the AAB was lost and its code was never uploaded: after
  committing the successful metadata, choose `retry` to reproduce that code.
- AAB was uploaded to any Play track: the code is consumed. After a fix, choose
  `new`, even though the branch remains `release/1.3.0`.

## Reusable release walkthrough

1. Merge completed features into `dev` and run the full automated checks.
2. Create `release/<version>` from the tested `dev` commit.
3. From a clean release branch, run `npm run build-release` and choose `new`.
4. Verify the proposed version code is higher than every code already uploaded
   to Play.
5. Record the AAB path and SHA-256. Review and commit the generated release
   metadata.
6. Confirm the reported Internal-track upload and retain the exact AAB path and
   SHA-256 for QA and any later Production promotion.
7. Test both an in-place production update and the reusable manual checklist in
   `docs/production-manual-test-checklist.md`.
8. For every replacement uploaded to Play, fix the release branch and run
   `build-release` with `new`.
9. Merge the passing release into `main` without merging `main` into the release
   branch, promote the exact tested artifact, and tag the production commit.
10. Merge the original release branch into `dev` to return release-only fixes.
11. Delete merged feature, release, and sync branches. Keep only `main` and
    `dev` permanently.

## Secrets and CI

Manual local build plus Play upload works for solo development. Add CI later for
PR checks, AAB builds, Play uploads, and manual production approval.

Never commit:

- `credentials.json`
- keystores
- passwords
- Play service-account keys

Store CI secrets in GitHub Actions or environment secrets.

Before committing, inspect staged filenames. Before opening a PR, inspect the
complete file and commit range that is new to its target branch:

```bash
git diff --cached --name-only
git diff --name-only origin/dev...HEAD
git log origin/dev..HEAD -- credentials.json
```

Use `origin/main` instead of `origin/dev` when the PR targets `main`. No output
from the `git log` command is expected. Deleting a secret in a later commit does
not remove it from the PR history. If a real secret was committed, rotate it
immediately and replace the secret-bearing PR history; do not bypass the
security finding.

## Safety rules

- Use `git pull --ff-only` for normal sync.
- Never force-push `main` or `dev`.
- Keep release-only fixes in `dev` too.
- Test exact artifact intended for production.
- Promote tested AAB when possible. Avoid different production rebuild.
- Review working tree after build and version commands.
- Keep only `main` and `dev` after merged temporary branches are no longer
  needed.
