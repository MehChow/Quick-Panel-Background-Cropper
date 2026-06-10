import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { useQuickPanelPreviewGestures } from "../hooks/useQuickPanelPreviewGestures";
import { getPreviewViewportSize } from "../preview-layout";
import { PanelSlice } from "./PanelSlice";

interface QuickPanelPreviewProps {
  image: PickedImage;
  preset: QuickPanelPreset;
  transform: ImageTransform;
  onAdjustingChange: (isAdjusting: boolean) => void;
  onTransformChange: (transform: ImageTransform) => void;
}

const PREVIEW_MAX_HEIGHT_RATIO = 0.45;

export function QuickPanelPreview({
  image,
  onAdjustingChange,
  transform,
  onTransformChange,
  preset,
}: QuickPanelPreviewProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const {
    gesture,
    handleLayout,
    layoutScale,
    panelUnion,
    sharedScale,
    sharedTransform,
  } = useQuickPanelPreviewGestures({
    image,
    preset,
    transform,
    onAdjustingChange,
    onTransformChange,
  });
  const previewSize =
    containerWidth > 0
      ? getPreviewViewportSize({
          containerWidth,
          maxHeight: windowHeight * PREVIEW_MAX_HEIGHT_RATIO,
          panelUnion,
        })
      : null;

  return (
    <View
      className="w-full items-center"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      {previewSize ? (
        <GestureDetector gesture={gesture}>
          <Animated.View
            className="overflow-hidden"
            onLayout={handleLayout}
            style={{
              height: previewSize.height,
              opacity: 0.9,
              width: previewSize.width,
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
                    presetId={preset.id}
                    previewScale={sharedScale}
                    transform={sharedTransform}
                  />
                ))
              : null}
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
}
