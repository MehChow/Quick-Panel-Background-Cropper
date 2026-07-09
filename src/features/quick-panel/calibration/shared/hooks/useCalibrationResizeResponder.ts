import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelRect, PickedImage } from "../../../model/types";
import {
  clampResizedRect,
  resizeRect,
  type HandlePosition,
} from "../calibration-rect";

interface UseCalibrationResizeResponderParams {
  position: HandlePosition;
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function useCalibrationResizeResponder({
  position,
  rect,
  scale,
  screenshot,
  onRectChange,
}: UseCalibrationResizeResponderParams) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (
      _event: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      const dx = gesture.dx / scale;
      const dy = gesture.dy / scale;
      onRectChange(
        clampResizedRect(resizeRect(rect, position, dx, dy), screenshot, position),
      );
    },
  });
}
