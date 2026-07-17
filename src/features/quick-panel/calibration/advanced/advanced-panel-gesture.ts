import type { PanelRect } from "../../model/types";
import { resizeRect, type HandlePosition } from "../shared/calibration-rect";
import {
  snapMovedPanelRect,
  snapResizedPanelRect,
  type AdvancedSnapGrid,
  type SnapResult,
} from "./advanced-grid";

export interface AdvancedPanelMoveInput {
  dx: number;
  dy: number;
  grid: AdvancedSnapGrid;
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
  outerRect,
  scale,
  startRect,
}: AdvancedPanelMoveInput): SnapResult {
  "worklet";
  return snapMovedPanelRect(
    {
      ...startRect,
      x: startRect.x + dx / scale,
      y: startRect.y + dy / scale,
    },
    startRect,
    outerRect,
    grid,
  );
}

export function getAdvancedPanelResizeResult({
  dx,
  dy,
  grid,
  outerRect,
  position,
  scale,
  startRect,
}: AdvancedPanelResizeInput): SnapResult {
  "worklet";
  return snapResizedPanelRect(
    resizeRect(startRect, position, dx / scale, dy / scale),
    startRect,
    outerRect,
    grid,
    position,
  );
}
