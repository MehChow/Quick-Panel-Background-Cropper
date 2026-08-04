import { useState } from "react";
import {
  getButtonIdentifierLayoutKind,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import type { AdvancedTarget, QuickPanelPreset } from "../../model/types";
import {
  defaultButtonIdentifierBackgroundTheme,
  defaultButtonIdentifierColor,
  normalizeButtonIdentifierBackgroundTheme,
  normalizeButtonIdentifierColor,
  type ButtonIdentifierAppearance,
  type ButtonIdentifierBackgroundTheme,
} from "../button-identifier-color";
import {
  loadButtonCustomizeSettings,
  loadCombinedButtonImageIntensity,
  saveButtonCustomizeSettings,
  saveCombinedButtonImageIntensity,
  type ButtonCustomizeSettings,
} from "../../store/storage";

export interface ButtonCustomizeControlState {
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  identifierPositions: ButtonIdentifierPositions;
  commitButtonPanelOpacity: (value: number) => void;
  commitHorizontalIdentifierPosition: (value: number) => void;
  commitVerticalIdentifierPosition: (value: number) => void;
  setButtonIdentifierAppearance: (appearance: ButtonIdentifierAppearance) => void;
  setButtonPanelOpacity: (value: number) => void;
  setHorizontalIdentifierPosition: (value: number) => void;
  setShowButtonIdentifiers: (value: boolean) => void;
  setVerticalIdentifierPosition: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function useButtonCustomizeControls(
  preset: QuickPanelPreset,
  target: AdvancedTarget | null,
): ButtonCustomizeControlState {
  const [settings, setSettings] = useState<ButtonCustomizeSettings>(
    loadButtonCustomizeSettings,
  );
  const [combinedButtonPanelOpacity, setCombinedButtonPanelOpacity] = useState(
    loadCombinedButtonImageIntensity,
  );
  const setSetting = <K extends keyof ButtonCustomizeSettings>(
    key: K,
    value: ButtonCustomizeSettings[K],
  ) => {
    setSettings((current) => {
      return Object.is(current[key], value)
        ? current
        : { ...current, [key]: value };
    });
  };
  const commitSetting = <K extends keyof ButtonCustomizeSettings>(
    key: K,
    value: ButtonCustomizeSettings[K],
  ) => {
    setSettings((current) => {
      const next = Object.is(current[key], value)
        ? current
        : { ...current, [key]: value };
      saveButtonCustomizeSettings(next);
      return next;
    });
  };
  const orientations = preset.visualOrder.map((id) => {
    const identifier = preset.panels[id]?.buttonIdentifier;
    return identifier ? getButtonIdentifierLayoutKind(identifier) : null;
  });
  return {
    buttonIdentifierBackgroundTheme: settings.buttonIdentifierBackgroundTheme,
    buttonIdentifierColor: settings.buttonIdentifierColor,
    buttonIdentifierOpacity: settings.buttonIdentifierOpacity,
    buttonPanelOpacity:
      target === "combined"
        ? combinedButtonPanelOpacity
        : settings.buttonPanelOpacity,
    hasHorizontalButtons: orientations.includes("horizontal"),
    hasVerticalButtons: orientations.includes("vertical"),
    horizontalIdentifierPosition: settings.horizontalIdentifierPosition,
    identifierPositions: {
      horizontal: settings.horizontalIdentifierPosition / 100,
      vertical: settings.verticalIdentifierPosition / 100,
    },
    commitButtonPanelOpacity: (value) => {
      const next = Math.min(100, Math.max(0, value));
      if (target === "combined") {
        setCombinedButtonPanelOpacity(next);
        saveCombinedButtonImageIntensity(next);
        return;
      }
      commitSetting("buttonPanelOpacity", next);
    },
    commitHorizontalIdentifierPosition: (value) =>
      commitSetting("horizontalIdentifierPosition", value),
    commitVerticalIdentifierPosition: (value) =>
      commitSetting("verticalIdentifierPosition", value),
    setButtonIdentifierAppearance: ({ backgroundTheme, color, opacity }) => {
      setSettings((current) => {
        const next = {
          ...current,
          buttonIdentifierBackgroundTheme:
            normalizeButtonIdentifierBackgroundTheme(backgroundTheme)
            ?? defaultButtonIdentifierBackgroundTheme,
          buttonIdentifierColor:
            normalizeButtonIdentifierColor(color) ?? defaultButtonIdentifierColor,
          buttonIdentifierOpacity: Math.min(100, Math.max(0, opacity)),
        };
        saveButtonCustomizeSettings(next);
        return next;
      });
    },
    setButtonPanelOpacity: (value) => {
      const next = Math.min(100, Math.max(0, value));
      if (target === "combined") {
        setCombinedButtonPanelOpacity(next);
        return;
      }
      setSetting("buttonPanelOpacity", next);
    },
    setHorizontalIdentifierPosition: (value) =>
      setSetting("horizontalIdentifierPosition", value),
    setShowButtonIdentifiers: (value) =>
      commitSetting("showButtonIdentifiers", value),
    setVerticalIdentifierPosition: (value) =>
      setSetting("verticalIdentifierPosition", value),
    showButtonIdentifiers: settings.showButtonIdentifiers,
    verticalIdentifierPosition: settings.verticalIdentifierPosition,
  };
}
