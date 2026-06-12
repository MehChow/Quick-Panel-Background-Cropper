import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelId, PanelRect } from "../../../model/types";
import {
  snapMovedPanelRect,
  type AdvancedSnapGrid,
} from "../advanced-grid";
import { triggerSnapHaptic } from "../snap-haptics";

const lastSnapKeys = new Map<PanelId, string | null>();

interface Params {
  grid: AdvancedSnapGrid;
  label: PanelId;
  outerRect: PanelRect;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function useAdvancedPanelMoveResponder({
  grid,
  label,
  outerRect,
  rect,
  scale,
  onChange,
}: Params) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      lastSnapKeys.set(label, null);
    },
    onPanResponderMove: (
      _event: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      const start = rect;
      const result = snapMovedPanelRect({
        ...start,
        x: start.x + gesture.dx / scale,
        y: start.y + gesture.dy / scale,
      }, start, outerRect, grid);
      if (result.snapKey && result.snapKey !== lastSnapKeys.get(label)) {
        triggerSnapHaptic();
      }
      lastSnapKeys.set(label, result.snapKey);
      onChange(result.rect);
    },
    onPanResponderRelease: () => {
      lastSnapKeys.set(label, null);
    },
    onPanResponderTerminate: () => {
      lastSnapKeys.set(label, null);
    },
  });
}
