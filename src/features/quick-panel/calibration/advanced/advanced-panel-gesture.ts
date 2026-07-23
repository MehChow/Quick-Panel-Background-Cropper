import type { PanelRect } from "../../model/types";
import { resizeRect, type HandlePosition } from "../shared/calibration-rect";
import {
  snapMovedPanelRect,
  snapResizedPanelRect,
  type AdvancedSnapGrid,
  type SnapResult,
} from "./advanced-grid";
import {
  clampPanelRect,
  clampResizedPanelRect,
} from "./panel-constraints";

export interface AdvancedPanelMoveInput {
  dx: number;
  dy: number;
  grid: AdvancedSnapGrid;
  isGridEnabled: boolean;
  outerRect: PanelRect;
  scale: number;
  startRect: PanelRect;
}

export interface AdvancedPanelResizeInput extends AdvancedPanelMoveInput {
  position: HandlePosition;
}

export function getAdvancedPanelMoveResult({
  dx,
  dy,
  grid,
  isGridEnabled,
  outerRect,
  scale,
  startRect,
}: AdvancedPanelMoveInput): SnapResult {
  "worklet";
  const movedRect = {
    ...startRect,
    x: startRect.x + dx / scale,
    y: startRect.y + dy / scale,
  };
  if (!isGridEnabled) {
    return {
      rect: clampPanelRect(movedRect, outerRect),
      snapKey: null,
    };
  }
  return snapMovedPanelRect(movedRect, startRect, outerRect, grid);
}

export function getAdvancedPanelResizeResult({
  dx,
  dy,
  grid,
  isGridEnabled,
  outerRect,
  position,
  scale,
  startRect,
}: AdvancedPanelResizeInput): SnapResult {
  "worklet";
  const resizedRect = resizeRect(
    startRect,
    position,
    dx / scale,
    dy / scale,
  );
  if (!isGridEnabled) {
    return {
      rect: clampResizedPanelRect(resizedRect, outerRect, position),
      snapKey: null,
    };
  }
  return snapResizedPanelRect(
    resizedRect,
    startRect,
    outerRect,
    grid,
    position,
  );
}
