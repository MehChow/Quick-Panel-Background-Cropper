const semverPattern = "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)";
const releaseBranchPattern = new RegExp(
  `^(?:release|hotfix)/(${semverPattern})$`,
);
const semanticVersionPattern = new RegExp(`^${semverPattern}$`);

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

function assertPositiveVersionCode(versionCode) {
  if (!Number.isInteger(versionCode) || versionCode < 1) {
    throw new Error("Play version code must be a positive integer.");
  }
}

function getPlayReleaseName(versionCode, version) {
  assertPositiveVersionCode(versionCode);

  if (typeof version !== "string" || !semanticVersionPattern.test(version)) {
    throw new Error("Play release version must be a semantic version.");
  }

  const releaseName = `${versionCode} (${version})`;
  if ([...releaseName].length > 50) {
    throw new Error("Play release name must be at most 50 characters.");
  }

  return releaseName;
}

function getPlayReleaseNotes(source, versionCode) {
  assertPositiveVersionCode(versionCode);

  if (typeof source !== "string" || !source.trim()) {
    throw new Error("Play release notes source cannot be empty.");
  }

  const trimmedSource = source.trim();
  if (/<\/?[A-Za-z]{2}(?:-[A-Za-z]{2})?>/.test(trimmedSource)) {
    throw new Error("Play release notes must not contain language tags.");
  }
  if (/^\s*Build version:/m.test(trimmedSource)) {
    throw new Error("Play release notes must not contain a Build version line.");
  }

  const notes = `${trimmedSource}\nBuild version: ${versionCode}`;
  if ([...notes].length > 500) {
    throw new Error("Play release notes must be at most 500 characters.");
  }

  return notes;
}

function getBundlerCommand(platform) {
  return platform === "win32" ? "bundle.bat" : "bundle";
}

function assertPlayUploadConfig(env, fileExists) {
  const serviceAccountPath = env.QPBC_PLAY_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountPath) {
    throw new Error("QPBC_PLAY_SERVICE_ACCOUNT_JSON is required.");
  }
  if (!fileExists(serviceAccountPath)) {
    throw new Error("Play service-account file does not exist.");
  }
}

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

module.exports = {
  assertCleanWorktree,
  assertPlayUploadConfig,
  createReleaseAppJson,
  createPlayUploadEnvironment,
  getCertificateSha1,
  getBundlerCommand,
  getPlayReleaseName,
  getPlayReleaseNotes,
  getReleaseVersion,
};
