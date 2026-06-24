const {
  createRunOncePlugin,
  withAppBuildGradle,
} = require("expo/config-plugins");

function escapeGroovyString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

const withAndroidDebugDevVariant = (config, options) =>
  withAppBuildGradle(config, (configMod) => {
    if (configMod.modResults.language !== "groovy") {
      throw new Error("withAndroidDebugDevVariant only supports Groovy build.gradle");
    }

    const marker = `System.getenv("${options.envName}") == "${options.envValue}"`;
    if (configMod.modResults.contents.includes(marker)) {
      return configMod;
    }

    const debugBlock = [
      "debug {",
      "            signingConfig signingConfigs.debug",
      `            if (${marker}) {`,
      `                applicationIdSuffix "${escapeGroovyString(options.applicationIdSuffix)}"`,
      `                versionNameSuffix "${escapeGroovyString(options.versionNameSuffix)}"`,
      `                resValue "string", "app_name", "${escapeGroovyString(options.appName)}"`,
      "            }",
      "        }",
    ].join("\n");

    configMod.modResults.contents = configMod.modResults.contents.replace(
      /debug\s*\{\s*signingConfig signingConfigs\.debug\s*\}/,
      debugBlock,
    );

    return configMod;
  });

module.exports = createRunOncePlugin(
  withAndroidDebugDevVariant,
  "with-android-debug-dev-variant",
  "1.0.0",
);
