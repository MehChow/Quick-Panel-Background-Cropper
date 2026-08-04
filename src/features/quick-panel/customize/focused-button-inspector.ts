import type {
  ButtonIdentifierDefinition,
  PanelDefinition,
  QuickPanelPreset,
} from "../model/types";

export interface InspectableButtonPanel extends PanelDefinition {
  buttonIdentifier: ButtonIdentifierDefinition;
  family: "button";
}

export function getInspectableButtonPanels(
  preset: QuickPanelPreset,
): InspectableButtonPanel[] {
  return preset.visualOrder
    .map((id) => preset.panels[id])
    .filter((panel): panel is InspectableButtonPanel =>
      panel?.family === "button" && panel.buttonIdentifier !== undefined,
    );
}

export function getCycledButtonIndex(
  currentIndex: number,
  buttonCount: number,
  direction: -1 | 1,
): number {
  if (buttonCount <= 0) {
    return 0;
  }
  return (currentIndex + direction + buttonCount) % buttonCount;
}
