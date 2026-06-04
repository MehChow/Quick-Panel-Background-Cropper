import { getCalibratedPreset } from "../calibration/calibration";
import { getPanelUnion } from "../model/panel-geometry";
import { goodLockOrder, visualOrder } from "../model/preset";
import { getPanelLabel, translate } from "../model/i18n";
import type {
  AdvancedCalibration,
  PanelId,
  PanelRect,
  PanelRects,
  QuickPanelPreset,
} from "../model/types";

export function getInitialAdvancedPanels(outerRect: PanelRect): PanelRects {
  const preset = getCalibratedPreset(outerRect);
  return mapPanelRects(preset);
}

export function scalePanelsToOuter(
  panels: PanelRects,
  sourceOuter: PanelRect,
  targetOuter: PanelRect,
): PanelRects {
  const scaleX = targetOuter.width / sourceOuter.width;
  const scaleY = targetOuter.height / sourceOuter.height;

  return mapPanels((id) => {
    const rect = panels[id];
    return {
      x: targetOuter.x + (rect.x - sourceOuter.x) * scaleX,
      y: targetOuter.y + (rect.y - sourceOuter.y) * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
      radius: 0,
    };
  });
}

export function createAdvancedPreset(
  calibration: AdvancedCalibration,
): QuickPanelPreset {
  const base = getCalibratedPreset(calibration.outerRect);
  return {
    ...base,
    id: "one-ui-8-5-advanced",
    label: translate("preset.advancedLabel"),
    mode: "advanced",
    width: calibration.screenshotWidth,
    height: calibration.screenshotHeight,
    customizationArea: calibration.outerRect,
    visualOrder,
    goodLockOrder,
    panels: mapPanels((id) => ({
      ...base.panels[id],
      id,
      label: getPanelLabel(id),
      rect: { ...calibration.panels[id], radius: 0 },
    })),
  };
}

export function getPanelRectUnion(panels: PanelRects): PanelRect {
  return getPanelUnion(createAdvancedPreset({
    screenshotHeight: 1,
    screenshotWidth: 1,
    outerRect: { x: 0, y: 0, width: 1, height: 1, radius: 0 },
    panels,
  }));
}

export function hasOverlappingPanels(panels: PanelRects): boolean {
  return visualOrder.some((id, index) =>
    visualOrder.slice(index + 1).some((otherId) =>
      rectanglesOverlap(panels[id], panels[otherId]),
    ),
  );
}

export function arePanelsValid(panels: PanelRects, outerRect: PanelRect) {
  return visualOrder.every((id) => isRectInside(panels[id], outerRect)) &&
    !hasOverlappingPanels(panels);
}

function rectanglesOverlap(a: PanelRect, b: PanelRect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


function isRectInside(rect: PanelRect, outer: PanelRect) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.x >= outer.x &&
    rect.y >= outer.y &&
    rect.x + rect.width <= outer.x + outer.width &&
    rect.y + rect.height <= outer.y + outer.height
  );
}

function mapPanelRects(preset: QuickPanelPreset): PanelRects {
  return mapPanels((id) => ({ ...preset.panels[id].rect, radius: 0 }));
}

function mapPanels<T>(create: (id: PanelId) => T): Record<PanelId, T> {
  return {
    buttonBox: create("buttonBox"),
    brightness: create("brightness"),
    volume: create("volume"),
    mediaPlayer: create("mediaPlayer"),
  };
}
