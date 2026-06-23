import type { ConfigContext, ExpoConfig } from "expo/config";
const withAndroidDebugDevVariant = require("./plugins/with-android-debug-dev-variant");

const appJson = require("./app.json") as { expo: ExpoConfig };

const DEV_APP_VARIANT = "dev";
const DEV_APP_NAME = "QPBC dev";
const DEV_APP_SCHEME = "quickpanelbackgroundcropper-dev";
const DEV_ANDROID_PACKAGE = "com.meh_chow.quickpanelbackgroundcropper.dev";

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
    android: {
      ...baseConfig.android,
      package: isDevVariant ? DEV_ANDROID_PACKAGE : baseConfig.android.package,
    },
  };

  return withAndroidDebugDevVariant(expoConfig, {
    appName: DEV_APP_NAME,
    applicationIdSuffix: ".dev",
    envName: "APP_VARIANT",
    envValue: DEV_APP_VARIANT,
    versionNameSuffix: "-dev",
  });
};
