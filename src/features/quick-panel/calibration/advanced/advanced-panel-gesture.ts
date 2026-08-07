import type { PanelRect } from "../../model/types";
import { resizeRect, type HandlePosition } from "../shared/calibration-rect";
import {
  snapMovedPanelRect,
  snapResizedPanelRect,
  type AdvancedSnapGrid,
  type SnapResult,
} from "./advanced-grid";
import type { SnapSensitivity } from "../../model/snap-sensitivity";

export interface AdvancedPanelMoveInput {
  dx: number;
  dy: number;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  scale: number;
  snapSensitivity: SnapSensitivity;
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
  snapSensitivity,
  startRect,
}: AdvancedPanelMoveInput): SnapResult {
  "worklet";
  const movedRect = {
    ...startRect,
    x: startRect.x + dx / scale,
    y: startRect.y + dy / scale,
  };
  return snapMovedPanelRect(
    movedRect,
    startRect,
    outerRect,
    grid,
    scale,
    snapSensitivity,
  );
}

export function getAdvancedPanelResizeResult({
  dx,
  dy,
  grid,
  outerRect,
  position,
  scale,
  snapSensitivity,
  startRect,
}: AdvancedPanelResizeInput): SnapResult {
  "worklet";
  const resizedRect = resizeRect(
    startRect,
    position,
    dx / scale,
    dy / scale,
  );
  return snapResizedPanelRect(
    resizedRect,
    startRect,
    outerRect,
    grid,
    scale,
    snapSensitivity,
    position,
  );
}
