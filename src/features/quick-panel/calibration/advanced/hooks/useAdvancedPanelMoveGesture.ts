import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { PanelId, PanelRect } from "../../../model/types";
import {
  getAdvancedPanelMoveResult,
} from "../advanced-panel-gesture";
import type { AdvancedSnapGrid } from "../advanced-grid";
import type { SnapSensitivity } from "../../../model/snap-sensitivity";
import { triggerSnapHaptic } from "../snap-haptics";

interface Params {
  draftRect: SharedValue<PanelRect>;
  gestureToken: SharedValue<number>;
  grid: AdvancedSnapGrid;
  label: PanelId;
  outerRect: PanelRect;
  scale: number;
  snapSensitivity: SnapSensitivity;
  onGestureBegin: (panelId: PanelId, token: number) => void;
  onGestureCommit: (panelId: PanelId, token: number, rect: PanelRect) => void;
}

export function useAdvancedPanelMoveGesture({
  draftRect,
  gestureToken,
  grid,
  label,
  outerRect,
  scale,
  snapSensitivity,
  onGestureBegin,
  onGestureCommit,
}: Params) {
  const didCommit = useSharedValue(false);
  const lastSnapKey = useSharedValue<string | null>(null);
  const startRect = useSharedValue(outerRect);
  const currentToken = useSharedValue(0);

  const commitDraft = () => {
    "worklet";
    if (didCommit.get()) {
      return;
    }
    didCommit.set(true);
    lastSnapKey.set(null);
    scheduleOnRN(onGestureCommit, label, currentToken.get(), draftRect.get());
  };

  return Gesture.Pan()
    .onBegin(() => {
      const token = gestureToken.get() + 1;
      gestureToken.set(token);
      currentToken.set(token);
      didCommit.set(false);
      lastSnapKey.set(null);
      startRect.set({ ...draftRect.get() });
      scheduleOnRN(onGestureBegin, label, token);
    })
    .onUpdate((event) => {
      const result = getAdvancedPanelMoveResult({
        dx: event.translationX,
        dy: event.translationY,
        grid,
        outerRect,
        scale,
        snapSensitivity,
        startRect: startRect.get(),
      });
      draftRect.set(result.rect);
      if (result.snapKey && result.snapKey !== lastSnapKey.get()) {
        scheduleOnRN(triggerSnapHaptic);
      }
      lastSnapKey.set(result.snapKey);
    })
    .onEnd(commitDraft)
    .onFinalize((_event, success) => {
      if (!success) {
        commitDraft();
      }
      lastSnapKey.set(null);
    });
}
