import { getExportSquareRect } from "./panel-geometry";
import type {
  AdvancedSnapGrid,
  ButtonIdentifierDefinition,
  PanelDefinition,
  PanelRect,
} from "./types";

export interface ButtonIdentifierBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

export type ButtonIdentifierAlignment =
  | "center"
  | "top-center"
  | "left-center";
export type ButtonIdentifierOrientation = "horizontal" | "vertical" | "square";
export type ButtonIdentifierRenderTarget = "preview" | "export";

export interface ButtonIdentifierPositions {
  horizontal: number;
  vertical: number;
}

interface ConstrainedAxisOffsetInput {
  axisLength: number;
  contentLength: number;
  inset: number;
  position: number;
}

export interface ButtonIdentifierLayout {
  alignment: ButtonIdentifierAlignment;
  bounds: ButtonIdentifierBounds;
  fontSize: number;
  gap: number;
  iconSize: number;
  inset: number;
  maxLabelWidth: number;
  minimumFontScale: number;
  orientation: ButtonIdentifierOrientation;
  showLabel: boolean;
}

const targetSizing = {
  preview: {
    icon: [0.34, 12, 28], font: [0.18, 9, 16],
    gap: [0.08, 4, 10], inset: [0.14, 6, 18],
  },
  export: {
    icon: [0.34, 18, 96], font: [0.18, 14, 56],
    gap: [0.08, 8, 32], inset: [0.14, 12, 48],
  },
} as const;

export function getButtonGridSpan(
  rect: PanelRect,
  outerRect: PanelRect,
  grid: AdvancedSnapGrid,
) {
  const columnWidth = outerRect.width / grid.columns;
  const rowHeight = outerRect.height / grid.rows;
  return {
    columnSpan: clamp(Math.round(rect.width / columnWidth), 1, grid.columns),
    rowSpan: clamp(Math.round(rect.height / rowHeight), 1, grid.rows),
  };
}

export function getButtonExportBounds(
  panel: PanelDefinition,
  side: number,
): ButtonIdentifierBounds {
  const square = getExportSquareRect(panel);
  const scale = side / square.width;
  return {
    x: (panel.rect.x - square.x) * scale,
    y: (panel.rect.y - square.y) * scale,
    width: panel.rect.width * scale,
    height: panel.rect.height * scale,
  };
}

export function getButtonIdentifierLayout(
  bounds: ButtonIdentifierBounds,
  identifier: ButtonIdentifierDefinition,
  target: ButtonIdentifierRenderTarget,
): ButtonIdentifierLayout {
  const shortSide = Math.min(bounds.width, bounds.height);
  const sizing = targetSizing[target];
  const iconSize = getSize(shortSide, sizing.icon);
  const fontSize = getSize(shortSide, sizing.font);
  const gap = getSize(shortSide, sizing.gap);
  const inset = getSize(shortSide, sizing.inset);
  const isSingleCell = identifier.columnSpan === 1 && identifier.rowSpan === 1;
  const isVertical = !isSingleCell && identifier.rowSpan > identifier.columnSpan;
  const orientation = getButtonIdentifierOrientation(identifier);
  const showLabel = !isSingleCell && !isVertical;
  return {
    alignment: isSingleCell ? "center" : isVertical ? "top-center" : "left-center",
    bounds,
    fontSize,
    gap,
    iconSize,
    inset,
    maxLabelWidth: showLabel
      ? Math.max(0, bounds.width - inset * 2 - iconSize - gap)
      : 0,
    minimumFontScale: 0.7,
    orientation,
    showLabel,
  };
}

export function getButtonIdentifierOrientation(
  identifier: ButtonIdentifierDefinition,
): ButtonIdentifierOrientation {
  if (identifier.columnSpan > identifier.rowSpan) return "horizontal";
  if (identifier.rowSpan > identifier.columnSpan) return "vertical";
  return "square";
}

export function getConstrainedAxisOffset({
  axisLength,
  contentLength,
  inset,
  position,
}: ConstrainedAxisOffsetInput): number {
  const safeStart = inset;
  const safeEnd = Math.max(
    safeStart,
    axisLength - inset - contentLength,
  );
  const normalized = clamp(position, 0, 1);
  return safeStart + (safeEnd - safeStart) * normalized;
}

function getSize(
  shortSide: number,
  sizing: readonly [number, number, number],
) {
  const size = clamp(shortSide * sizing[0], sizing[1], sizing[2]);
  return Math.round(size * 1000) / 1000;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
