import { useState } from "react";
import {
  getButtonIdentifierLayoutKind,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import type { QuickPanelPreset } from "../../model/types";

const DEFAULT_BUTTON_PANEL_OPACITY = 78;
const DEFAULT_BUTTON_IDENTIFIER_OPACITY = 70;
const DEFAULT_BUTTON_IDENTIFIER_POSITION = 50;

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
  const [buttonPanelOpacity, setButtonPanelOpacity] = useState(
    DEFAULT_BUTTON_PANEL_OPACITY,
  );
  const [buttonIdentifierOpacity, setButtonIdentifierOpacity] = useState(
    DEFAULT_BUTTON_IDENTIFIER_OPACITY,
  );
  const [horizontalIdentifierPosition, setHorizontalIdentifierPosition] = useState(
    DEFAULT_BUTTON_IDENTIFIER_POSITION,
  );
  const [verticalIdentifierPosition, setVerticalIdentifierPosition] = useState(
    DEFAULT_BUTTON_IDENTIFIER_POSITION,
  );
  const [showButtonIdentifiers, setShowButtonIdentifiers] = useState(true);
  const orientations = preset.visualOrder.map((id) => {
    const identifier = preset.panels[id]?.buttonIdentifier;
    return identifier ? getButtonIdentifierLayoutKind(identifier) : null;
  });

  return {
    buttonIdentifierOpacity,
    buttonPanelOpacity,
    hasHorizontalButtons: orientations.includes("horizontal"),
    hasVerticalButtons: orientations.includes("vertical"),
    horizontalIdentifierPosition,
    identifierPositions: {
      horizontal: horizontalIdentifierPosition / 100,
      vertical: verticalIdentifierPosition / 100,
    },
    setButtonIdentifierOpacity,
    setButtonPanelOpacity,
    setHorizontalIdentifierPosition,
    setShowButtonIdentifiers,
    setVerticalIdentifierPosition,
    showButtonIdentifiers,
    verticalIdentifierPosition,
  };
}
