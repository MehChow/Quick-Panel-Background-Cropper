import { GestureDetector } from "react-native-gesture-handler";
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
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";
import { QuickPanelPreviewStage } from "./QuickPanelPreviewStage";
import { StaticQuickPanelPreview } from "./StaticQuickPanelPreview";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";

export interface QuickPanelPreviewProps {
  animatedButtonIdentifierAppearance?: AnimatedButtonIdentifierAppearance;
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  interactive?: boolean;
  showButtonIdentifiers: boolean;
  image: PickedImage;
  previewUri: string;
  preset: QuickPanelPreset;
  showAppGradientBackground?: boolean;
  transform: ImageTransform;
  onAdjustingChange: (isAdjusting: boolean) => void;
  onTransformChange: (transform: ImageTransform) => void;
  maxHeight?: number;
}

export function QuickPanelPreview({
  interactive = true,
  ...props
}: QuickPanelPreviewProps) {
  return interactive
    ? <InteractiveQuickPanelPreview {...props} />
    : <StaticQuickPanelPreview {...props} />;
}

function InteractiveQuickPanelPreview({
  animatedButtonIdentifierAppearance,
  buttonIdentifierBackgroundTheme,
  buttonIdentifierColor,
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  identifierPositions,
  image,
  previewUri,
  onAdjustingChange,
  transform,
  onTransformChange,
  preset,
  showAppGradientBackground = false,
  showButtonIdentifiers,
  maxHeight,
}: Omit<QuickPanelPreviewProps, "interactive">) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const previewFrame = getCustomizePreviewDisplayFrame(preset);
  const {
    gesture,
    handleLayout,
    layoutScale,
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

  const stage = (
    <QuickPanelPreviewStage
      animatedButtonIdentifierAppearance={animatedButtonIdentifierAppearance}
      buttonIdentifierBackgroundTheme={buttonIdentifierBackgroundTheme}
      buttonIdentifierColor={buttonIdentifierColor}
      buttonIdentifierOpacity={buttonIdentifierOpacity}
      buttonPanelOpacity={buttonPanelOpacity}
      handleLayout={handleLayout}
      identifierPositions={identifierPositions}
      image={image}
      layoutScale={layoutScale}
      preset={preset}
      previewFrame={previewFrame}
      previewRatio={previewRatio}
      previewScale={layoutScale ?? 0}
      previewUri={previewUri}
      previewWidth={previewWidth}
      showAppGradientBackground={showAppGradientBackground}
      showButtonIdentifiers={showButtonIdentifiers}
      transform={sharedTransform}
    />
  );
  return (
    <View
      className="w-full items-center"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={{ width: previewWidth }}>
        <GestureDetector gesture={gesture}>{stage}</GestureDetector>
      </View>
    </View>
  );
}
