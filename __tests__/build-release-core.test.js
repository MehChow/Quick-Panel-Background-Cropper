const { spawnSync } = require("child_process");
const path = require("path");
const {
  assertCleanWorktree,
  assertPlayUploadConfig,
  createReleaseAppJson,
  createPlayUploadEnvironment,
  getCertificateSha1,
  getBundlerCommand,
  getPlayReleaseName,
  getPlayReleaseNotes,
  getReleaseVersion,
} = require("../scripts/build-release-core.cjs");

const appJson = {
  expo: {
    android: { versionCode: 30000021 },
    version: "1.0.0",
  },
};

describe("build-release metadata", () => {
  test("derives the release version from release and hotfix branches", () => {
    expect(getReleaseVersion("release/1.1.0")).toBe("1.1.0");
    expect(getReleaseVersion("hotfix/1.0.1")).toBe("1.0.1");
  });

  test("rejects branches that cannot produce a release artifact", () => {
    expect(() => getReleaseVersion("feature/v3/buttons")).toThrow(
      "release/* or hotfix/*",
    );
  });

  test("increments versionCode for a new Play candidate", () => {
    const result = createReleaseAppJson(appJson, "1.1.0", "new");

    expect(result.expo.version).toBe("1.1.0");
    expect(result.expo.android.versionCode).toBe(30000022);
    expect(appJson.expo.version).toBe("1.0.0");
    expect(appJson.expo.android.versionCode).toBe(30000021);
  });

  test("keeps versionCode when retrying an unuploaded candidate", () => {
    const result = createReleaseAppJson(appJson, "1.1.0", "retry");

    expect(result.expo.version).toBe("1.1.0");
    expect(result.expo.android.versionCode).toBe(30000021);
  });

  test("rejects invalid candidate actions and version codes", () => {
    expect(() => createReleaseAppJson(appJson, "1.1.0", "invalid")).toThrow(
      "new or retry",
    );
    expect(() =>
      createReleaseAppJson(
        { expo: { android: { versionCode: 0 }, version: "1.0.0" } },
        "1.1.0",
        "new",
      ),
    ).toThrow("positive integer");
  });

  test("requires a clean worktree", () => {
    expect(() => assertCleanWorktree("")).not.toThrow();
    expect(() => assertCleanWorktree(" M app.json")).toThrow("clean worktree");
  });

  test("reads and validates the AAB signing certificate SHA1", () => {
    const output =
      "Certificate fingerprints:\n\t SHA1: C8:20:EE:CB:9B:E4:A5:63";

    expect(getCertificateSha1(output)).toBe("C8:20:EE:CB:9B:E4:A5:63");
    expect(() => getCertificateSha1("Certificate fingerprints: none")).toThrow(
      "SHA1",
    );
  });

  test("generates the Play release name", () => {
    expect(getPlayReleaseName(30000028, "1.3.1")).toBe("30000028 (1.3.1)");
    expect(() => getPlayReleaseName(0, "1.3.1")).toThrow("version code");
    expect(() => getPlayReleaseName(30000028, "invalid")).toThrow(
      "semantic version",
    );
  });

  test("generates bounded Play release notes", () => {
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
    expect(() =>
      getPlayReleaseNotes("<en-US>\nUpdate\n</en-US>", 30000028),
    ).toThrow("language tags");
    expect(() =>
      getPlayReleaseNotes("Update\nBuild version: 1", 30000028),
    ).toThrow("Build version");
    expect(() => getPlayReleaseNotes("a".repeat(500), 30000028)).toThrow(
      "500",
    );
  });

  test("selects the platform Bundler command", () => {
    expect(getBundlerCommand("darwin")).toBe("bundle");
    expect(getBundlerCommand("win32")).toBe("bundle.bat");
  });

  test("validates the Play service-account path without reading its contents", () => {
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
  });

  test("builds the Fastlane environment without credential contents", () => {
    const environment = createPlayUploadEnvironment({
      baseEnv: { KEEP_ME: "yes" },
      serviceAccountPath: "/secure/key.json",
      packageName: "com.meh_chow.quickpanelbackgroundcropper",
      artifactPath: "/tmp/app-release.aab",
      releaseName: "30000028 (1.3.1)",
      versionCode: 30000028,
      releaseNotesPath: "/tmp/release-notes.txt",
    });

    expect(environment).toEqual({
      KEEP_ME: "yes",
      QPBC_PLAY_SERVICE_ACCOUNT_JSON: "/secure/key.json",
      QPBC_PLAY_PACKAGE: "com.meh_chow.quickpanelbackgroundcropper",
      QPBC_PLAY_AAB: "/tmp/app-release.aab",
      QPBC_PLAY_RELEASE_NAME: "30000028 (1.3.1)",
      QPBC_PLAY_VERSION_CODE: "30000028",
      QPBC_PLAY_RELEASE_NOTES: "/tmp/release-notes.txt",
    });
    expect(environment).not.toHaveProperty("QPBC_PLAY_SERVICE_ACCOUNT_JSON_CONTENT");
  });
});

describe("build-release command", () => {
  test("documents its safe candidate workflow", () => {
    const result = spawnSync(
      process.execPath,
      [path.join(process.cwd(), "scripts", "build-release.cjs"), "--help"],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("release/<version>");
    expect(result.stdout).toContain("new");
    expect(result.stdout).toContain("retry");
    expect(result.stdout).toContain("Play Internal testing");
    expect(result.stdout).toContain("play-en-US.txt");
    expect(result.stdout).toContain("does not promote to Production");
  });

  test("removes the legacy beta preparation mode", () => {
    const result = spawnSync(
      process.execPath,
      [
        path.join(process.cwd(), "scripts", "prepare-android-build.cjs"),
        "beta",
        "true",
      ],
      { encoding: "utf8" },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "Usage: node scripts/prepare-android-build.cjs apk",
    );
  });
});
