import { useState } from "react";
import {
  type LayoutChangeEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { getCustomizePreviewDisplayFrame } from "../preview-geometry";
import type { QuickPanelPreviewProps } from "./QuickPanelPreview";
import { QuickPanelPreviewStage } from "./QuickPanelPreviewStage";

export function StaticQuickPanelPreview({
  animatedButtonIdentifierAppearance,
  buttonIdentifierBackgroundTheme,
  buttonIdentifierColor,
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  identifierPositions,
  image,
  maxHeight,
  preset,
  previewUri,
  showAppGradientBackground = false,
  showButtonIdentifiers,
  transform,
}: Omit<QuickPanelPreviewProps, "interactive">) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const [layoutScale, setLayoutScale] = useState<number | null>(null);
  const previewFrame = getCustomizePreviewDisplayFrame(preset);
  const previewRatio = previewFrame.width / previewFrame.height;
  const previewWidth = Math.min(
    containerWidth || windowWidth,
    (maxHeight ?? windowHeight * 0.46) * previewRatio,
  );
  const handleLayout = (event: LayoutChangeEvent) => {
    const nextScale = event.nativeEvent.layout.width / previewFrame.width;
    if (nextScale > 0) {
      setLayoutScale(nextScale);
    }
  };

  return (
    <View
      className="w-full items-center"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <View style={{ width: previewWidth }}>
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
          transform={transform}
        />
      </View>
    </View>
  );
}
