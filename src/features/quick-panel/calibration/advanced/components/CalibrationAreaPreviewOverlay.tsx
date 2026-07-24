import type { RefObject } from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { PanelRect, PickedImage } from "../../../model/types";
import type { CalibrationAreaLayout } from "../calibration-area-geometry";
import { CalibrationAreaPreviewCard } from "./CalibrationAreaPreviewCard";

interface Props {
  cardRef: RefObject<View | null>;
  crop: PanelRect;
  isReducedMotionEnabled: boolean;
  originX: SharedValue<number>;
  originY: SharedValue<number>;
  previewSize: CalibrationAreaLayout;
  progress: SharedValue<number>;
  screenshot: PickedImage;
  onDismiss: () => void;
}

export function CalibrationAreaPreviewOverlay({
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
        testID="calibration-area-preview-overlay"
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
            <CalibrationAreaPreviewCard
              cardRef={cardRef}
              crop={crop}
              previewSize={previewSize}
              screenshot={screenshot}
            />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
