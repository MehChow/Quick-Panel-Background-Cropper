import { Image } from "expo-image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Modal,
  Pressable,
  StyleSheet,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface HelpSheetZoomImageProps {
  contentFit?: "contain" | "cover";
  previewAspectRatio?: number;
  previewMaxWidth?: number;
  source: number;
  thumbnailClassName?: string;
  thumbnailStyle?: StyleProp<ViewStyle>;
}

const MAX_SCALE = 4;

export function HelpSheetZoomImage({
  contentFit = "cover",
  previewAspectRatio = 1,
  previewMaxWidth = 320,
  source,
  thumbnailClassName,
  thumbnailStyle,
}: HelpSheetZoomImageProps) {
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);
  const previewWidth = Math.round(width * 0.5);
  const previewDisplayWidth = Math.min(previewWidth, previewMaxWidth);
  const previewDisplayHeight = previewDisplayWidth / previewAspectRatio;

  const previewStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      startTranslateX.value = translateX.value;
      startTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = clampTranslate(
        startTranslateX.value + event.translationX,
        previewDisplayWidth,
        scale.value,
      );
      translateY.value = clampTranslate(
        startTranslateY.value + event.translationY,
        previewDisplayHeight,
        scale.value,
      );
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clampScale(startScale.value * event.scale);
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  function openPreview() {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    setIsOpen(true);
  }

  function closePreview() {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    setIsOpen(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        className={cn(
          "w-32 overflow-hidden rounded-2xl border border-white/90",
          thumbnailClassName,
        )}
        onPress={openPreview}
        style={[styles.thumbnail, thumbnailStyle]}
      >
        <Image
          contentFit={contentFit}
          source={source}
          style={styles.image}
        />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={closePreview}
        transparent
        visible={isOpen}
      >
        <GestureHandlerRootView className="flex-1" unstable_forceActive>
          <View className="flex-1 items-center justify-center px-6">
            <Pressable
              className="absolute inset-0 bg-black/75"
              onPress={closePreview}
            />

            <GestureDetector gesture={gesture}>
              <Animated.View
                style={[
                  styles.preview,
                  {
                    aspectRatio: previewAspectRatio,
                    maxWidth: previewMaxWidth,
                    width: previewWidth,
                  },
                  previewStyle,
                ]}
              >
                <Pressable onPress={closePreview} style={styles.image}>
                  <Image
                    contentFit={contentFit}
                    source={source}
                    style={styles.image}
                  />
                </Pressable>
              </Animated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}

function clampScale(scale: number) {
  "worklet";
  return Math.max(1, Math.min(MAX_SCALE, scale));
}

function clampTranslate(translate: number, size: number, scale: number) {
  "worklet";
  const maxOffset = ((size * scale) - size) / 2;
  return Math.max(-maxOffset, Math.min(maxOffset, translate));
}

const styles = StyleSheet.create({
  image: {
    height: "100%",
    width: "100%",
  },
  preview: {
    overflow: "hidden",
  },
  thumbnail: {
    aspectRatio: 1,
  },
});
