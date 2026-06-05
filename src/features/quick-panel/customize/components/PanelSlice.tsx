import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  getSnappedPanelRect,
  usesQuickStarCropModel,
} from "../../model/quickstar-crop";
import type {
  ImageTransform,
  PanelDefinition,
  PickedImage,
} from "../../model/types";
import { PanelOverlay } from "./PanelOverlay";

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PanelSliceProps {
  panel: PanelDefinition;
  image: PickedImage;
  layoutScale: number;
  originX: number;
  originY: number;
  presetId: string;
  previewScale: SharedValue<number>;
  transform: SharedValue<ImageTransform>;
}

export function PanelSlice({
  panel,
  image,
  layoutScale,
  originX,
  originY,
  presetId,
  previewScale,
  transform,
}: PanelSliceProps) {
  const cropRect = usesQuickStarCropModel(presetId)
    ? getSnappedPanelRect(panel)
    : panel.rect;

  const imageStyle = useAnimatedStyle(() => ({
    height:
      image.height *
      transform.value.scale *
      previewScale.value *
      (panel.rect.height / cropRect.height),
    left:
      (transform.value.x - cropRect.x) *
      previewScale.value *
      (panel.rect.width / cropRect.width),
    top:
      (transform.value.y - cropRect.y) *
      previewScale.value *
      (panel.rect.height / cropRect.height),
    width:
      image.width *
      transform.value.scale *
      previewScale.value *
      (panel.rect.width / cropRect.width),
  }));

  return (
    <View
      className="absolute overflow-hidden bg-white/10"
      style={{
        borderColor: "rgba(255,255,255,0.9)",
        borderWidth: 1,
        borderRadius: panel.rect.radius * layoutScale,
        height: panel.rect.height * layoutScale,
        left: (panel.rect.x - originX) * layoutScale,
        top: (panel.rect.y - originY) * layoutScale,
        width: panel.rect.width * layoutScale,
      }}
    >
      <AnimatedImage
        source={{ uri: image.uri }}
        contentFit="fill"
        style={[StyleSheet.absoluteFill, imageStyle]}
      />
      <View className="absolute inset-0 bg-black/10" />
      <PanelOverlay panelId={panel.id} />
    </View>
  );
}
