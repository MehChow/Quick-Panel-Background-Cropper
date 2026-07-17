import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import type {
  CustomizationMode,
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";
import { PanelOverlay } from "./PanelOverlay";
import { ButtonIdentifierOverlay } from "./ButtonIdentifierOverlay";

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PanelSliceProps {
  buttonIdentifierOpacity: number;
  buttonPanelOpacity: number;
  showButtonIdentifiers: boolean;
  showOverlay: boolean;
  mode: CustomizationMode;
  panel: PanelDefinition;
  image: PickedImage;
  layoutScale: number;
  originX: number;
  originY: number;
  previewScale: SharedValue<number>;
  transform: SharedValue<ImageTransform>;
}

export function PanelSlice({
  buttonIdentifierOpacity,
  buttonPanelOpacity,
  showButtonIdentifiers,
  showOverlay,
  mode,
  panel,
  image,
  layoutScale,
  originX,
  originY,
  previewScale,
  transform,
}: PanelSliceProps) {
  const imageStyle = useAnimatedStyle(() => ({
    height: image.height * transform.value.scale * previewScale.value,
    left: (transform.value.x - panel.rect.x) * previewScale.value,
    top: (transform.value.y - panel.rect.y) * previewScale.value,
    width: image.width * transform.value.scale * previewScale.value,
  }));

  return (
    <View
      className="absolute overflow-hidden bg-white/10"
      style={{
        borderColor: "rgba(255,255,255,0.9)",
        borderWidth: 1,
        borderRadius: 32,
        height: panel.rect.height * layoutScale,
        left: (panel.rect.x - originX) * layoutScale,
        top: (panel.rect.y - originY) * layoutScale,
        width: panel.rect.width * layoutScale,
      }}
    >
      <AnimatedImage
        source={{ uri: image.uri }}
        contentFit="fill"
        style={[
          StyleSheet.absoluteFill,
          imageStyle,
          {
            opacity: panel.family === "button" ? buttonPanelOpacity : 0.5,
          },
        ]}
      />
      {showButtonIdentifiers && panel.family === "button" && panel.buttonIdentifier ? (
        <ButtonIdentifierOverlay
          bounds={{
            x: 0,
            y: 0,
            width: panel.rect.width * layoutScale,
            height: panel.rect.height * layoutScale,
          }}
          identifier={panel.buttonIdentifier}
          label={panel.label}
          opacity={buttonIdentifierOpacity}
          target="preview"
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
    </View>
  );
}
