const semverPattern = "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)";
const releaseBranchPattern = new RegExp(
  `^(?:release|hotfix)/(${semverPattern})$`,
);

function getReleaseVersion(branchName) {
  const match = releaseBranchPattern.exec(branchName);

  if (!match) {
    throw new Error(
      "Release builds must run from a release/* or hotfix/* semantic-version branch.",
    );
  }

  return match[1];
}

function createReleaseAppJson(appJson, targetVersion, action) {
  if (!["new", "retry"].includes(action)) {
    throw new Error("Candidate action must be new or retry.");
  }

  const currentVersionCode = appJson.expo?.android?.versionCode;

  if (!Number.isInteger(currentVersionCode) || currentVersionCode < 1) {
    throw new Error("app.json expo.android.versionCode must be a positive integer.");
  }

  const next = JSON.parse(JSON.stringify(appJson));
  next.expo.version = targetVersion;
  next.expo.android.versionCode =
    action === "new" ? currentVersionCode + 1 : currentVersionCode;
  return next;
}

function assertCleanWorktree(status) {
  if (status.trim()) {
    throw new Error(
      "Release builds require a clean worktree. Commit or stash intended changes first.",
    );
  }
}

function getCertificateSha1(keytoolOutput) {
  const match = keytoolOutput.match(/\bSHA1:\s*([0-9A-F:]+)/i);

  if (!match) {
    throw new Error("Unable to read the AAB signing certificate SHA1.");
  }

  return match[1].toUpperCase();
}

module.exports = {
  assertCleanWorktree,
  createReleaseAppJson,
  getCertificateSha1,
  getReleaseVersion,
};
