import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelRect } from "../../model/types";
import { resizeRect, type HandlePosition } from "../../calibration/calibration-rect";
import { clampPanelRect } from "../panel-constraints";

interface Params {
  outerRect: PanelRect;
  position: HandlePosition;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function useAdvancedPanelResizeResponder({
  outerRect,
  position,
  rect,
  scale,
  onChange,
}: Params) {
  let startRect = rect;

  return PanResponder.create({
    onStartShouldSetPanResponderCapture: () => true,
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startRect = rect;
    },
    onPanResponderMove: (
      _event: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      const resized = resizeRect(
        startRect,
        position,
        gesture.dx / scale,
        gesture.dy / scale,
      );
      onChange(clampPanelRect(resized, outerRect));
    },
  });
}
