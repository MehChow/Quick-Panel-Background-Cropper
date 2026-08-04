import { createCombinedPanelFileNames } from "../../../model/combined-export-names";
import { createButtonPanelDefinitions } from "../buttons-geometry";
import { createAdvancedPreset } from "../advanced-geometry";
import { goodLockOrder, visualOrder } from "../../../model/preset";
import { translate, getPanelLabel } from "../../../model/i18n";
import type {
  AdvancedCombinedCalibration,
  PanelDefinition,
  QuickPanelPreset,
} from "../../../model/types";

export function createCombinedPreset(
  calibration: AdvancedCombinedCalibration,
): QuickPanelPreset {
  const controlVisualOrder = visualOrder.filter((id) =>
    calibration.enabledControls.includes(id),
  );
  const controlGoodLockOrder = goodLockOrder.filter((id) =>
    calibration.enabledControls.includes(id),
  );
  const fileNames = createCombinedPanelFileNames(
    controlGoodLockOrder,
    calibration.buttons.map((button) => button.label),
  );
  const controlFileNames = new Map(
    controlGoodLockOrder.map((id, index) => [id, fileNames[index]]),
  );
  const base = createAdvancedPreset({
    ...calibration,
    enabledPanels: calibration.enabledControls,
    panels: calibration.controlPanels,
  });
  const controlPanels: Record<string, PanelDefinition> = Object.fromEntries(
    controlVisualOrder.map((id) => [id, {
      ...base.panels[id],
      id,
      label: getPanelLabel(id),
      fileName: controlFileNames.get(id) ?? base.panels[id].fileName,
      rect: { ...calibration.controlPanels[id], radius: 0 },
    }]),
  );
  const buttonPanels = createButtonPanelDefinitions({
    buttons: calibration.buttons,
    fileNames: fileNames.slice(controlGoodLockOrder.length),
    grid: calibration.grid,
    outerRect: calibration.outerRect,
  });
  const buttonOrder = calibration.buttons.map((button) => button.id);

  return {
    id: "one-ui-8-5-combined",
    label: translate("preset.combinedLabel"),
    mode: "advanced",
    width: calibration.screenshotWidth,
    height: calibration.screenshotHeight,
    customizationArea: calibration.outerRect,
    panels: { ...controlPanels, ...buttonPanels },
    visualOrder: [...controlVisualOrder, ...buttonOrder],
    goodLockOrder: [...controlGoodLockOrder, ...buttonOrder],
  };
}
