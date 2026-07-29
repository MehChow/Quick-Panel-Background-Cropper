import Animated, { type SharedValue } from "react-native-reanimated";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { AppGradientBackground } from "../../shared/AppGradientBackground";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type {
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "../../model/types";
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";
import { PanelSlice } from "./PanelSlice";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";
import { getPreviewPanelFrameStyle } from "../preview-geometry";

interface QuickPanelPreviewStageProps {
  animatedButtonIdentifierAppearance?: AnimatedButtonIdentifierAppearance;
  buttonIdentifierBackgroundTheme: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  handleLayout: (event: LayoutChangeEvent) => void;
  identifierPositions: ButtonIdentifierPositions;
  image: PickedImage;
  layoutScale: number | null;
  previewFrame: PanelRect;
  previewRatio: number;
  previewScale: SharedValue<number> | number;
  previewUri: string;
  previewWidth: number;
  preset: QuickPanelPreset;
  showAppGradientBackground?: boolean;
  showButtonIdentifiers: boolean;
  transform: SharedValue<ImageTransform> | ImageTransform;
}

export function QuickPanelPreviewStage(props: QuickPanelPreviewStageProps) {
  const layoutScale = props.layoutScale;
  return (
    <Animated.View
      onLayout={props.handleLayout}
      style={{
        aspectRatio: props.previewRatio,
        overflow: "hidden",
        width: props.previewWidth,
      }}
      testID="quick-panel-preview-stage"
    >
      {props.showAppGradientBackground && layoutScale
        ? props.preset.visualOrder.map((id) => {
          const panel = props.preset.panels[id];
          return (
            <View
              className="absolute overflow-hidden"
              key={`gradient-${id}`}
              pointerEvents="none"
              style={getPreviewPanelFrameStyle(
                panel.rect,
                layoutScale,
                props.previewFrame.x,
                props.previewFrame.y,
              )}
              testID={`panel-gradient-backdrop-${id}`}
            >
              <AppGradientBackground />
            </View>
          );
        })
        : null}
      <View style={styles.content} testID="quick-panel-preview-content">
        {layoutScale ? props.preset.visualOrder.map((id) => (
          <PanelSlice
            animatedButtonIdentifierAppearance={props.animatedButtonIdentifierAppearance}
            buttonIdentifierBackgroundTheme={props.buttonIdentifierBackgroundTheme}
            buttonIdentifierColor={props.buttonIdentifierColor}
            buttonIdentifierOpacity={props.buttonIdentifierOpacity}
            buttonPanelOpacity={props.buttonPanelOpacity}
            identifierPositions={props.identifierPositions}
            image={props.image}
            key={id}
            layoutScale={layoutScale}
            mode={props.preset.mode}
            originX={props.previewFrame.x}
            originY={props.previewFrame.y}
            panel={props.preset.panels[id]}
            previewScale={props.previewScale}
            previewUri={props.previewUri}
            showButtonIdentifiers={props.showButtonIdentifiers}
            showOverlay
            transform={props.transform}
          />
        )) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    bottom: 0,
    left: 0,
    opacity: 0.9,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
