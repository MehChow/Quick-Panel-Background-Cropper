import { getCalibratedPreset } from "../shared/calibration-preset";
import { getPanelUnion } from "../../model/panel-geometry";
import { goodLockOrder, visualOrder } from "../../model/preset";
import { getPanelLabel, translate } from "../../model/i18n";
import type {
  AdvancedCalibration,
  ControlPanelId,
  ControlPanelRects,
  PanelRect,
  PanelRects,
  QuickPanelPreset,
} from "../../model/types";

export function getInitialAdvancedPanels(outerRect: PanelRect): ControlPanelRects {
  const preset = getCalibratedPreset(outerRect);
  return mapPanelRects(preset);
}

export function scalePanelsToOuter(
  panels: Record<string, PanelRect>,
  sourceOuter: PanelRect,
  targetOuter: PanelRect,
): PanelRects {
  const scaleX = targetOuter.width / sourceOuter.width;
  const scaleY = targetOuter.height / sourceOuter.height;

  return Object.fromEntries(Object.entries(panels).map(([id, rect]) => [id, {
    x: targetOuter.x + (rect.x - sourceOuter.x) * scaleX,
    y: targetOuter.y + (rect.y - sourceOuter.y) * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
    radius: 0,
  }]));
}

export function scaleControlPanelsToOuter(
  panels: ControlPanelRects,
  sourceOuter: PanelRect,
  targetOuter: PanelRect,
): ControlPanelRects {
  const scaled = scalePanelsToOuter(panels, sourceOuter, targetOuter);
  return mapPanels((id) => {
    const rect = panels[id];
    return {
      ...scaled[id],
      radius: rect.radius,
    };
  });
}

export function createAdvancedPreset(
  calibration: AdvancedCalibration,
): QuickPanelPreset {
  const base = getCalibratedPreset(calibration.outerRect);
  const enabledVisualOrder = visualOrder.filter((id) =>
    calibration.enabledPanels.includes(id),
  );
  const enabledGoodLockOrder = goodLockOrder.filter((id) =>
    calibration.enabledPanels.includes(id),
  );
  return {
    ...base,
    id: "one-ui-8-5-advanced",
    label: translate("preset.advancedLabel"),
    mode: "advanced",
    width: calibration.screenshotWidth,
    height: calibration.screenshotHeight,
    customizationArea: calibration.outerRect,
    visualOrder: enabledVisualOrder,
    goodLockOrder: enabledGoodLockOrder,
    panels: mapPanels((id) => ({
      ...base.panels[id],
      id,
      label: getPanelLabel(id),
      rect: { ...calibration.panels[id], radius: 0 },
    })),
  };
}

export function getPanelRectUnion(panels: ControlPanelRects): PanelRect {
  return getPanelUnion(createAdvancedPreset({
    screenshotHeight: 1,
    screenshotWidth: 1,
    grid: { columns: 4, rows: 5 },
    outerRect: { x: 0, y: 0, width: 1, height: 1, radius: 0 },
    enabledPanels: visualOrder,
    panels,
  }));
}

export function hasOverlappingPanels(
  panels: Record<string, PanelRect>,
  enabledPanels: string[],
): boolean {
  return enabledPanels.some((id, index) =>
    enabledPanels.slice(index + 1).some((otherId) =>
      rectanglesOverlap(panels[id], panels[otherId]),
    ),
  );
}

export function arePanelsValid(
  panels: Record<string, PanelRect>,
  outerRect: PanelRect,
  enabledPanels: string[],
) {
  return enabledPanels.length > 0 &&
    enabledPanels.every((id) => isRectInside(panels[id], outerRect)) &&
    !hasOverlappingPanels(panels, enabledPanels);
}

function rectanglesOverlap(a: PanelRect, b: PanelRect) {
  const epsilon = 0.75;
  return (
    a.x < b.x + b.width - epsilon &&
    a.x + a.width > b.x + epsilon &&
    a.y < b.y + b.height - epsilon &&
    a.y + a.height > b.y + epsilon
  );
}


function isRectInside(rect: PanelRect, outer: PanelRect) {
  const epsilon = 0.75;
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x >= outer.x - epsilon &&
    rect.y >= outer.y - epsilon &&
    rect.x + rect.width <= outer.x + outer.width + epsilon &&
    rect.y + rect.height <= outer.y + outer.height + epsilon
  );
}

function mapPanelRects(preset: QuickPanelPreset): ControlPanelRects {
  return mapPanels((id) => ({ ...preset.panels[id].rect, radius: 0 }));
}

function mapPanels<T>(create: (id: ControlPanelId) => T): Record<ControlPanelId, T> {
  return {
    buttonBox: create("buttonBox"),
    brightness: create("brightness"),
    volume: create("volume"),
    mediaPlayer: create("mediaPlayer"),
  };
}
