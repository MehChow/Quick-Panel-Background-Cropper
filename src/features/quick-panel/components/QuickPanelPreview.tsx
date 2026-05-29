/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { s25PlusOneUi85Preset } from "../preset";
import { getCoverScale, getImageBounds, getPanelUnion } from "../transform";
import type { ImageTransform, PickedImage } from "../types";
import { PanelSlice } from "./PanelSlice";

interface QuickPanelPreviewProps {
  image: PickedImage;
  transform: ImageTransform;
  onTransformChange: (transform: ImageTransform) => void;
}

export function QuickPanelPreview({
  image,
  transform,
  onTransformChange,
}: QuickPanelPreviewProps) {
  const [layoutScale, setLayoutScale] = useState(1);
  const sharedScale = useSharedValue(layoutScale);
  const sharedTransform = useSharedValue(transform);
  const startTransform = useSharedValue(transform);
  const panelUnion = getPanelUnion();
  const imageBounds = getImageBounds();
  const minScale = getCoverScale(image);

  useEffect(() => {
    sharedTransform.value = transform;
  }, [sharedTransform, transform]);

  useEffect(() => {
    sharedScale.value = layoutScale;
  }, [layoutScale, sharedScale]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setLayoutScale(event.nativeEvent.layout.width / panelUnion.width);
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTransform.value = sharedTransform.value;
    })
    .onUpdate((event) => {
      const next = clampWorklet(
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
    .onEnd(() => {
      scheduleOnRN(onTransformChange, sharedTransform.value);
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
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
      const next = clampWorklet(
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
    .onEnd(() => {
      scheduleOnRN(onTransformChange, sharedTransform.value);
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
        {s25PlusOneUi85Preset.visualOrder.map((id) => (
          <PanelSlice
            key={id}
            panel={s25PlusOneUi85Preset.panels[id]}
            image={image}
            layoutScale={layoutScale}
            originX={panelUnion.x}
            originY={panelUnion.y}
            previewScale={sharedScale}
            transform={sharedTransform}
          />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}

function clampWorklet(
  x: number,
  y: number,
  scale: number,
  imageWidth: number,
  imageHeight: number,
  minScale: number,
  unionX: number,
  unionY: number,
  unionWidth: number,
  unionHeight: number,
) {
  "worklet";
  const safeScale = Math.max(minScale, scale);
  const width = imageWidth * safeScale;
  const height = imageHeight * safeScale;
  return {
    scale: safeScale,
    x: Math.max(unionX + unionWidth - width, Math.min(unionX, x)),
    y: Math.max(unionY + unionHeight - height, Math.min(unionY, y)),
  };
}
