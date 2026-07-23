# Development and Release Flow

Simple Git, Play testing, versioning guide.

## Branches

- `main`: production source. Production-ready only.
- `dev`: accepted work for next version. Keep tests green.
- `feature/<name>`: new work from `dev`. Merge back into `dev`.
- `release/<version>`: frozen candidate from `dev`. Testing and release fixes only.
- `hotfix/<version>`: urgent production fix from `main`.

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
git switch -c release/1.1.0
git push -u origin release/1.1.0
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

1. Open PR from `release/1.1.0` to `main`.
2. Merge release PR.
3. Promote exact tested AAB to production. Avoid unnecessary rebuild.
4. Tag production commit.
5. Merge release branch back into `dev`. This preserves release-only fixes.
6. Delete release branch locally and remotely.

Do not merge `dev` into `main` after release branch was cut. `dev` may already
contain unfinished next-version work.

Tag production commit:

```bash
git switch main
git pull --ff-only origin main
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

Optional release-candidate tag: `v1.1.0-rc.1`.

## Hotfix

Urgent production bug:

1. Create `hotfix/1.0.1` from `main`.
2. Fix and test.
3. Run `npm run build-release`, choose `new`, and upload the candidate to
   Internal testing.
4. Test the exact candidate and commit its reviewed release metadata.
5. Merge the hotfix into `main`.
6. Promote the tested artifact and tag the production commit `v1.0.1`.
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

- bug fix: `1.0.0` to `1.0.1`
- feature update: `1.0.1` to `1.1.0`
- breaking update: `1.1.0` to `2.0.0`

`expo.android.versionCode` is Play build number. Increase for every uploaded
AAB. Never lower or reuse uploaded value. Continue from highest uploaded value;
this project uses range near `30000000`.

`npm run build-release` derives the user-visible version from the current
branch:

- `release/1.1.0` -> `1.1.0`
- `hotfix/1.0.1` -> `1.0.1`

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
  `new`, even though the branch remains `release/1.1.0`.

## First v1.1.0 release walkthrough

For the current v3 release:

1. Keep `app.json` at production version `1.0.0` while feature work is on
   `feature/*` and `dev`.
2. Merge the completed v3 feature into `dev`.
3. Run the full automated checks on `dev`.
4. Create `release/1.1.0` from the tested `dev` commit.
5. Make sure the release branch is clean.
6. Run `npm run build-release`.
7. Choose `new`. Starting from production code `30000021`, the expected first
   candidate is `30000022`; verify this against Play Console before confirming.
8. Wait for the tests and AAB build to finish.
9. Record the printed AAB path and SHA-256. Review the `app.json` change to
   `1.1.0`, the new version code, and the enabled Landing build label.
10. Commit those reviewed release metadata changes on `release/1.1.0`.
11. Upload the exact AAB to Play Console -> Internal testing and start the
    rollout.
12. Opt in on the S25+ with the same Google account used by Play Store, then
    update the installed production v1.0.0 in place.
13. Run `docs/production-manual-test-checklist.md`.
14. If a blocker is found, fix and commit it on `release/1.1.0`, then run
    `build-release` with `new` to create a higher-code v1.1.0 candidate.
15. When a candidate passes, merge the release PR to `main`.
16. Promote that exact Play artifact to Production without rebuilding it, tag
    v1.1.0, then merge the release branch back into `dev`.

## Secrets and CI

Manual local build plus Play upload works for solo development. Add CI later for
PR checks, AAB builds, Play uploads, and manual production approval.

Never commit:

- `credentials.json`
- keystores
- passwords
- Play service-account keys

Store CI secrets in GitHub Actions or environment secrets.

## Safety rules

- Use `git pull --ff-only` for normal sync.
- Never force-push `main` or `dev`.
- Keep release-only fixes in `dev` too.
- Test exact artifact intended for production.
- Promote tested AAB when possible. Avoid different production rebuild.
- Review working tree after build and version commands.
