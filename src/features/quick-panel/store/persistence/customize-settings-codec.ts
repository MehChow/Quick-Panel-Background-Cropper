import {
  defaultButtonIdentifierBackgroundTheme,
  defaultButtonIdentifierColor,
  normalizeButtonIdentifierBackgroundTheme,
  normalizeButtonIdentifierColor,
} from "../../model/button-identifier-color";
import {
  defaultButtonCustomizeSettings,
  type ButtonCustomizeSettings,
} from "../../model/button-customize-settings";
import {
  normalizeButtonIdentifierContentMode,
} from "../../model/button-identifier-content";

export function parseButtonCustomizeSettings(
  value: string | undefined,
): ButtonCustomizeSettings {
  try {
    const parsed = value
      ? (JSON.parse(value) as Partial<ButtonCustomizeSettings> & {
        showButtonIdentifiers?: unknown;
      })
      : {};
    if (!parsed || typeof parsed !== "object") {
      return defaultButtonCustomizeSettings;
    }
    return {
      buttonIdentifierBackgroundTheme:
        normalizeButtonIdentifierBackgroundTheme(
          parsed.buttonIdentifierBackgroundTheme,
        ) ?? defaultButtonIdentifierBackgroundTheme,
      buttonIdentifierColor:
        normalizeButtonIdentifierColor(parsed.buttonIdentifierColor) ??
        defaultButtonIdentifierColor,
      buttonIdentifierContentMode:
        normalizeButtonIdentifierContentMode(
          parsed.buttonIdentifierContentMode,
        )
        ?? (
          typeof parsed.showButtonIdentifiers === "boolean"
            ? parsed.showButtonIdentifiers
              ? "both"
              : "none"
            : defaultButtonCustomizeSettings.buttonIdentifierContentMode
        ),
      buttonIdentifierOpacity: parsePercentage(
        parsed.buttonIdentifierOpacity,
        defaultButtonCustomizeSettings.buttonIdentifierOpacity,
      ),
      buttonPanelOpacity: parsePercentage(
        parsed.buttonPanelOpacity,
        defaultButtonCustomizeSettings.buttonPanelOpacity,
      ),
      horizontalIdentifierPosition: parsePercentage(
        parsed.horizontalIdentifierPosition,
        defaultButtonCustomizeSettings.horizontalIdentifierPosition,
      ),
      verticalIdentifierPosition: parsePercentage(
        parsed.verticalIdentifierPosition,
        defaultButtonCustomizeSettings.verticalIdentifierPosition,
      ),
    };
  } catch {
    return defaultButtonCustomizeSettings;
  }
}

export function parsePercentage(value: unknown, fallback: number): number {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
    ? value
    : fallback;
}
