import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import type { ImageTransform, PickedImage } from "../../model/types";
import { getPanelImageTransform } from "../panel-image-transform";

interface PreviewPanelImageProps {
  image: PickedImage;
  opacity: number;
  panelX: number;
  panelY: number;
  previewScale: SharedValue<number> | number;
  previewUri: string;
  transform: SharedValue<ImageTransform> | ImageTransform;
}

function imageTransformStyle(
  panelX: number,
  panelY: number,
  previewScale: number,
  transform: ImageTransform,
) {
  "worklet";
  const placement = getPanelImageTransform({ panelX, panelY, previewScale, transform });
  return { transform: [
    { translateX: placement.translateX },
    { translateY: placement.translateY },
    { scale: placement.scale },
  ] };
}

// Keep image work independent of identifier appearance and position updates.
export function PreviewPanelImage(props: PreviewPanelImageProps) {
  const content = <Image
    cachePolicy="memory-disk"
    contentFit="fill"
    source={{ uri: props.previewUri }}
    style={{ height: props.image.height, opacity: props.opacity, width: props.image.width }}
  />;
  if (typeof props.previewScale === "number" && !("get" in props.transform)) {
    return <View style={[styles.image, imageTransformStyle(
      props.panelX, props.panelY, props.previewScale, props.transform,
    )]}>{content}</View>;
  }
  return <AnimatedPreviewImageFrame {...props}>{content}</AnimatedPreviewImageFrame>;
}

function AnimatedPreviewImageFrame({
  children, panelX, panelY, previewScale, transform,
}: React.PropsWithChildren<PreviewPanelImageProps>) {
  const imageStyle = useAnimatedStyle(() => imageTransformStyle(
    panelX,
    panelY,
    typeof previewScale === "number" ? previewScale : previewScale.get(),
    "get" in transform ? transform.get() : transform,
  ));
  return <Animated.View style={[styles.image, imageStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  image: {
    left: 0,
    position: "absolute",
    top: 0,
    transformOrigin: [0, 0, 0],
  },
});
