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

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PanelSliceProps {
  buttonPanelOpacity: number;
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
  buttonPanelOpacity,
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
