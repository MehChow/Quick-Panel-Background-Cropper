import type { HandlePosition } from "../shared/calibration-rect";
import type { AdvancedSnapGrid, PanelRect } from "../../model/types";
import { clampPanelRect } from "./panel-constraints";

export type { AdvancedSnapGrid } from "../../model/types";

interface SnapAxis {
  lines: number[];
  candidates: number[];
  captureThreshold: number;
  releaseThreshold: number;
}

export interface SnapResult {
  rect: PanelRect;
  snapKey: string | null;
}

interface SnapMatch {
  edge: SnapEdge;
  offset: number;
  value: number;
}

type SnapAxisName = "x" | "y";
type SnapEdge = "left" | "right" | "top" | "bottom";

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
): SnapResult {
  const xAxis = createAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createAxis(outerRect.y, outerRect.height, grid.rows);
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  const xMatch = getBestMoveMatch(
    rect.x,
    right,
    startRect.x,
    startRect.x + startRect.width,
    xAxis,
    "left",
    "right",
  );
  const yMatch = getBestMoveMatch(
    rect.y,
    bottom,
    startRect.y,
    startRect.y + startRect.height,
    yAxis,
    "top",
    "bottom",
  );
  const x = rect.x + (xMatch?.offset ?? 0);
  const y = rect.y + (yMatch?.offset ?? 0);

  return {
    rect: clampPanelRect({ ...rect, x, y }, outerRect),
    snapKey: getSnapKey([
      getMatchSnapKey(xMatch, "x"),
      getMatchSnapKey(yMatch, "y"),
    ]),
  };
}

export function snapResizedPanelRect(
  rect: PanelRect,
  startRect: PanelRect,
  outerRect: PanelRect,
  grid: AdvancedSnapGrid,
  position: HandlePosition,
): SnapResult {
  const xAxis = createAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createAxis(outerRect.y, outerRect.height, grid.rows);
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;
  const snapKeys: (string | null)[] = [];

  if (touchesLeft(position)) {
    const result = maybeSnap(left, startRect.x, xAxis, "left");
    left = result.value;
    snapKeys.push(getMatchSnapKey(result.match, "x"));
  }
  if (touchesRight(position)) {
    const result = maybeSnap(right, startRect.x + startRect.width, xAxis, "right");
    right = result.value;
    snapKeys.push(getMatchSnapKey(result.match, "x"));
  }
  if (touchesTop(position)) {
    const result = maybeSnap(top, startRect.y, yAxis, "top");
    top = result.value;
    snapKeys.push(getMatchSnapKey(result.match, "y"));
  }
  if (touchesBottom(position)) {
    const result = maybeSnap(bottom, startRect.y + startRect.height, yAxis, "bottom");
    bottom = result.value;
    snapKeys.push(getMatchSnapKey(result.match, "y"));
  }

  return {
    rect: clampPanelRect({
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
      radius: 0,
    }, outerRect),
    snapKey: getSnapKey(snapKeys),
  };
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

function getBestMoveMatch(
  start: number,
  end: number,
  startOrigin: number,
  endOrigin: number,
  axis: SnapAxis,
  startEdge: SnapEdge,
  endEdge: SnapEdge,
) {
  const startMatch = getNearestMatch(start, startOrigin, axis, startEdge);
  const endMatch = getNearestMatch(end, endOrigin, axis, endEdge);

  if (startMatch === null) {
    return endMatch;
  }
  if (endMatch === null) {
    return startMatch;
  }
  return Math.abs(startMatch.offset) <= Math.abs(endMatch.offset)
    ? startMatch
    : endMatch;
}

function getNearestMatch(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
) {
  const candidate = getNearestCandidate(value, originValue, axis);
  return candidate === null ? null : {
    edge,
    offset: candidate - value,
    value: candidate,
  };
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

function maybeSnap(
  value: number,
  originValue: number,
  axis: SnapAxis,
  edge: SnapEdge,
) {
  const candidate = getNearestCandidate(value, originValue, axis);
  return {
    match: candidate === null ? null : {
      edge,
      offset: candidate - value,
      value: candidate,
    },
    value: candidate ?? value,
  };
}

function getMatchSnapKey(match: SnapMatch | null, axis: SnapAxisName) {
  if (!match) {
    return null;
  }
  return `${match.edge}:${axis}:${formatSnapValue(match.value)}`;
}

function getSnapKey(keys: (string | null)[]) {
  const activeKeys = keys.filter((key): key is string => key !== null);
  return activeKeys.length ? activeKeys.join("|") : null;
}

function formatSnapValue(value: number) {
  return value.toFixed(2);
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
