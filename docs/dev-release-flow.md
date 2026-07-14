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

1. Set `expo.version` in `app.json`.
2. Build AAB from release branch with `npm run build-beta`.
3. Upload exact AAB to Play testing.
4. Fix release blockers on release branch only.
5. Use higher `versionCode` for every replacement AAB.
6. Keep new, unrelated features on `dev` or new feature branches.

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
3. Merge into `main`.
4. Merge same fix into `dev`.
5. Tag production commit `v1.0.1`.
6. Delete hotfix branch.

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

`npm run build-beta` currently increments `versionCode`. It does not change
`expo.version`.

## Build rules

Before changing release automation, inspect:

- `app.json`
- `app.config.ts`
- `package.json`
- `scripts/run-android-task.cjs`
- `scripts/prepare-android-build.cjs`
- `scripts/configure-android-release-signing.cjs`

Generated Android files can change during prebuild. Review `git diff` after
version or build commands.

Future `npm run build-release` should:

1. Prompt for `patch`, `minor`, or `major`.
2. Update `expo.version`.
3. Increment `versionCode` once.
4. Ask before changing files or building.
5. Run existing Android prebuild and signing setup.
6. Build signed AAB.
7. Print version, version code, branch, artifact path.
8. Leave changes uncommitted for review. Never auto-commit or auto-push.

Avoid double version bumps between `build-release` and `build-beta`. One command
must own each version change.

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
