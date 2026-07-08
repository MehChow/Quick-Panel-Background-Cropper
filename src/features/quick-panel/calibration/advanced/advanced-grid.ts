import type { AdvancedSnapGrid, PanelRect } from "../../model/types";
import type { HandlePosition } from "../shared/calibration-rect";
import { getResizeEdges } from "./advanced-resize-edges";
import {
  createSnapAxis,
  getBestMoveMatch,
  maybeSnap,
} from "./advanced-snap-axis";
import { getMatchSnapKey, getSnapKey } from "./advanced-snap-key";
import { clampPanelRect, clampResizedPanelRect } from "./panel-constraints";

export type { AdvancedSnapGrid } from "../../model/types";

export interface SnapResult {
  rect: PanelRect;
  snapKey: string | null;
}

const defaultColumns = 4;
const defaultRows = 5;
const minGridValue = 1;
const maxGridValue = 8;
const nearbyRowCounts = [4, 5, 6];

export function getDefaultAdvancedSnapGrid(
  outerRect: PanelRect | null,
): AdvancedSnapGrid {
  if (!outerRect) {
    return { columns: defaultColumns, rows: defaultRows };
  }

  const suggestedRows = (outerRect.height / outerRect.width) * defaultColumns;
  const bestNearbyRows = nearbyRowCounts.reduce(
    (best, candidate) =>
      Math.abs(candidate - suggestedRows) < Math.abs(best - suggestedRows)
        ? candidate
        : best,
    defaultRows,
  );
  const rows =
    Math.abs(bestNearbyRows - suggestedRows) <= 0.45
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
  const xAxis = createSnapAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createSnapAxis(outerRect.y, outerRect.height, grid.rows);
  const internalX = xAxis.lines.slice(1, -1);
  const internalY = yAxis.lines.slice(1, -1);

  if (grid.columns <= 1 && grid.rows <= 1) {
    return [];
  }

  if (grid.rows <= 1) {
    const centerY = outerRect.y + outerRect.height / 2;
    return internalX.map((x) => ({ x, y: centerY }));
  }

  if (grid.columns <= 1) {
    const centerX = outerRect.x + outerRect.width / 2;
    return internalY.map((y) => ({ x: centerX, y }));
  }

  return yAxis.lines.flatMap((y) => xAxis.lines.map((x) => ({ x, y })));
}

export function snapMovedPanelRect(
  rect: PanelRect,
  startRect: PanelRect,
  outerRect: PanelRect,
  grid: AdvancedSnapGrid,
): SnapResult {
  const xAxis = createSnapAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createSnapAxis(outerRect.y, outerRect.height, grid.rows);
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
  const xAxis = createSnapAxis(outerRect.x, outerRect.width, grid.columns);
  const yAxis = createSnapAxis(outerRect.y, outerRect.height, grid.rows);
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;
  const snapKeys: (string | null)[] = [];

  for (const edge of getResizeEdges(position)) {
    if (edge === "left") {
      const result = maybeSnap(left, startRect.x, xAxis, edge);
      left = result.value;
      snapKeys.push(getMatchSnapKey(result.match, "x"));
    }
    if (edge === "right") {
      const result = maybeSnap(right, startRect.x + startRect.width, xAxis, edge);
      right = result.value;
      snapKeys.push(getMatchSnapKey(result.match, "x"));
    }
    if (edge === "top") {
      const result = maybeSnap(top, startRect.y, yAxis, edge);
      top = result.value;
      snapKeys.push(getMatchSnapKey(result.match, "y"));
    }
    if (edge === "bottom") {
      const result = maybeSnap(bottom, startRect.y + startRect.height, yAxis, edge);
      bottom = result.value;
      snapKeys.push(getMatchSnapKey(result.match, "y"));
    }
  }

  return {
    rect: clampResizedPanelRect(
      {
        x: left,
        y: top,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top),
        radius: 0,
      },
      outerRect,
      position,
    ),
    snapKey: getSnapKey(snapKeys),
  };
}
