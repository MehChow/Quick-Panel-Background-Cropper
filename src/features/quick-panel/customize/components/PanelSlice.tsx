import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { ButtonIdentifierPositions } from "../../model/button-identifier-layout";
import type {
  CustomizationMode,
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";
import { getPanelImageTransform } from "../panel-image-transform";
import { getPreviewPanelRadius } from "../preview-geometry";
import { PanelOverlay } from "./PanelOverlay";
import { ButtonIdentifierOverlay } from "./ButtonIdentifierOverlay";

interface PanelSliceProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  identifierPositions: ButtonIdentifierPositions;
  showButtonIdentifiers: boolean;
  showOverlay: boolean;
  mode: CustomizationMode;
  panel: PanelDefinition;
  image: PickedImage;
  layoutScale: number;
  originX: number;
  originY: number;
  previewScale: SharedValue<number>;
  previewUri: string;
  transform: SharedValue<ImageTransform>;
}

export function PanelSlice({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  identifierPositions,
  showButtonIdentifiers,
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
  const imageStyle = useAnimatedStyle(() => {
    const placement = getPanelImageTransform({
      panelX: panel.rect.x,
      panelY: panel.rect.y,
      previewScale: previewScale.get(),
      transform: transform.get(),
    });
    return {
      transform: [
        { translateX: placement.translateX },
        { translateY: placement.translateY },
        { scale: placement.scale },
      ],
    };
  });

  return (
    <View
      className="absolute overflow-hidden bg-white/10"
      style={{
        borderRadius: panelRadius,
        height: panel.rect.height * layoutScale,
        left: (panel.rect.x - originX) * layoutScale,
        top: (panel.rect.y - originY) * layoutScale,
        width: panel.rect.width * layoutScale,
      }}
      testID={`panel-slice-${panel.id}`}
    >
      <Animated.View style={[styles.image, imageStyle]}>
        <Image
          cachePolicy="memory-disk"
          contentFit="fill"
          source={{ uri: previewUri }}
          style={{
            height: image.height,
            opacity: panel.family === "button" ? buttonPanelOpacity : 0.5,
            width: image.width,
          }}
        />
      </Animated.View>
      {panel.family === "button" && panel.buttonIdentifier ? (
        <ButtonIdentifierOverlay
          bounds={{
            x: 0,
            y: 0,
            width: panel.rect.width * layoutScale,
            height: panel.rect.height * layoutScale,
          }}
          identifier={panel.buttonIdentifier}
          label={panel.label}
          opacity={showButtonIdentifiers ? buttonIdentifierOpacity : 0}
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

const styles = StyleSheet.create({
  image: {
    left: 0,
    position: "absolute",
    top: 0,
    transformOrigin: [0, 0, 0],
  },
});
