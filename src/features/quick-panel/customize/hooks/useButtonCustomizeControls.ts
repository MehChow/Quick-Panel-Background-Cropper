import { useState } from "react";
import {
  getButtonIdentifierLayoutKind,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import type { QuickPanelPreset } from "../../model/types";
import {
  loadButtonCustomizeSettings,
  saveButtonCustomizeSettings,
  type ButtonCustomizeSettings,
} from "../../store/storage";

export interface ButtonCustomizeControlState {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  hasHorizontalButtons: boolean;
  hasVerticalButtons: boolean;
  horizontalIdentifierPosition: number;
  identifierPositions: ButtonIdentifierPositions;
  setButtonIdentifierOpacity: (value: number) => void;
  setButtonPanelOpacity: (value: number) => void;
  setHorizontalIdentifierPosition: (value: number) => void;
  setShowButtonIdentifiers: (value: boolean) => void;
  setVerticalIdentifierPosition: (value: number) => void;
  showButtonIdentifiers: boolean;
  verticalIdentifierPosition: number;
}

export function useButtonCustomizeControls(
  preset: QuickPanelPreset,
): ButtonCustomizeControlState {
  const [settings, setSettings] = useState<ButtonCustomizeSettings>(
    loadButtonCustomizeSettings,
  );
  const updateSetting = <K extends keyof ButtonCustomizeSettings>(
    key: K,
    value: ButtonCustomizeSettings[K],
  ) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      saveButtonCustomizeSettings(next);
      return next;
    });
  };
  const orientations = preset.visualOrder.map((id) => {
    const identifier = preset.panels[id]?.buttonIdentifier;
    return identifier ? getButtonIdentifierLayoutKind(identifier) : null;
  });

  return {
    buttonIdentifierOpacity: settings.buttonIdentifierOpacity,
    buttonPanelOpacity: settings.buttonPanelOpacity,
    hasHorizontalButtons: orientations.includes("horizontal"),
    hasVerticalButtons: orientations.includes("vertical"),
    horizontalIdentifierPosition: settings.horizontalIdentifierPosition,
    identifierPositions: {
      horizontal: settings.horizontalIdentifierPosition / 100,
      vertical: settings.verticalIdentifierPosition / 100,
    },
    setButtonIdentifierOpacity: (value) => updateSetting("buttonIdentifierOpacity", value),
    setButtonPanelOpacity: (value) => updateSetting("buttonPanelOpacity", value),
    setHorizontalIdentifierPosition: (value) => updateSetting("horizontalIdentifierPosition", value),
    setShowButtonIdentifiers: (value) => updateSetting("showButtonIdentifiers", value),
    setVerticalIdentifierPosition: (value) => updateSetting("verticalIdentifierPosition", value),
    showButtonIdentifiers: settings.showButtonIdentifiers,
    verticalIdentifierPosition: settings.verticalIdentifierPosition,
  };
}
