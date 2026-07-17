import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { PanelRect } from "../../../model/types";
import {
  getAdvancedPanelMoveResult,
} from "../advanced-panel-gesture";
import type { AdvancedSnapGrid } from "../advanced-grid";
import { triggerSnapHaptic } from "../snap-haptics";

interface Params {
  draftRect: SharedValue<PanelRect>;
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function useAdvancedPanelMoveGesture({
  draftRect,
  grid,
  outerRect,
  scale,
  onChange,
}: Params) {
  const didCommit = useSharedValue(false);
  const lastSnapKey = useSharedValue<string | null>(null);
  const startRect = useSharedValue(outerRect);

  const commitDraft = () => {
    "worklet";
    if (didCommit.get()) {
      return;
    }
    didCommit.set(true);
    lastSnapKey.set(null);
    scheduleOnRN(onChange, draftRect.get());
  };

  return Gesture.Pan()
    .onBegin(() => {
      didCommit.set(false);
      lastSnapKey.set(null);
      startRect.set({ ...draftRect.get() });
    })
    .onUpdate((event) => {
      const result = getAdvancedPanelMoveResult({
        dx: event.translationX,
        dy: event.translationY,
        grid,
        outerRect,
        scale,
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
