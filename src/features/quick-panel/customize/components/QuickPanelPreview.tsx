import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { useQuickPanelPreviewGestures } from "../hooks/useQuickPanelPreviewGestures";
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
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
  const previewWidthBudget = Math.max(0, (windowWidth - horizontalPadding) * 0.75);
  const previewHeightBudget = windowHeight * 0.46;
  const previewWidth = Math.min(
    previewWidthBudget,
    previewHeightBudget * previewRatio,
  );

  return (
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
                key={id}
                showOverlay
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
  );
}
