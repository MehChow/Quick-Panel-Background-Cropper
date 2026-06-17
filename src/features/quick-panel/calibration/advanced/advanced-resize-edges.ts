import type { HandlePosition } from "../shared/calibration-rect";
import type { SnapEdge } from "./advanced-snap-axis";

const resizeEdgesByHandle: Record<HandlePosition, SnapEdge[]> = {
  bottom: ["bottom"],
  bottomLeft: ["left", "bottom"],
  bottomRight: ["right", "bottom"],
  left: ["left"],
  right: ["right"],
  top: ["top"],
  topLeft: ["left", "top"],
  topRight: ["right", "top"],
};

export function getResizeEdges(position: HandlePosition) {
  return resizeEdgesByHandle[position];
}
