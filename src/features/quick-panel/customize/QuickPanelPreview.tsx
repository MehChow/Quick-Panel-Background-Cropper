/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  getCoverScale,
  getImageBounds,
  getPanelUnion,
} from "../model/transform";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../model/types";
import { clampTransformWorklet } from "./gesture-worklets";
import { PanelSlice } from "./PanelSlice";

interface QuickPanelPreviewProps {
  image: PickedImage;
  preset: QuickPanelPreset;
  transform: ImageTransform;
  onAdjustingChange: (isAdjusting: boolean) => void;
  onTransformChange: (transform: ImageTransform) => void;
}

export function QuickPanelPreview({
  image,
  onAdjustingChange,
  transform,
  onTransformChange,
  preset,
}: QuickPanelPreviewProps) {
  const [layoutScale, setLayoutScale] = useState<number | null>(null);
  const activeGestureCount = useSharedValue(0);
  const sharedScale = useSharedValue(1);
  const sharedTransform = useSharedValue(transform);
  const startTransform = useSharedValue(transform);
  const panelUnion = getPanelUnion(preset);
  const imageBounds = getImageBounds(preset);
  const minScale = getCoverScale(image, preset);

  useEffect(() => {
    sharedTransform.value = transform;
  }, [sharedTransform, transform]);

  useEffect(() => {
    if (layoutScale) {
      sharedScale.value = layoutScale;
    }
  }, [layoutScale, sharedScale]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextScale = event.nativeEvent.layout.width / panelUnion.width;
    if (nextScale > 0) {
      setLayoutScale(nextScale);
    }
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      activeGestureCount.value += 1;
      if (activeGestureCount.value === 1) {
        scheduleOnRN(onAdjustingChange, true);
      }
      startTransform.value = sharedTransform.value;
    })
    .onUpdate((event) => {
      const next = clampTransformWorklet(
        startTransform.value.x + event.translationX / sharedScale.value,
        startTransform.value.y + event.translationY / sharedScale.value,
        sharedTransform.value.scale,
        image.width,
        image.height,
        minScale,
        imageBounds.x,
        imageBounds.y,
        imageBounds.width,
        imageBounds.height,
      );
      sharedTransform.value = next;
    })
    .onEnd(() => scheduleOnRN(onTransformChange, sharedTransform.value))
    .onFinalize(() => {
      activeGestureCount.value = Math.max(0, activeGestureCount.value - 1);
      if (activeGestureCount.value === 0) {
        scheduleOnRN(onAdjustingChange, false);
      }
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      activeGestureCount.value += 1;
      if (activeGestureCount.value === 1) {
        scheduleOnRN(onAdjustingChange, true);
      }
      startTransform.value = sharedTransform.value;
    })
    .onUpdate((event) => {
      const focalX = panelUnion.x + event.focalX / sharedScale.value;
      const focalY = panelUnion.y + event.focalY / sharedScale.value;
      const scale = Math.max(
        minScale,
        Math.min(minScale * 8, startTransform.value.scale * event.scale),
      );
      const ratio = scale / startTransform.value.scale;
      const next = clampTransformWorklet(
        focalX - (focalX - startTransform.value.x) * ratio,
        focalY - (focalY - startTransform.value.y) * ratio,
        scale,
        image.width,
        image.height,
        minScale,
        imageBounds.x,
        imageBounds.y,
        imageBounds.width,
        imageBounds.height,
      );
      sharedTransform.value = next;
    })
    .onEnd(() => scheduleOnRN(onTransformChange, sharedTransform.value))
    .onFinalize(() => {
      activeGestureCount.value = Math.max(0, activeGestureCount.value - 1);
      if (activeGestureCount.value === 0) {
        scheduleOnRN(onAdjustingChange, false);
      }
    });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
      <Animated.View
        className="w-full overflow-hidden bg-zinc-950"
        onLayout={handleLayout}
        style={{
          aspectRatio: panelUnion.width / panelUnion.height,
          opacity: 0.9,
        }}
      >
        {layoutScale
          ? preset.visualOrder.map((id) => (
              <PanelSlice
                key={id}
                panel={preset.panels[id]}
                image={image}
                layoutScale={layoutScale}
                originX={panelUnion.x}
                originY={panelUnion.y}
                previewScale={sharedScale}
                transform={sharedTransform}
              />
            ))
          : null}
      </Animated.View>
    </GestureDetector>
  );
}
