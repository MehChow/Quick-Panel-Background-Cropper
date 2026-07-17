import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { useQuickPanelPreviewGestures } from "../hooks/useQuickPanelPreviewGestures";
import { PanelSlice } from "./PanelSlice";

interface QuickPanelPreviewProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  showButtonIdentifiers: boolean;
  image: PickedImage;
  preset: QuickPanelPreset;
  transform: ImageTransform;
  onAdjustingChange: (isAdjusting: boolean) => void;
  onTransformChange: (transform: ImageTransform) => void;
}

export function QuickPanelPreview({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  identifierPositions,
  image,
  onAdjustingChange,
  transform,
  onTransformChange,
  preset,
  showButtonIdentifiers,
}: QuickPanelPreviewProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
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
  const previewRatio = panelUnion.width / panelUnion.height;
  const horizontalPadding = 40;
  const widthBasis = containerWidth || windowWidth;
  const previewWidthBudget = Math.max(0, (widthBasis - horizontalPadding) * 0.75);
  const previewHeightBudget = windowHeight * 0.46;
  const previewWidth = Math.min(
    previewWidthBudget,
    previewHeightBudget * previewRatio,
  );

  return (
    <View
      className="w-full items-center"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          onLayout={handleLayout}
          style={{
            aspectRatio: previewRatio,
            opacity: 0.9,
            width: previewWidth,
          }}
        >
          {layoutScale
            ? preset.visualOrder.map((id) => (
                <PanelSlice
                  buttonIdentifierOpacity={buttonIdentifierOpacity}
                  buttonPanelOpacity={buttonPanelOpacity}
                  identifierPositions={identifierPositions}
                  key={id}
                  showOverlay
                  showButtonIdentifiers={showButtonIdentifiers}
                  mode={preset.mode}
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
    </View>
  );
}
