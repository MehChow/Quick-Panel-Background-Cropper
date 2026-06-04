import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelRect } from "../../model/types";
import { clampPanelRect } from "../panel-constraints";

interface Params {
  outerRect: PanelRect;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function useAdvancedPanelMoveResponder({
  outerRect,
  rect,
  scale,
  onChange,
}: Params) {
  let startRect = rect;

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startRect = rect;
    },
    onPanResponderMove: (
      _event: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      const start = startRect;
      onChange(clampPanelRect({
        ...start,
        x: start.x + gesture.dx / scale,
        y: start.y + gesture.dy / scale,
      }, outerRect));
    },
  });
}
