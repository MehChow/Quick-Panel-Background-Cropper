import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelRect } from "../../../model/types";
import {
  snapMovedPanelRect,
  type AdvancedSnapGrid,
} from "../advanced-grid";

interface Params {
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function useAdvancedPanelMoveResponder({
  grid,
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
      onChange(snapMovedPanelRect({
        ...start,
        x: start.x + gesture.dx / scale,
        y: start.y + gesture.dy / scale,
      }, start, outerRect, grid));
    },
  });
}
