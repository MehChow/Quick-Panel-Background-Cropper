import { Image } from "expo-image";
import type { RefObject } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { PanelRect, PickedImage } from "../../../model/types";
import type { ButtonAreaPreviewSize } from "../button-area-preview-geometry";

interface Props {
  cardRef: RefObject<View | null>;
  crop: PanelRect;
  isReducedMotionEnabled: boolean;
  originX: SharedValue<number>;
  originY: SharedValue<number>;
  previewSize: ButtonAreaPreviewSize;
  progress: SharedValue<number>;
  screenshot: PickedImage;
  onDismiss: () => void;
}

export function ButtonAreaPreviewOverlay({
  cardRef,
  crop,
  isReducedMotionEnabled,
  originX,
  originY,
  previewSize,
  progress,
  screenshot,
  onDismiss,
}: Props) {
  const dimStyle = useAnimatedStyle(() => ({ opacity: progress.value * 0.45 }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: isReducedMotionEnabled
      ? []
      : [
          { translateX: originX.value * (1 - progress.value) },
          { translateY: originY.value * (1 - progress.value) },
          { scale: 0.65 + progress.value * 0.35 },
        ],
  }));

  return (
    <Modal
      animationType="none"
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible
    >
      <View
        accessibilityViewIsModal
        className="flex-1"
        testID="button-area-preview-overlay"
      >
        <Pressable
          accessibilityLabel="Close outlined area preview"
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={onDismiss}
        />
        <Animated.View
          className="absolute inset-0 bg-black"
          pointerEvents="none"
          style={dimStyle}
        />
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Animated.View style={cardStyle}>
            <View
              ref={cardRef}
              accessible={false}
              className="overflow-hidden rounded-2xl border-2 border-emerald-300 bg-black"
              style={{ height: previewSize.height, width: previewSize.width }}
            >
              <Image
                accessible={false}
                contentFit="fill"
                source={{ uri: screenshot.uri }}
                style={{
                  height: screenshot.height * previewSize.scale,
                  left: -crop.x * previewSize.scale,
                  position: "absolute",
                  top: -crop.y * previewSize.scale,
                  width: screenshot.width * previewSize.scale,
                }}
              />
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
