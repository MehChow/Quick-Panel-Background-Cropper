import {
  getBuiltInButtonLabel,
  isCustomButtonIconId,
} from "../../model/button-labels";
import { panelIds } from "../../model/panel-ids";
import type {
  AdvancedButtonsCalibration,
  AdvancedCalibration,
  AdvancedCombinedCalibration,
  AdvancedSnapGrid,
  ButtonCalibrationItem,
  ButtonPanelId,
  ControlPanelId,
  ControlPanelRects,
  DefaultCalibration,
  PanelRect,
} from "../../model/types";

export interface SavedCalibrations {
  default: DefaultCalibration | null;
  advancedControls: AdvancedCalibration | null;
  advancedButtons: AdvancedButtonsCalibration | null;
  advancedCombined: AdvancedCombinedCalibration | null;
}

export function parseCalibrations(
  value: string | undefined,
): SavedCalibrations | null {
  try {
    const parsed = value
      ? (JSON.parse(value) as Partial<SavedCalibrations>)
      : null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      default: parseDefaultCalibration(parsed.default),
      advancedControls: parseAdvancedCalibration(parsed.advancedControls),
      advancedButtons: parseAdvancedButtonsCalibration(parsed.advancedButtons),
      advancedCombined: parseAdvancedCombinedCalibration(
        parsed.advancedCombined,
      ),
    };
  } catch {
    return null;
  }
}

function parseDefaultCalibration(value: unknown): DefaultCalibration | null {
  if (!value || typeof value !== "object" || !("rect" in value)) {
    return null;
  }
  const rect = parseRectValue(value.rect);
  return rect ? { rect } : null;
}

function parseAdvancedCalibration(value: unknown): AdvancedCalibration | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Partial<AdvancedCalibration>;
  const outerRect = parseRectValue(item.outerRect);
  const panels = parsePanelRects(item.panels);
  const grid = parseAdvancedGrid(item.grid);
  const enabledPanels = parseEnabledPanels(item.enabledPanels);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid ||
    !outerRect ||
    !panels
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    enabledPanels,
    panels,
  };
}

function parseEnabledPanels(value: unknown): ControlPanelId[] {
  if (!Array.isArray(value)) {
    return panelIds;
  }
  const panels = value.filter(
    (item): item is ControlPanelId =>
      typeof item === "string" && panelIds.includes(item as ControlPanelId),
  );
  const uniquePanels = panels.filter(
    (id, index) => panels.indexOf(id) === index,
  );
  return uniquePanels.length > 0
    ? panelIds.filter((id) => uniquePanels.includes(id))
    : panelIds;
}

function parseCombinedEnabledControls(value: unknown): ControlPanelId[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const controls = value.filter(
    (item): item is ControlPanelId =>
      typeof item === "string" && panelIds.includes(item as ControlPanelId),
  );
  const uniqueControls = controls.filter(
    (id, index) => controls.indexOf(id) === index,
  );
  return uniqueControls.length > 0
    ? panelIds.filter((id) => uniqueControls.includes(id))
    : null;
}

function parsePanelRects(value: unknown): ControlPanelRects | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const panels = value as Partial<ControlPanelRects>;
  const buttonBox = parseRectValue(panels.buttonBox);
  const brightness = parseRectValue(panels.brightness);
  const volume = parseRectValue(panels.volume);
  const mediaPlayer = parseRectValue(panels.mediaPlayer);
  return buttonBox && brightness && volume && mediaPlayer
    ? { buttonBox, brightness, volume, mediaPlayer }
    : null;
}

function parseAdvancedButtonsCalibration(
  value: unknown,
): AdvancedButtonsCalibration | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Partial<AdvancedButtonsCalibration>;
  const outerRect = parseRectValue(item.outerRect);
  const grid = parseAdvancedGrid(item.grid);
  const buttons = parseButtonItems(item.buttons);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid ||
    !outerRect ||
    !buttons ||
    buttons.length === 0
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    buttons,
  };
}

function parseAdvancedCombinedCalibration(
  value: unknown,
): AdvancedCombinedCalibration | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const item = value as Partial<AdvancedCombinedCalibration>;
  const outerRect = parseRectValue(item.outerRect);
  const grid = parseAdvancedGrid(item.grid);
  const controlPanels = parsePanelRects(item.controlPanels);
  const enabledControls = parseCombinedEnabledControls(item.enabledControls);
  const buttons = parseButtonItems(item.buttons);
  if (
    typeof item.screenshotWidth !== "number" ||
    typeof item.screenshotHeight !== "number" ||
    !grid ||
    !outerRect ||
    !enabledControls ||
    !controlPanels ||
    !buttons ||
    buttons.length === 0
  ) {
    return null;
  }
  return {
    screenshotWidth: item.screenshotWidth,
    screenshotHeight: item.screenshotHeight,
    grid,
    outerRect,
    enabledControls,
    controlPanels,
    buttons,
  };
}

function parseButtonItems(value: unknown): ButtonCalibrationItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const buttons: ButtonCalibrationItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const button = item as Partial<ButtonCalibrationItem>;
    const rect = parseRectValue(button.rect);
    const isBuiltIn =
      typeof button.label === "string" &&
      Boolean(getBuiltInButtonLabel(button.label));
    if (
      !isButtonPanelId(button.id) ||
      typeof button.label !== "string" ||
      !button.label.trim() ||
      !rect
    ) {
      return null;
    }
    let customIconId: ButtonCalibrationItem["customIconId"];
    if (isBuiltIn) {
      if (button.customIconId !== null) return null;
      customIconId = null;
    } else {
      if (!isCustomButtonIconId(button.customIconId)) return null;
      customIconId = button.customIconId;
    }
    buttons.push({
      id: button.id,
      label: button.label,
      customIconId,
      rect,
    });
  }
  return buttons;
}

function parseAdvancedGrid(value: unknown): AdvancedSnapGrid | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const grid = value as Partial<AdvancedSnapGrid>;
  return isGridValue(grid.columns) && isGridValue(grid.rows)
    ? { columns: grid.columns, rows: grid.rows }
    : null;
}

function parseRectValue(value: unknown): PanelRect | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const rect = value as Partial<PanelRect>;
  return ["x", "y", "width", "height", "radius"].every(
    (key) => typeof rect[key as keyof PanelRect] === "number",
  )
    ? (rect as PanelRect)
    : null;
}

function isGridValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 8
  );
}

function isButtonPanelId(value: unknown): value is ButtonPanelId {
  return typeof value === "string" && /^button-\d+$/.test(value);
}
