import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import type {
  ImageTransform,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import { PanelSlice } from "./PanelSlice";
import { useQuickPanelPreviewGestures } from "../hooks/useQuickPanelPreviewGestures";

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

  return (
    <GestureDetector gesture={gesture}>
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
