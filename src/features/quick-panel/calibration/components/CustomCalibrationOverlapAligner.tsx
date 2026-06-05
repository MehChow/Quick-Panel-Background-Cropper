import { Image } from "expo-image";
import { useState } from "react";
import { PanResponder, View } from "react-native";
import type { PickedImage } from "../../model/types";

interface CustomCalibrationOverlapAlignerProps {
  bottomOffsetY: number | null;
  bottomScreenshot: PickedImage | null;
  onBottomOffsetYChange: (offsetY: number) => void;
  topScreenshot: PickedImage;
}

export function CustomCalibrationOverlapAligner({
  bottomOffsetY,
  bottomScreenshot,
  onBottomOffsetYChange,
  topScreenshot,
}: CustomCalibrationOverlapAlignerProps) {
  const [viewWidth, setViewWidth] = useState(0);
  const [dragOriginOffsetY, setDragOriginOffsetY] = useState<number | null>(
    null,
  );
  const scale = viewWidth ? viewWidth / topScreenshot.width : 1;
  const effectiveOffsetY = bottomOffsetY ?? topScreenshot.height;
  const canvasHeight = bottomScreenshot
    ? Math.max(topScreenshot.height, effectiveOffsetY + bottomScreenshot.height)
    : topScreenshot.height;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => bottomScreenshot !== null,
    onPanResponderGrant: () => {
      setDragOriginOffsetY(effectiveOffsetY);
    },
    onPanResponderMove: (_, gestureState) => {
      const nextOffsetY = clampOffset(
        (dragOriginOffsetY ?? effectiveOffsetY) +
          gestureState.dy / Math.max(scale, 1),
        topScreenshot.height,
      );
      onBottomOffsetYChange(nextOffsetY);
    },
    onPanResponderRelease: () => {
      setDragOriginOffsetY(null);
    },
    onStartShouldSetPanResponder: () => bottomScreenshot !== null,
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
          <Image
            source={{ uri: bottomScreenshot.uri }}
            contentFit="fill"
            style={{
              height: bottomScreenshot.height * scale,
              left: 0,
              position: "absolute",
              top: effectiveOffsetY * scale,
              width: "100%",
            }}
          />
          <View
            {...panResponder.panHandlers}
            className="absolute left-4 right-4 items-center"
            style={{ top: effectiveOffsetY * scale - 10 }}
          >
            <View className="h-1 w-full rounded-full bg-orange-300" />
            <View className="mt-2 h-5 w-24 rounded-full border border-orange-200 bg-orange-100/90" />
          </View>
        </>
      ) : (
        <View className="absolute inset-6 rounded-2xl border border-dashed border-zinc-600 bg-zinc-950/70" />
      )}
    </View>
  );
}

function clampOffset(offsetY: number, maxOffsetY: number) {
  return Math.max(0, Math.min(maxOffsetY, offsetY));
}
