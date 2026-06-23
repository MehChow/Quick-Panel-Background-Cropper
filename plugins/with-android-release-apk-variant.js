const {
  createRunOncePlugin,
  withAppBuildGradle,
} = require("expo/config-plugins");

function escapeGroovyString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const withAndroidReleaseApkVariant = (config, options) =>
  withAppBuildGradle(config, (configMod) => {
    if (configMod.modResults.language !== "groovy") {
      throw new Error("withAndroidReleaseApkVariant only supports Groovy build.gradle");
    }

    const marker = `System.getenv("${options.envName}") == "${options.envValue}"`;
    if (configMod.modResults.contents.includes(marker)) {
      return configMod;
    }

    configMod.modResults.contents = configMod.modResults.contents.replace(
      /release\s*\{\s*([\s\S]*?)signingConfig signingConfigs\.debug\s*/m,
      (match, prefix) =>
        `release {\n${prefix}            signingConfig signingConfigs.debug\n            if (${marker}) {\n                applicationIdSuffix "${escapeGroovyString(options.applicationIdSuffix)}"\n                versionNameSuffix "${escapeGroovyString(options.versionNameSuffix)}"\n                resValue "string", "app_name", "${escapeGroovyString(options.appName)}"\n            }\n            `,
    );

    return configMod;
  });

module.exports = createRunOncePlugin(
  withAndroidReleaseApkVariant,
  "with-android-release-apk-variant",
  "1.0.0",
);
