import { useEffect, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { getCoverScale } from "../../model/image-placement";
import { getImagePlacementBounds } from "../../model/panel-geometry";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import {
  clampTransformWorklet,
  getPinchTransformWorklet,
} from "../worklets/gesture-worklets";

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
  const hasPinchStarted = useSharedValue(false);
  const isPinching = useSharedValue(false);
  const shouldRebasePinch = useSharedValue(false);
  const pinchStartGestureScale = useSharedValue(1);
  const pinchStartFocalX = useSharedValue(0);
  const pinchStartFocalY = useSharedValue(0);
  const pinchStartTransform = useSharedValue(transform);
  const sharedScale = useSharedValue(1);
  const sharedTransform = useSharedValue(transform);
  const panelUnion = preset.customizationArea;
  const imageBounds = getImagePlacementBounds(preset);
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
    .onChange((event) => {
      if (isPinching.get()) {
        return;
      }
      const currentTransform = sharedTransform.get();
      const scale = sharedScale.get();
      sharedTransform.set(
        clampTransformWorklet(
          currentTransform.x + event.changeX / scale,
          currentTransform.y + event.changeY / scale,
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
    .onStart((event) => {
      const scaleFactor = sharedScale.get();
      hasPinchStarted.set(true);
      isPinching.set(true);
      shouldRebasePinch.set(false);
      pinchStartGestureScale.set(event.scale);
      pinchStartTransform.set(sharedTransform.get());
      pinchStartFocalX.set(panelUnion.x + event.focalX / scaleFactor);
      pinchStartFocalY.set(panelUnion.y + event.focalY / scaleFactor);
    })
    .onTouchesDown((event) => {
      if (hasPinchStarted.get() && event.numberOfTouches === 2) {
        isPinching.set(true);
        shouldRebasePinch.set(true);
      }
    })
    .onTouchesUp((event) => {
      if (event.numberOfTouches === 1) {
        isPinching.set(false);
        shouldRebasePinch.set(false);
      }
    })
    .onUpdate((event) => {
      if (!isPinching.get()) {
        return;
      }
      const scaleFactor = sharedScale.get();
      const focalX = panelUnion.x + event.focalX / scaleFactor;
      const focalY = panelUnion.y + event.focalY / scaleFactor;
      if (shouldRebasePinch.get()) {
        shouldRebasePinch.set(false);
        pinchStartGestureScale.set(event.scale);
        pinchStartTransform.set(sharedTransform.get());
        pinchStartFocalX.set(focalX);
        pinchStartFocalY.set(focalY);
        return;
      }
      sharedTransform.set(
        getPinchTransformWorklet({
          focalX,
          focalY,
          gestureScale: event.scale / pinchStartGestureScale.get(),
          imageHeight: image.height,
          imageWidth: image.width,
          minScale,
          startFocalX: pinchStartFocalX.get(),
          startFocalY: pinchStartFocalY.get(),
          startTransform: pinchStartTransform.get(),
          unionHeight: imageBounds.height,
          unionWidth: imageBounds.width,
          unionX: imageBounds.x,
          unionY: imageBounds.y,
        }),
      );
    })
    .onEnd(() => scheduleOnRN(onTransformChange, sharedTransform.get()))
    .onFinalize(() => {
      hasPinchStarted.set(false);
      isPinching.set(false);
      shouldRebasePinch.set(false);
      onGestureFinalize();
    });

  return {
    gesture: Gesture.Simultaneous(pan, pinch),
    handleLayout,
    layoutScale,
    panelUnion,
    sharedScale,
    sharedTransform,
  };
}
