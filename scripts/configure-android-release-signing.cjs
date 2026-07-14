const fs = require("fs");
const os = require("os");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const gradlePath = path.join(rootDir, "android", "app", "build.gradle");
const gradlePropertiesPaths = [
  path.join(rootDir, "android", "gradle.properties"),
  path.join(os.homedir(), ".gradle", "gradle.properties"),
];

const requiredKeys = [
  "MYAPP_UPLOAD_STORE_FILE",
  "MYAPP_UPLOAD_KEY_ALIAS",
  "MYAPP_UPLOAD_STORE_PASSWORD",
  "MYAPP_UPLOAD_KEY_PASSWORD",
];

const releaseSigningConfig = `        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }`;

function readProperties(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((props, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return props;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return props;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      props[key] = value;
      return props;
    }, {});
}

function hasSigningConfig() {
  const mergedProps = gradlePropertiesPaths.reduce(
    (props, filePath) => ({ ...props, ...readProperties(filePath) }),
    {},
  );

  return requiredKeys.every(
    (key) => process.env[key]?.trim() || mergedProps[key]?.trim(),
  );
}

function configureGradle() {
  if (!fs.existsSync(gradlePath)) {
    throw new Error(`Missing ${gradlePath}. Run expo prebuild first.`);
  }

  const current = fs.readFileSync(gradlePath, "utf8");
  const withReleaseConfig = current.includes("storeFile file(MYAPP_UPLOAD_STORE_FILE)")
    ? current
    : current.replace(
        /signingConfigs \{\n/,
        `signingConfigs {\n${releaseSigningConfig}\n`,
      );

  const normalizedDebugSigning = withReleaseConfig.replace(
    /(\n\s*buildTypes \{\n\s*debug \{\n)\s*signingConfig\s+signingConfigs\.(?:debug|release)/,
    "$1            signingConfig signingConfigs.debug",
  );

  const releaseSigningPattern =
    /(\n\s*buildTypes \{[\s\S]*?\n\s*release \{\n[\s\S]*?)signingConfig\s+signingConfigs\.debug/;
  const next = normalizedDebugSigning.replace(
    releaseSigningPattern,
    "$1signingConfig signingConfigs.release",
  );

  if (
    next === normalizedDebugSigning &&
    !normalizedDebugSigning.includes("signingConfig signingConfigs.release")
  ) {
    throw new Error("Unexpected release signing config.");
  }

  if (next === current) {
    return;
  }

  fs.writeFileSync(gradlePath, next);
}

if (!hasSigningConfig()) {
  console.error(
    [
      "Missing Android upload-key config.",
      "Set MYAPP_UPLOAD_STORE_FILE, MYAPP_UPLOAD_KEY_ALIAS,",
      "MYAPP_UPLOAD_STORE_PASSWORD, and MYAPP_UPLOAD_KEY_PASSWORD",
      "in android/gradle.properties, ~/.gradle/gradle.properties, or env.",
    ].join(" "),
  );
  process.exit(1);
}

configureGradle();
