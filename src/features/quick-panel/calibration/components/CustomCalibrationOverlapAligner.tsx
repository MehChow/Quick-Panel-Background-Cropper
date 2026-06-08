import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  clampBottomCropTopY,
  getVisibleBottomScreenshotMetrics,
} from "../custom-calibration-session";
import { clampBottomOffsetYWorklet } from "../worklets/custom-calibration-worklets";
import type { PickedImage } from "../../model/types";

const ALIGNMENT_BOTTOM_OPACITY = 0.55;

interface CustomCalibrationOverlapAlignerProps {
  bottomCropTopY: number | null;
  bottomOffsetY: number | null;
  bottomScreenshot: PickedImage | null;
  onBottomOffsetYChange: (offsetY: number) => void;
  topScreenshot: PickedImage;
}

export function CustomCalibrationOverlapAligner({
  bottomCropTopY,
  bottomOffsetY,
  bottomScreenshot,
  onBottomOffsetYChange,
  topScreenshot,
}: CustomCalibrationOverlapAlignerProps) {
  const { t } = useTranslation();
  const [isSeamActive, setIsSeamActive] = useState(false);
  const [viewWidth, setViewWidth] = useState(0);
  const offsetOriginY = useSharedValue(0);
  const scale = viewWidth ? viewWidth / topScreenshot.width : 1;
  const activeScale = Math.max(scale, 1);
  const effectiveOffsetY = bottomOffsetY ?? topScreenshot.height;
  const effectiveCropTopY = bottomScreenshot
    ? clampBottomCropTopY(bottomCropTopY ?? 0, bottomScreenshot.height)
    : 0;
  const visibleBottomHeight = bottomScreenshot
    ? getVisibleBottomScreenshotMetrics(bottomScreenshot, effectiveCropTopY)
        .height
    : 0;
  const canvasHeight = topScreenshot.height + visibleBottomHeight;

  const seamGesture = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      offsetOriginY.value = effectiveOffsetY;
      scheduleOnRN(setIsSeamActive, true);
    })
    .onUpdate((event) => {
      scheduleOnRN(
        onBottomOffsetYChange,
        clampBottomOffsetYWorklet(
          offsetOriginY.value + event.translationY / activeScale,
          topScreenshot.height,
        ),
      );
    })
    .onFinalize(() => {
      scheduleOnRN(setIsSeamActive, false);
    });

  return (
    <View
      className="overflow-hidden rounded-[28px] border border-zinc-800 bg-black"
      onLayout={(event) => setViewWidth(event.nativeEvent.layout.width)}
      style={{ aspectRatio: topScreenshot.width / canvasHeight }}
    >
      <Image
        source={{ uri: topScreenshot.uri }}
        contentFit="fill"
        style={{
          height: topScreenshot.height * scale,
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      {bottomScreenshot ? (
        <>
          <View
            className="absolute left-0 right-0 overflow-hidden"
            style={{
              height: visibleBottomHeight * scale,
              top: effectiveOffsetY * scale,
            }}
          >
            <Image
              source={{ uri: bottomScreenshot.uri }}
              contentFit="fill"
              style={{
                height: bottomScreenshot.height * scale,
                left: 0,
                opacity: ALIGNMENT_BOTTOM_OPACITY,
                position: "absolute",
                top: -effectiveCropTopY * scale,
                width: "100%",
              }}
            />
          </View>
          <GestureDetector gesture={seamGesture}>
            <View
              className="absolute left-4 right-4 items-center rounded-2xl border px-4 py-3"
              style={{
                backgroundColor:
                  isSeamActive
                    ? "rgba(120, 53, 15, 0.88)"
                    : "rgba(9, 9, 11, 0.72)",
                borderColor:
                  isSeamActive
                    ? "rgba(253, 224, 71, 0.95)"
                    : "rgba(255, 255, 255, 0.18)",
                top: effectiveOffsetY * scale - 28,
              }}
            >
              <View className="rounded-full bg-zinc-50 px-4 py-2">
                <Text className="text-xs font-semibold text-zinc-900">
                  {t("calibration.dragToAlign")}
                </Text>
              </View>
            </View>
          </GestureDetector>
        </>
      ) : (
        <View className="absolute inset-6 rounded-2xl border border-dashed border-zinc-600 bg-zinc-950/70" />
      )}
    </View>
  );
}
