import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface CrashlyticsContext {
  action?: string;
  calibrationPhase?: string;
  mode?: string | null;
  panelId?: string;
  presetId?: string;
}

interface CrashlyticsModule {
  getCrashlytics: () => unknown;
  log: (crashlytics: unknown, message: string) => void;
  recordError: (crashlytics: unknown, error: Error) => void;
  setAttributes: (
    crashlytics: unknown,
    attributes: Record<string, string>,
  ) => Promise<void>;
}

function getStringAttributes(context: CrashlyticsContext): Record<string, string> {
  return Object.fromEntries(
    Object.entries(context).flatMap(([key, value]) =>
      value === undefined || value === null ? [] : [[key, String(value)]],
    ),
  );
}

function getCrashlyticsModule(): CrashlyticsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getApps } = require("@react-native-firebase/app") as {
      getApps: () => unknown[];
    };

    if (getApps().length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-firebase/crashlytics") as CrashlyticsModule;
  } catch {
    return null;
  }
}

export async function setCrashlyticsContext(
  context: CrashlyticsContext,
): Promise<void> {
  const crashlyticsModule = getCrashlyticsModule();

  if (!crashlyticsModule) {
    return;
  }

  await crashlyticsModule.setAttributes(crashlyticsModule.getCrashlytics(), {
    appBuildVersion: Application.nativeBuildVersion ?? "unknown",
    appVersion: Constants.expoConfig?.version ?? "unknown",
    platform: Platform.OS,
    ...getStringAttributes(context),
  });
}

export function logCrashlytics(message: string): void {
  const crashlyticsModule = getCrashlyticsModule();

  if (!crashlyticsModule) {
    return;
  }

  crashlyticsModule.log(crashlyticsModule.getCrashlytics(), message);
}

export async function recordCrashlyticsError(
  error: unknown,
  context: CrashlyticsContext = {},
): Promise<void> {
  const crashlyticsModule = getCrashlyticsModule();

  if (!crashlyticsModule) {
    return;
  }

  await setCrashlyticsContext(context);
  crashlyticsModule.recordError(
    crashlyticsModule.getCrashlytics(),
    error instanceof Error ? error : new Error(String(error)),
  );
}
