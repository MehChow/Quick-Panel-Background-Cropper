const { spawnSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const {
  assertCleanWorktree,
  createReleaseAppJson,
  getCertificateSha1,
  getReleaseVersion,
} = require("./build-release-core.cjs");

const expectedUploadKeySha1 =
  "C8:20:EE:CB:9B:E4:A5:63:42:B8:59:12:5F:3B:81:80:69:D1:68:9B";
const helpText = `
Usage: npm run build-release

Build a signed Play AAB from release/<version> or hotfix/<version>.

Candidate choices:
  new    Increment versionCode for a new Play upload.
  retry  Keep versionCode when rebuilding a candidate that was not uploaded.

The command runs tests, lint, TypeScript, Expo prebuild, signing, and Gradle.
It leaves successful version changes uncommitted for review and does not upload,
commit, or push anything.
`.trim();

if (process.argv.includes("--help")) {
  console.log(helpText);
  process.exit(0);
}

const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const appJsonPath = path.join(rootDir, "app.json");
const buildFlagsPath = path.join(
  rootDir,
  "src",
  "features",
  "quick-panel",
  "shared",
  "buildFlags.ts",
);
const artifactPath = path.join(
  androidDir,
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab",
);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const gradleCommand =
  process.platform === "win32" ? "gradlew.bat" : "./gradlew";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    encoding: options.capture ? "utf8" : undefined,
    env: { ...process.env, ...options.env },
    shell:
      process.platform === "win32" &&
      (command.endsWith(".cmd") || command.endsWith(".bat")),
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = options.capture ? result.stderr.trim() : "";
    throw new Error(
      `${command} ${args.join(" ")} failed${detail ? `: ${detail}` : "."}`,
    );
  }

  return options.capture ? result.stdout.trim() : "";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function chooseCandidateAction(prompt) {
  while (true) {
    const answer = (
      await prompt.question(
        [
          "Choose candidate type:",
          "  1. new   - increment versionCode for a new Play upload",
          "  2. retry - keep versionCode; use only if it was not uploaded",
          "  3. cancel",
          "Selection [1]: ",
        ].join("\n"),
      )
    )
      .trim()
      .toLowerCase();

    if (!answer || ["1", "new"].includes(answer)) return "new";
    if (["2", "retry"].includes(answer)) return "retry";
    if (["3", "cancel"].includes(answer)) return null;
    console.log("Enter 1/new, 2/retry, or 3/cancel.");
  }
}

async function confirmBuild(prompt) {
  const answer = (
    await prompt.question(
      "Confirm the versionCode is higher than every uploaded Play build and continue? [y/N] ",
    )
  )
    .trim()
    .toLowerCase();
  return answer === "y" || answer === "yes";
}

function sha256(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("build-release requires an interactive terminal.");
  }

  const branch = run("git", ["branch", "--show-current"], { capture: true });
  const commit = run("git", ["rev-parse", "--short", "HEAD"], {
    capture: true,
  });
  const status = run(
    "git",
    ["status", "--porcelain", "--untracked-files=all"],
    { capture: true },
  );
  const targetVersion = getReleaseVersion(branch);
  assertCleanWorktree(status);

  const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const action = await chooseCandidateAction(prompt);
    if (!action) {
      console.log("Release build cancelled.");
      return;
    }

    const currentAppJson = readJson(appJsonPath);
    const nextAppJson = createReleaseAppJson(
      currentAppJson,
      targetVersion,
      action,
    );
    const currentVersion = currentAppJson.expo.version;
    const currentVersionCode = currentAppJson.expo.android.versionCode;
    const nextVersionCode = nextAppJson.expo.android.versionCode;
    const packageName = currentAppJson.expo.android.package;

    console.log(
      [
        "",
        "Release build summary",
        `  Branch:       ${branch}`,
        `  Base commit:  ${commit}`,
        `  Package:      ${packageName}`,
        `  Version:      ${currentVersion} -> ${targetVersion}`,
        `  Version code: ${currentVersionCode} -> ${nextVersionCode} (${action})`,
        "  Build label:  visible on Landing",
        "  Checks:       Jest, lint, TypeScript",
        "  Output:       android/app/build/outputs/bundle/release/app-release.aab",
        "",
      ].join("\n"),
    );

    if (!(await confirmBuild(prompt))) {
      console.log("Release build cancelled without changing files.");
      return;
    }

    console.log("\nRunning release checks...");
    run(npmCommand, ["test", "--", "--runInBand"]);
    run(npmCommand, ["run", "lint"]);
    run(npxCommand, ["tsc", "--noEmit"]);

    const originalAppJson = fs.readFileSync(appJsonPath, "utf8");
    const originalBuildFlags = fs.readFileSync(buildFlagsPath, "utf8");

    try {
      writeJson(appJsonPath, nextAppJson);
      fs.writeFileSync(
        buildFlagsPath,
        "export const shouldShowBuildVersion = true;\n",
      );
      run(
        npxCommand,
        ["expo", "prebuild", "--platform", "android"],
        { env: { APP_VARIANT: "release" } },
      );
      run(process.execPath, [
        "./scripts/configure-android-release-signing.cjs",
      ]);
      run(gradleCommand, ["app:bundleRelease"], {
        cwd: androidDir,
        env: { APP_VARIANT: "release" },
      });

      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Gradle completed without creating ${artifactPath}.`);
      }

      const certificateOutput = run(
        "keytool",
        ["-printcert", "-jarfile", artifactPath],
        { capture: true },
      );
      const certificateSha1 = getCertificateSha1(certificateOutput);
      if (certificateSha1 !== expectedUploadKeySha1) {
        throw new Error(
          `Unexpected AAB signing certificate SHA1: ${certificateSha1}.`,
        );
      }
    } catch (error) {
      fs.writeFileSync(appJsonPath, originalAppJson);
      fs.writeFileSync(buildFlagsPath, originalBuildFlags);
      throw error;
    }

    const artifactSize = (fs.statSync(artifactPath).size / 1024 / 1024).toFixed(
      2,
    );
    console.log(
      [
        "",
        "Release AAB ready",
        `  Branch:       ${branch}`,
        `  Base commit:  ${commit}`,
        `  Package:      ${packageName}`,
        `  Version:      ${targetVersion}`,
        `  Version code: ${nextVersionCode}`,
        `  Artifact:     ${artifactPath}`,
        `  Size:         ${artifactSize} MB`,
        `  SHA-256:      ${sha256(artifactPath)}`,
        `  Upload SHA1:  ${expectedUploadKeySha1}`,
        "",
        "Review and commit the version metadata on the release branch.",
        "Upload this exact AAB to Internal testing, then promote the same",
        "Play artifact to Production after it passes. This command does not upload.",
      ].join("\n"),
    );
  } finally {
    prompt.close();
  }
}

main().catch((error) => {
  console.error(`\nRelease build failed: ${error.message}`);
  process.exitCode = 1;
});
