const { spawnSync } = require("child_process");
const path = require("path");
const {
  assertCleanWorktree,
  createReleaseAppJson,
  getCertificateSha1,
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
    expect(result.stdout).toContain("does not upload");
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
