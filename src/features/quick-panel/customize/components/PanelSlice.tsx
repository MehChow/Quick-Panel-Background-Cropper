import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  getCustomPreviewLayout,
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
  const isCustomPreview = usesQuickStarCropModel(presetId);
  const customPreviewLayout = isCustomPreview
    ? getCustomPreviewLayout(panel)
    : null;
  const cropRect = customPreviewLayout?.cropRect ?? panel.rect;
  const cropScale = customPreviewLayout?.scale ?? 1;
  const offsetX = customPreviewLayout?.offsetX ?? 0;
  const offsetY = customPreviewLayout?.offsetY ?? 0;

  const imageStyle = useAnimatedStyle(() => ({
    height: image.height * transform.value.scale * previewScale.value * cropScale,
    left:
      (transform.value.x - cropRect.x) * previewScale.value * cropScale +
      offsetX * previewScale.value,
    top:
      (transform.value.y - cropRect.y) * previewScale.value * cropScale +
      offsetY * previewScale.value,
    width: image.width * transform.value.scale * previewScale.value * cropScale,
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
      <PanelOverlay enabled={!isCustomPreview} panelId={panel.id} />
    </View>
  );
}
