import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from "react-native";
import type { PanelId, PanelRect } from "../../../model/types";
import { resizeRect, type HandlePosition } from "../../shared/calibration-rect";
import {
  snapResizedPanelRect,
  type AdvancedSnapGrid,
} from "../advanced-grid";
import { triggerSnapHaptic } from "../snap-haptics";

const lastSnapKeys = new Map<string, string | null>();

interface Params {
  grid: AdvancedSnapGrid;
  label: PanelId;
  outerRect: PanelRect;
  position: HandlePosition;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function useAdvancedPanelResizeResponder({
  grid,
  label,
  outerRect,
  position,
  rect,
  scale,
  onChange,
}: Params) {
  const gestureKey = `${label}:${position}`;

  return PanResponder.create({
    onStartShouldSetPanResponderCapture: () => true,
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      lastSnapKeys.set(gestureKey, null);
    },
    onPanResponderMove: (
      _event: GestureResponderEvent,
      gesture: PanResponderGestureState,
    ) => {
      const resized = resizeRect(
        rect,
        position,
        gesture.dx / scale,
        gesture.dy / scale,
      );
      const result = snapResizedPanelRect(
        resized,
        rect,
        outerRect,
        grid,
        position,
      );
      if (result.snapKey && result.snapKey !== lastSnapKeys.get(gestureKey)) {
        triggerSnapHaptic();
      }
      lastSnapKeys.set(gestureKey, result.snapKey);
      onChange(result.rect);
    },
    onPanResponderRelease: () => {
      lastSnapKeys.set(gestureKey, null);
    },
    onPanResponderTerminate: () => {
      lastSnapKeys.set(gestureKey, null);
    },
  });
}
