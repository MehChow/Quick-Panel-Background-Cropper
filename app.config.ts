import type { ConfigContext, ExpoConfig } from "expo/config";
const withAndroidDebugDevVariant = require("./plugins/with-android-debug-dev-variant");
const withAndroidReleaseApkVariant = require("./plugins/with-android-release-apk-variant");

const appJson = require("./app.json") as { expo: ExpoConfig };

const DEV_APP_VARIANT = "dev";
const DEV_APP_NAME = "QPBC dev";
const DEV_APP_SCHEME = "quickpanelbackgroundcropper-dev";
const DEV_ANDROID_PACKAGE = "com.meh_chow.quickpanelbackgroundcropper.dev";
const APK_APP_VARIANT = "apk";
const APK_APP_NAME = "QPBC apk";
const APK_APP_SCHEME = "quickpanelbackgroundcropper-apk";
const APK_ANDROID_PACKAGE = "com.meh_chow.quickpanelbackgroundcropper.apk";

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
  const isApkVariant = process.env.APP_VARIANT === APK_APP_VARIANT;

  const expoConfig: ExpoConfig = {
    ...baseConfig,
    name: isDevVariant
      ? DEV_APP_NAME
      : isApkVariant
        ? APK_APP_NAME
        : baseConfig.name,
    scheme: isDevVariant
      ? DEV_APP_SCHEME
      : isApkVariant
        ? APK_APP_SCHEME
        : baseConfig.scheme,
    android: {
      ...baseConfig.android,
      package: isDevVariant
        ? DEV_ANDROID_PACKAGE
        : isApkVariant
          ? APK_ANDROID_PACKAGE
          : baseConfig.android.package,
    },
  };

  const withDevVariant = withAndroidDebugDevVariant(expoConfig, {
    appName: DEV_APP_NAME,
    applicationIdSuffix: ".dev",
    envName: "APP_VARIANT",
    envValue: DEV_APP_VARIANT,
    versionNameSuffix: "-dev",
  });

  return withAndroidReleaseApkVariant(withDevVariant, {
    appName: APK_APP_NAME,
    applicationIdSuffix: ".apk",
    envName: "APP_VARIANT",
    envValue: APK_APP_VARIANT,
    versionNameSuffix: "-apk",
  });
};
