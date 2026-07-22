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

export type ButtonIdentifierLayoutKind =
  | "horizontal"
  | "vertical"
  | "single"
  | "corner";

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
  bounds: ButtonIdentifierBounds;
  cornerLabelInset: number;
  cornerPadding: number;
  fontSize: number;
  gap: number;
  iconBackgroundSize: number;
  iconSize: number;
  inset: number;
  kind: ButtonIdentifierLayoutKind;
  maxLabelWidth: number;
  minimumFontScale: number;
  showLabel: boolean;
}

const identifierRatios = {
  cornerLabelInset: 0.04,
  cornerPadding: 0.14,
  font: 0.18,
  gap: 0.08,
  icon: 0.34,
  iconBackground: 1.75,
  inset: 0.14,
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
  renderedReferenceCellSize: number,
): ButtonIdentifierLayout {
  const kind = getButtonIdentifierLayoutKind(identifier);
  const iconSize = round(renderedReferenceCellSize * identifierRatios.icon);
  const iconBackgroundSize = round(iconSize * identifierRatios.iconBackground);
  const fontSize = round(renderedReferenceCellSize * identifierRatios.font);
  const gap = round(renderedReferenceCellSize * identifierRatios.gap);
  const inset = round(renderedReferenceCellSize * identifierRatios.inset);
  const cornerPadding = round(
    renderedReferenceCellSize * identifierRatios.cornerPadding,
  );
  const cornerLabelInset = round(
    renderedReferenceCellSize * identifierRatios.cornerLabelInset,
  );
  const showLabel = kind === "horizontal" || kind === "corner";
  const maxLabelWidth = kind === "corner"
    ? Math.max(0, bounds.width - cornerPadding * 2 - cornerLabelInset)
    : showLabel
      ? Math.max(0, bounds.width - inset * 2 - iconBackgroundSize - gap)
      : 0;

  return {
    bounds,
    cornerLabelInset,
    cornerPadding,
    fontSize,
    gap,
    iconBackgroundSize,
    iconSize,
    inset,
    kind,
    maxLabelWidth,
    minimumFontScale: 0.7,
    showLabel,
  };
}

export function getButtonIdentifierLayoutKind(
  identifier: ButtonIdentifierDefinition,
): ButtonIdentifierLayoutKind {
  const { columnSpan, rowSpan } = identifier;
  if (rowSpan === 1 && columnSpan === 1) return "single";
  if (rowSpan === 1 && columnSpan > 1) return "horizontal";
  if (columnSpan === 1 && rowSpan > 1) return "vertical";
  return "corner";
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

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
