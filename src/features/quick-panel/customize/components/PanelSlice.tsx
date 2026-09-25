import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import type {
  CustomizationMode,
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";
import { PreviewPanelImage } from "./PreviewPanelImage";
import {
  getPreviewPanelFrameStyle,
  getPreviewPanelRadius,
} from "../preview-geometry";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";
import { PanelOverlay } from "./PanelOverlay";
import { ButtonIdentifierOverlay } from "./ButtonIdentifierOverlay";
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";

interface PanelSliceProps {
  animatedButtonIdentifierAppearance?: AnimatedButtonIdentifierAppearance;
  buttonIdentifierBackgroundTheme?: ButtonIdentifierBackgroundTheme;
  buttonIdentifierColor?: string;
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  buttonIdentifierContentMode: ButtonIdentifierContentMode;
  showOverlay: boolean;
  mode: CustomizationMode;
  panel: PanelDefinition;
  image: PickedImage;
  layoutScale: number;
  originX: number;
  originY: number;
  previewScale: SharedValue<number> | number;
  previewUri: string;
  transform: SharedValue<ImageTransform> | ImageTransform;
}

export function PanelSlice({
  animatedButtonIdentifierAppearance,
  buttonIdentifierBackgroundTheme = "dark",
  buttonIdentifierColor = "#FFFFFF",
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  identifierPositions,
  buttonIdentifierContentMode,
  showOverlay,
  mode,
  panel,
  image,
  layoutScale,
  originX,
  originY,
  previewScale,
  previewUri,
  transform,
}: PanelSliceProps) {
  const panelRadius = getPreviewPanelRadius(panel.rect, layoutScale);

  return (
    <View
      className="absolute overflow-hidden bg-white/10"
      style={getPreviewPanelFrameStyle(
        panel.rect,
        layoutScale,
        originX,
        originY,
      )}
      testID={`panel-slice-${panel.id}`}
    >
      <PreviewPanelImage
        image={image}
        opacity={panel.family === "button" ? buttonPanelOpacity : 0.5}
        panelX={panel.rect.x}
        panelY={panel.rect.y}
        previewScale={previewScale}
        previewUri={previewUri}
        transform={transform}
      />
      {buttonIdentifierContentMode !== "none"
        && panel.family === "button"
        && panel.buttonIdentifier ? (
        <ButtonIdentifierOverlay
          animatedAppearance={animatedButtonIdentifierAppearance}
          backgroundTheme={buttonIdentifierBackgroundTheme}
          bounds={{
            x: 0,
            y: 0,
            width: panel.rect.width * layoutScale,
            height: panel.rect.height * layoutScale,
          }}
          color={buttonIdentifierColor}
          identifier={panel.buttonIdentifier}
          label={panel.label}
          opacity={buttonIdentifierOpacity}
          contentMode={buttonIdentifierContentMode}
          positions={identifierPositions}
          referenceCellSize={panel.buttonIdentifier.referenceCellSize * layoutScale}
        />
      ) : null}
      {showOverlay ? (
        <PanelOverlay
          height={panel.rect.height * layoutScale}
          mode={mode}
          panelId={panel.id}
          width={panel.rect.width * layoutScale}
        />
      ) : null}
      <View
        className="absolute inset-0"
        pointerEvents="none"
        style={{
          borderColor: "rgba(255,255,255,0.9)",
          borderRadius: panelRadius,
          borderWidth: 1,
        }}
        testID={`panel-slice-frame-${panel.id}`}
      />
    </View>
  );
}
