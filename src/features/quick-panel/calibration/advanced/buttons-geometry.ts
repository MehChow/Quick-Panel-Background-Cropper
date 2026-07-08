import { createButtonFileNames } from "../../model/button-export-names";
import type {
  AdvancedButtonsCalibration,
  ButtonCalibrationItem,
  EditablePanelItem,
  PanelRect,
  PanelRects,
  QuickPanelPreset,
} from "../../model/types";
import { arePanelsValid } from "./advanced-geometry";

export function createButtonsPreset(calibration: AdvancedButtonsCalibration): QuickPanelPreset {
  const fileNames = createButtonFileNames(calibration.buttons.map((button) => button.label));
  const order = calibration.buttons.map((button) => button.id);
  return {
    id: "one-ui-8-5-buttons",
    label: "Advanced Buttons",
    mode: "advanced",
    width: calibration.screenshotWidth,
    height: calibration.screenshotHeight,
    customizationArea: calibration.outerRect,
    visualOrder: order,
    goodLockOrder: order,
    panels: Object.fromEntries(calibration.buttons.map((button, index) => [
      button.id,
      {
        id: button.id,
        family: "button",
        label: button.label,
        fileName: fileNames[index],
        rect: { ...button.rect, radius: 0 },
      },
    ])),
  };
}

export function getButtonPanelItems(buttons: ButtonCalibrationItem[]): EditablePanelItem[] {
  return buttons.map((button) => ({
    id: button.id,
    label: button.label,
    family: "button",
  }));
}

export function getButtonPanelRects(buttons: ButtonCalibrationItem[]): PanelRects {
  return Object.fromEntries(buttons.map((button) => [button.id, button.rect]));
}

export function areButtonsValid(buttons: ButtonCalibrationItem[], outerRect: PanelRect) {
  return buttons.length > 0 &&
    arePanelsValid(getButtonPanelRects(buttons), outerRect, buttons.map((button) => button.id));
}
