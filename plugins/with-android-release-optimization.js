const {
  createRunOncePlugin,
  withAppBuildGradle,
} = require("expo/config-plugins");

const withAndroidReleaseOptimization = (config) =>
  withAppBuildGradle(config, (configMod) => {
    if (configMod.modResults.language !== "groovy") {
      throw new Error("Release optimization requires a Groovy app build.gradle");
    }

    // The non-optimizing default includes -dontoptimize, even with R8 enabled.
    const defaultRules = /getDefaultProguardFile\(\s*(["'])proguard-android(?:-optimize)?\.txt\1\s*\)/g;
    const contents = configMod.modResults.contents;
    if (!defaultRules.test(contents)) {
      throw new Error(
        "Cannot find Android default ProGuard rules; review the Expo template before releasing.",
      );
    }

    configMod.modResults.contents = contents.replace(
      defaultRules,
      'getDefaultProguardFile("proguard-android-optimize.txt")',
    );
    return configMod;
  });

module.exports = createRunOncePlugin(
  withAndroidReleaseOptimization,
  "with-android-release-optimization",
  "1.0.0",
);
