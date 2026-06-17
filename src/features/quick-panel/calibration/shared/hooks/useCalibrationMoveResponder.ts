import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelRect, PickedImage } from "../../../model/types";
import { clampRect } from "../calibration-rect";

interface UseCalibrationMoveResponderParams {
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function useCalibrationMoveResponder({
  rect,
  scale,
  screenshot,
  onRectChange,
}: UseCalibrationMoveResponderParams) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (
      _event: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      onRectChange(
        clampRect(
          {
            ...rect,
            x: rect.x + gesture.dx / scale,
            y: rect.y + gesture.dy / scale,
          },
          screenshot,
        ),
      );
    },
  });
}
