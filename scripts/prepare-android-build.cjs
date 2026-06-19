const fs = require("fs");
const path = require("path");

const mode = process.argv[2];
const showVersionArg = process.argv[3];
const incrementModes = new Set(["apk-bump", "internal", "closed"]);
const supportedModes = new Set(["apk", ...incrementModes]);

if (!supportedModes.has(mode)) {
  console.error(
    "Usage: node scripts/prepare-android-build.cjs <apk|apk-bump|internal|closed> <true|false>"
  );
  process.exit(1);
}

if (!["true", "false"].includes(showVersionArg)) {
  console.error("The second argument must be 'true' or 'false'.");
  process.exit(1);
}

const rootDir = __dirname.includes(`${path.sep}scripts`)
  ? path.dirname(__dirname)
  : process.cwd();
const appJsonPath = path.join(rootDir, "app.json");
const gradlePath = path.join(rootDir, "android", "app", "build.gradle");
const buildFlagsPath = path.join(
  rootDir,
  "src",
  "features",
  "quick-panel",
  "shared",
  "buildFlags.ts"
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeBuildFlags(filePath, shouldShowBuildVersion) {
  const content = `export const shouldShowBuildVersion = ${shouldShowBuildVersion};\n`;
  fs.writeFileSync(filePath, content);
}

function readGradleVersionCode(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/versionCode\s+(\d+)/);

  if (!match) {
    throw new Error("Unable to find versionCode in android/app/build.gradle");
  }

  return {
    content,
    versionCode: Number.parseInt(match[1], 10),
  };
}

function updateGradleVersionCode(content, versionCode) {
  return content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
}

const appJson = readJson(appJsonPath);
const configVersionCode = appJson.expo?.android?.versionCode;

if (!Number.isInteger(configVersionCode) || configVersionCode < 1) {
  throw new Error("app.json expo.android.versionCode must be a positive integer");
}

const { content: gradleContent, versionCode: gradleVersionCode } =
  readGradleVersionCode(gradlePath);
const currentVersionCode = Math.max(configVersionCode, gradleVersionCode);
const nextVersionCode = incrementModes.has(mode) ? currentVersionCode + 1 : currentVersionCode;
const shouldShowBuildVersion = showVersionArg === "true";

appJson.expo.android.versionCode = nextVersionCode;
writeJson(appJsonPath, appJson);

const nextGradleContent = updateGradleVersionCode(gradleContent, nextVersionCode);
fs.writeFileSync(gradlePath, nextGradleContent);
writeBuildFlags(buildFlagsPath, shouldShowBuildVersion);

const action = incrementModes.has(mode) ? "incremented" : "kept";
console.log(
  `[prepare-android-build] ${mode} build ${action} android versionCode at ${nextVersionCode}; show version: ${shouldShowBuildVersion}.`
);
