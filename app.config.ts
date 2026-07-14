import type { ConfigContext, ExpoConfig } from "expo/config";
const withAndroidDebugDevVariant = require("./plugins/with-android-debug-dev-variant");
const withAndroidReleaseApkVariant = require("./plugins/with-android-release-apk-variant");

const appJson = require("./app.json") as { expo: ExpoConfig };

const DEV_APP_VARIANT = "dev";
const DEV_APP_NAME = "QPBC dev";
const DEV_APP_SCHEME = "quickpanelbackgroundcropper-dev";
const APK_APP_VARIANT = "apk";
const APK_GOOGLE_SERVICES_FILE = "./google-services/google-services-apk.json";
const BETA_GOOGLE_SERVICES_FILE = "./google-services/google-services-open.json";
const FIREBASE_PLUGINS = [
  "@react-native-firebase/app",
  "@react-native-firebase/crashlytics",
];

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
  const shouldConfigureFirebase = !isDevVariant;
  const basePlugins = (baseConfig.plugins ?? []).filter(
    (plugin) => !FIREBASE_PLUGINS.includes(String(plugin)),
  );
  const expoConfig: ExpoConfig = {
    ...baseConfig,
    name: isDevVariant ? DEV_APP_NAME : baseConfig.name,
    scheme: isDevVariant ? DEV_APP_SCHEME : baseConfig.scheme,
    android: {
      ...baseConfig.android,
      ...(shouldConfigureFirebase
        ? {
            googleServicesFile: isApkVariant
              ? APK_GOOGLE_SERVICES_FILE
              : BETA_GOOGLE_SERVICES_FILE,
          }
        : {}),
    },
    plugins: shouldConfigureFirebase
      ? [...basePlugins, ...FIREBASE_PLUGINS]
      : basePlugins,
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
