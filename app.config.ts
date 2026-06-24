import type { ConfigContext, ExpoConfig } from "expo/config";
const withAndroidDebugDevVariant = require("./plugins/with-android-debug-dev-variant");
const withAndroidReleaseApkVariant = require("./plugins/with-android-release-apk-variant");

const appJson = require("./app.json") as { expo: ExpoConfig };

const DEV_APP_VARIANT = "dev";
const DEV_APP_NAME = "QPBC dev";
const DEV_APP_SCHEME = "quickpanelbackgroundcropper-dev";
const APK_APP_VARIANT = "apk";

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig = {
    ...appJson.expo,
    ...config,
    android: {
      ...appJson.expo.android,
      ...config.android,
    },
  } satisfies ExpoConfig;
  const isDevVariant = process.env.APP_VARIANT === DEV_APP_VARIANT;
  const expoConfig: ExpoConfig = {
    ...baseConfig,
    name: isDevVariant ? DEV_APP_NAME : baseConfig.name,
    scheme: isDevVariant ? DEV_APP_SCHEME : baseConfig.scheme,
  };

  const withDevVariant = withAndroidDebugDevVariant(expoConfig, {
    appName: DEV_APP_NAME,
    applicationIdSuffix: ".dev",
    envName: "APP_VARIANT",
    envValue: DEV_APP_VARIANT,
    versionNameSuffix: "-dev",
  });

  return withAndroidReleaseApkVariant(withDevVariant, {
    appName: "QPBC apk",
    applicationIdSuffix: ".apk",
    envName: "APP_VARIANT",
    envValue: APK_APP_VARIANT,
    versionNameSuffix: "-apk",
  });
};
