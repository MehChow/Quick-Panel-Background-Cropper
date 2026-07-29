# Development and Release Flow

Simple Git, Play testing, versioning guide.

## Branches

- `main`: production source. Production-ready only.
- `dev`: accepted work for next version. Keep tests green.
- `feature/<name>`: new work from `dev`. Merge back into `dev`.
- `release/<version>`: frozen candidate from `dev`. Testing and release fixes only.
- `hotfix/<version>`: urgent production fix from `main`.
- `sync/<version>-to-dev`: temporary fallback for copying a clean production
  tree into `dev` when historical-secret checks block the normal back-merge.

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

## Release candidate

Cut release only when intended version is complete in `dev`:

```bash
git switch dev
git pull --ff-only origin dev
git switch -c release/1.2.0
git push -u origin release/1.2.0
```

Then:

1. Start from a clean release branch.
2. Run `npm run build-release`.
3. Choose `new` for the first Play candidate.
4. Review the reported version, version code, AAB path, and SHA-256.
5. Review and commit the generated `app.json` and build-flag changes.
6. Upload the exact AAB to Internal testing.
7. Fix release blockers on the release branch only.
8. Run `build-release` with `new` for every replacement AAB uploaded to Play.
9. Keep new, unrelated features on `dev` or new feature branches.

After testing passes:

1. Open PR from `release/1.2.0` to `main`.
2. Merge release PR.
3. Promote exact tested AAB to production. Avoid unnecessary rebuild.
4. Tag production commit.
5. Merge the release branch back into `dev`. This preserves release-only fixes.
   If a historical-secret check blocks that PR, use the clean sync fallback
   below instead of bypassing the check.
6. Delete release branch locally and remotely.

Do not merge `dev` into `main` after release branch was cut. `dev` may already
contain unfinished next-version work.

Tag production commit:

```bash
git switch main
git pull --ff-only origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

Optional release-candidate tag: `v1.2.0-rc.1`.

### Clean sync fallback

Use this only when the release-to-`dev` PR is blocked because its commit range
contains an old secret-bearing commit that is already part of `main`.

Do not mark a real secret as a false positive, rewrite a released/tagged branch,
or merge the blocked PR. Close it, then copy only the current safe production
tree into a new branch from `dev`:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c sync/v1.2.0-to-dev
git merge --squash origin/main
git status
git diff --cached --name-status
git diff --cached --check
```

Confirm no credential, keystore, or service-account file is staged. Run the
full checks, commit the staged production changes, push the sync branch, and
open a PR to `dev`. Delete both temporary branches after the clean PR merges.

This fallback copies tree content without importing the old secret-bearing
history. It does not replace the normal release-to-`dev` merge.

## Hotfix

Urgent production bug:

1. Create `hotfix/1.1.1` from `main`.
2. Fix and test.
3. Run `npm run build-release`, choose `new`, and upload the candidate to
   Internal testing.
4. Test the exact candidate and commit its reviewed release metadata.
5. Merge the hotfix into `main`.
6. Promote the tested artifact and tag the production commit `v1.1.1`.
7. Merge the hotfix back into `dev`.
8. Delete the hotfix branch.

## Version rules

`app.json` owns user-visible version:

```json
{
  "expo": {
    "version": "1.1.0"
  }
}
```

Use semantic versioning:

- bug fix: `1.1.0` to `1.1.1`
- feature update: `1.1.0` to `1.2.0`
- breaking update: `1.1.0` to `2.0.0`

`expo.android.versionCode` is Play build number. Increase for every uploaded
AAB. Never lower or reuse uploaded value. Continue from highest uploaded value;
this project uses range near `30000000`.

`npm run build-release` derives the user-visible version from the current
branch:

- `release/1.2.0` -> `1.2.0`
- `hotfix/1.1.1` -> `1.1.1`

The command never changes `package.json` version. For candidate builds:

- `new` increments `versionCode` for a new Play upload;
- `retry` keeps the current `versionCode` only when that code has not been
  uploaded to Play.

Android uses the higher `versionCode` to decide which build is newer. Never
reuse an uploaded code, even when the user-visible version remains unchanged.

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
    version, and version code. The base commit is the clean commit from which
    the script applies the displayed, uncommitted release metadata.

The command never commits, pushes, uploads, or clears app data. Successful
version changes remain uncommitted so they can be reviewed. Generated Android
files can change during prebuild; review `git diff` after building.

`build-release` is the only Play AAB command. Do not reintroduce a second command
that also changes `versionCode`.

### Retry versus replacement

- Build failed before producing an AAB: the script restores its file changes.
  Run it again and choose `new`; the same next code will be proposed.
- Build succeeded, but the AAB was lost and its code was never uploaded: after
  committing the successful metadata, choose `retry` to reproduce that code.
- AAB was uploaded to any Play track: the code is consumed. After a fix, choose
  `new`, even though the branch remains `release/1.2.0`.

## Reusable release walkthrough

1. Merge completed features into `dev` and run the full automated checks.
2. Create `release/<version>` from the tested `dev` commit.
3. From a clean release branch, run `npm run build-release` and choose `new`.
4. Verify the proposed version code is higher than every code already uploaded
   to Play.
5. Record the AAB path and SHA-256. Review and commit the generated release
   metadata.
6. Upload that exact AAB to Internal testing.
7. Test both an in-place production update and the reusable manual checklist in
   `docs/production-manual-test-checklist.md`.
8. For every replacement uploaded to Play, fix the release branch and run
   `build-release` with `new`.
9. Merge the passing release into `main`, promote the exact tested artifact,
   and tag the production commit.
10. Back-merge release fixes into `dev`, using the clean sync fallback only if a
    historical-secret check blocks the normal PR.
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
