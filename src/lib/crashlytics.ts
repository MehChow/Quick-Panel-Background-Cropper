import {
  getCrashlytics,
  log,
  recordError,
  setAttributes,
} from "@react-native-firebase/crashlytics";
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

function getStringAttributes(context: CrashlyticsContext): Record<string, string> {
  return Object.fromEntries(
    Object.entries(context).flatMap(([key, value]) =>
      value === undefined || value === null ? [] : [[key, String(value)]],
    ),
  );
}

export async function setCrashlyticsContext(
  context: CrashlyticsContext,
): Promise<void> {
  await setAttributes(getCrashlytics(), {
    appBuildVersion: Application.nativeBuildVersion ?? "unknown",
    appVersion: Constants.expoConfig?.version ?? "unknown",
    platform: Platform.OS,
    ...getStringAttributes(context),
  });
}

export function logCrashlytics(message: string): void {
  log(getCrashlytics(), message);
}

export async function recordCrashlyticsError(
  error: unknown,
  context: CrashlyticsContext = {},
): Promise<void> {
  await setCrashlyticsContext(context);
  recordError(
    getCrashlytics(),
    error instanceof Error ? error : new Error(String(error)),
  );
}
