import { createButtonFileNames } from "../../model/button-export-names";
import { getButtonGridSpan } from "../../model/button-identifier-layout";
import { getButtonIconName } from "../../model/button-labels";
import { getButtonLabel } from "../../model/i18n";
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
  const referenceCellSize = Math.min(
    calibration.outerRect.width / calibration.grid.columns,
    calibration.outerRect.height / calibration.grid.rows,
  );
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
        label: getButtonLabel(button.label),
        fileName: fileNames[index],
        rect: { ...button.rect, radius: 0 },
        buttonIdentifier: {
          ...getButtonGridSpan(
            button.rect,
            calibration.outerRect,
            calibration.grid,
          ),
          iconName: getButtonIconName(button.label, button.customIconId),
          referenceCellSize,
        },
      },
    ])),
  };
}

export function getButtonPanelItems(buttons: ButtonCalibrationItem[]): EditablePanelItem[] {
  return buttons.map((button) => ({
    id: button.id,
    label: getButtonLabel(button.label),
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
