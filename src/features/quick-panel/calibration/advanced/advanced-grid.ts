import type { HandlePosition } from "../shared/calibration-rect";
import type { PanelRect } from "../../model/types";
import { clampPanelRect } from "./panel-constraints";

export interface AdvancedSnapGrid {
  columns: number;
  rows: number;
}

interface SnapAxis {
  lines: number[];
  candidates: number[];
  captureThreshold: number;
  releaseThreshold: number;
}

const defaultColumns = 4;
const defaultRows = 5;
const minGridValue = 2;
const maxGridValue = 8;
const nearbyRowCounts = [4, 5, 6];

export function getDefaultAdvancedSnapGrid(
  outerRect: PanelRect | null,
): AdvancedSnapGrid {
  if (!outerRect) {
    return { columns: defaultColumns, rows: defaultRows };
  }

  const suggestedRows = (outerRect.height / outerRect.width) * defaultColumns;
  const bestNearbyRows = nearbyRowCounts.reduce((best, candidate) =>
    Math.abs(candidate - suggestedRows) < Math.abs(best - suggestedRows)
      ? candidate
      : best
  , defaultRows);
  const rows = Math.abs(bestNearbyRows - suggestedRows) <= 0.45
    ? bestNearbyRows
    : defaultRows;

  return { columns: defaultColumns, rows };
}

export function clampGridValue(value: number) {
  return Math.max(minGridValue, Math.min(maxGridValue, value));
}

export function getSnapGridPoints(
  outerRect: PanelRect,
  grid: AdvancedSnapGrid,
) {
  const xAxis = createAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createAxis(outerRect.y, outerRect.height, grid.rows);

  return yAxis.lines.flatMap((y) => xAxis.lines.map((x) => ({ x, y })));
}

export function snapMovedPanelRect(
  rect: PanelRect,
  startRect: PanelRect,
  outerRect: PanelRect,
  grid: AdvancedSnapGrid,
): PanelRect {
  const xAxis = createAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createAxis(outerRect.y, outerRect.height, grid.rows);
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  const x = rect.x + getBestMoveOffset(
    rect.x,
    right,
    startRect.x,
    startRect.x + startRect.width,
    xAxis,
  );
  const y = rect.y + getBestMoveOffset(
    rect.y,
    bottom,
    startRect.y,
    startRect.y + startRect.height,
    yAxis,
  );

  return clampPanelRect({ ...rect, x, y }, outerRect);
}

export function snapResizedPanelRect(
  rect: PanelRect,
  startRect: PanelRect,
  outerRect: PanelRect,
  grid: AdvancedSnapGrid,
  position: HandlePosition,
): PanelRect {
  const xAxis = createAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createAxis(outerRect.y, outerRect.height, grid.rows);
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;

  if (touchesLeft(position)) {
    left = maybeSnap(left, startRect.x, xAxis);
  }
  if (touchesRight(position)) {
    right = maybeSnap(right, startRect.x + startRect.width, xAxis);
  }
  if (touchesTop(position)) {
    top = maybeSnap(top, startRect.y, yAxis);
  }
  if (touchesBottom(position)) {
    bottom = maybeSnap(bottom, startRect.y + startRect.height, yAxis);
  }

  return clampPanelRect({
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
    radius: 0,
  }, outerRect);
}

function createAxis(start: number, length: number, segments: number): SnapAxis {
  const step = length / segments;
  const gap = Math.max(4, Math.min(12, step * 0.12));
  const gapOffset = gap / 2;
  const lines = Array.from(
    { length: segments + 1 },
    (_, index) => start + step * index,
  );
  const candidates = lines.flatMap((line, index) => {
    if (index === 0 || index === lines.length - 1) {
      return [line];
    }
    return [line - gapOffset, line + gapOffset];
  });

  return {
    lines,
    candidates,
    captureThreshold: Math.max(10, Math.min(20, step * 0.24)),
    releaseThreshold: Math.max(3, Math.min(7, step * 0.08)),
  };
}

function getBestMoveOffset(
  start: number,
  end: number,
  startOrigin: number,
  endOrigin: number,
  axis: SnapAxis,
) {
  const startMatch = getNearestOffset(start, startOrigin, axis);
  const endMatch = getNearestOffset(end, endOrigin, axis);

  if (startMatch === null) {
    return endMatch ?? 0;
  }
  if (endMatch === null) {
    return startMatch;
  }
  return Math.abs(startMatch) <= Math.abs(endMatch) ? startMatch : endMatch;
}

function getNearestOffset(
  value: number,
  originValue: number,
  axis: SnapAxis,
) {
  const candidate = getNearestCandidate(value, originValue, axis);
  return candidate === null ? null : candidate - value;
}

function getNearestCandidate(
  value: number,
  originValue: number,
  axis: SnapAxis,
) {
  const originCandidate = getOriginCandidate(originValue, axis);
  let bestCandidate: number | null = null;
  let bestDistance = axis.captureThreshold + 1;

  for (const line of axis.candidates) {
    if (
      originCandidate !== null &&
      Math.abs(line - originCandidate) < 0.01 &&
      Math.abs(value - originCandidate) > axis.releaseThreshold
    ) {
      continue;
    }
    const offset = line - value;
    const distance = Math.abs(offset);
    if (distance <= axis.captureThreshold && distance < bestDistance) {
      bestCandidate = line;
      bestDistance = distance;
    }
  }

  return bestCandidate;
}

function getOriginCandidate(value: number, axis: SnapAxis) {
  let bestCandidate: number | null = null;
  let bestDistance = axis.captureThreshold + 1;

  for (const candidate of axis.candidates) {
    const distance = Math.abs(candidate - value);
    if (distance <= axis.captureThreshold && distance < bestDistance) {
      bestCandidate = candidate;
      bestDistance = distance;
    }
  }

  return bestCandidate;
}

function maybeSnap(value: number, originValue: number, axis: SnapAxis) {
  const candidate = getNearestCandidate(value, originValue, axis);
  return candidate ?? value;
}

function touchesTop(position: HandlePosition) {
  return position === "top" ||
    position === "topLeft" ||
    position === "topRight";
}

function touchesRight(position: HandlePosition) {
  return position === "topRight" ||
    position === "right" ||
    position === "bottomRight";
}

function touchesBottom(position: HandlePosition) {
  return position === "bottom" ||
    position === "bottomLeft" ||
    position === "bottomRight";
}

function touchesLeft(position: HandlePosition) {
  return position === "topLeft" ||
    position === "bottomLeft" ||
    position === "left";
}
