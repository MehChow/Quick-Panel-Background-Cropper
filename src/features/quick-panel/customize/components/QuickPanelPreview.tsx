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
import { getCustomizePreviewDisplayFrame } from "../preview-geometry";
import { PanelSlice } from "./PanelSlice";

interface QuickPanelPreviewProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  showButtonIdentifiers: boolean;
  image: PickedImage;
  previewUri: string;
  preset: QuickPanelPreset;
  transform: ImageTransform;
  onAdjustingChange: (isAdjusting: boolean) => void;
  onTransformChange: (transform: ImageTransform) => void;
  maxHeight?: number;
}

export function QuickPanelPreview({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  identifierPositions,
  image,
  previewUri,
  onAdjustingChange,
  transform,
  onTransformChange,
  preset,
  showButtonIdentifiers,
  maxHeight,
}: QuickPanelPreviewProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const previewFrame = getCustomizePreviewDisplayFrame(preset);
  const {
    gesture,
    handleLayout,
    layoutScale,
    sharedScale,
    sharedTransform,
  } = useQuickPanelPreviewGestures({
    image,
    preset,
    previewFrame,
    transform,
    onAdjustingChange,
    onTransformChange,
  });
  const previewRatio = previewFrame.width / previewFrame.height;
  const horizontalPadding = 0;
  const widthBasis = containerWidth || windowWidth;
  const previewWidthBudget = Math.max(0, widthBasis - horizontalPadding);
  const previewHeightBudget = maxHeight ?? windowHeight * 0.46;
  const previewWidth = Math.min(
    previewWidthBudget,
    previewHeightBudget * previewRatio,
  );

  return (
    <View
      className="w-full items-center"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={{ width: previewWidth }}>
        <GestureDetector gesture={gesture}>
          <Animated.View
            onLayout={handleLayout}
            style={{
              aspectRatio: previewRatio,
              opacity: 0.9,
              overflow: "hidden",
              width: previewWidth,
            }}
            testID="quick-panel-preview-stage"
          >
            {layoutScale
              ? preset.visualOrder.map((id) => (
                  <PanelSlice
                    buttonIdentifierOpacity={buttonIdentifierOpacity}
                    buttonPanelOpacity={buttonPanelOpacity}
                    identifierPositions={identifierPositions}
                    image={image}
                    key={id}
                    layoutScale={layoutScale}
                    mode={preset.mode}
                    originX={previewFrame.x}
                    originY={previewFrame.y}
                    panel={preset.panels[id]}
                    previewScale={sharedScale}
                    previewUri={previewUri}
                    showButtonIdentifiers={showButtonIdentifiers}
                    showOverlay
                    transform={sharedTransform}
                  />
                ))
              : null}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
