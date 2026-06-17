import { useEffect, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { getCoverScale } from "../../model/image-placement";
import { getImageBounds } from "../../model/panel-geometry";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { clampTransformWorklet } from "../worklets/gesture-worklets";

interface UseQuickPanelPreviewGesturesParams {
  image: PickedImage;
  preset: QuickPanelPreset;
  transform: ImageTransform;
  onAdjustingChange: (isAdjusting: boolean) => void;
  onTransformChange: (transform: ImageTransform) => void;
}

export function useQuickPanelPreviewGestures({
  image,
  preset,
  transform,
  onAdjustingChange,
  onTransformChange,
}: UseQuickPanelPreviewGesturesParams) {
  const [layoutScale, setLayoutScale] = useState<number | null>(null);
  const activeGestureCount = useSharedValue(0);
  const sharedScale = useSharedValue(1);
  const sharedTransform = useSharedValue(transform);
  const startTransform = useSharedValue(transform);
  const panelUnion = preset.customizationArea;
  const imageBounds = getImageBounds(preset);
  const minScale = getCoverScale(image, preset);

  useEffect(() => {
    sharedTransform.set(transform);
  }, [sharedTransform, transform]);

  useEffect(() => {
    if (layoutScale) {
      sharedScale.set(layoutScale);
    }
  }, [layoutScale, sharedScale]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextScale = event.nativeEvent.layout.width / panelUnion.width;
    if (nextScale > 0) {
      setLayoutScale(nextScale);
    }
  };

  const onGestureBegin = () => {
    const nextCount = activeGestureCount.get() + 1;
    activeGestureCount.set(nextCount);
    if (nextCount === 1) {
      scheduleOnRN(onAdjustingChange, true);
    }
    startTransform.set(sharedTransform.get());
  };

  const onGestureFinalize = () => {
    const nextCount = Math.max(0, activeGestureCount.get() - 1);
    activeGestureCount.set(nextCount);
    if (nextCount === 0) {
      scheduleOnRN(onAdjustingChange, false);
    }
  };

  const pan = Gesture.Pan()
    .onBegin(onGestureBegin)
    .onUpdate((event) => {
      const start = startTransform.get();
      const currentTransform = sharedTransform.get();
      const scale = sharedScale.get();
      sharedTransform.set(
        clampTransformWorklet(
          start.x + event.translationX / scale,
          start.y + event.translationY / scale,
          currentTransform.scale,
          image.width,
          image.height,
          minScale,
          imageBounds.x,
          imageBounds.y,
          imageBounds.width,
          imageBounds.height,
        ),
      );
    })
    .onEnd(() => scheduleOnRN(onTransformChange, sharedTransform.get()))
    .onFinalize(onGestureFinalize);

  const pinch = Gesture.Pinch()
    .onBegin(onGestureBegin)
    .onUpdate((event) => {
      const start = startTransform.get();
      const scaleFactor = sharedScale.get();
      const focalX = panelUnion.x + event.focalX / scaleFactor;
      const focalY = panelUnion.y + event.focalY / scaleFactor;
      const scale = Math.max(minScale, Math.min(minScale * 8, start.scale * event.scale));
      const ratio = scale / start.scale;
      sharedTransform.set(
        clampTransformWorklet(
          focalX - (focalX - start.x) * ratio,
          focalY - (focalY - start.y) * ratio,
          scale,
          image.width,
          image.height,
          minScale,
          imageBounds.x,
          imageBounds.y,
          imageBounds.width,
          imageBounds.height,
        ),
      );
    })
    .onEnd(() => scheduleOnRN(onTransformChange, sharedTransform.get()))
    .onFinalize(onGestureFinalize);

  return {
    gesture: Gesture.Simultaneous(pan, pinch),
    handleLayout,
    layoutScale,
    panelUnion,
    sharedScale,
    sharedTransform,
  };
}
