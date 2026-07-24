import { Image } from "expo-image";
import type { ReactNode } from "react";
import { View } from "react-native";
import type { PickedImage } from "../../model/types";

const screenshotShadowStyle = {
  elevation: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.24,
  shadowRadius: 18,
} as const;

const screenshotOuterFrameStyle = {
  borderColor: "rgba(255, 255, 255, 0.92)",
  borderWidth: 1.5,
} as const;

const screenshotInnerFrameStyle = {
  borderColor: "rgba(0, 0, 0, 0.22)",
  borderWidth: 1,
  bottom: 1.5,
  left: 1.5,
  right: 1.5,
  top: 1.5,
} as const;

interface CalibrationImageSurfaceProps {
  canvasHeight: number;
  canvasWidth: number;
  renderOverlay: (scale: number) => ReactNode;
  scale: number;
  screenshot: PickedImage;
}

export function CalibrationImageSurface({
  canvasHeight,
  canvasWidth,
  renderOverlay,
  scale,
  screenshot,
}: CalibrationImageSurfaceProps) {
  const dimensions = { height: canvasHeight, width: canvasWidth };

  return (
    <View
      className="self-center rounded-[28px] bg-black"
      style={{ ...dimensions, ...screenshotShadowStyle }}
      testID="calibration-image-wrapper"
    >
      <View
        className="absolute inset-0 overflow-hidden rounded-[28px] bg-black"
        style={dimensions}
        testID="calibration-coordinate-surface"
      >
        <Image
          contentFit="fill"
          source={{ uri: screenshot.uri }}
          style={{ height: "100%", width: "100%" }}
          testID="calibration-screenshot-image"
        />
        {renderOverlay(scale)}
      </View>
      <View
        className="absolute inset-0 rounded-[28px]"
        pointerEvents="none"
        style={screenshotOuterFrameStyle}
        testID="calibration-outer-frame"
      />
      <View
        className="absolute rounded-[28px]"
        pointerEvents="none"
        style={screenshotInnerFrameStyle}
        testID="calibration-inner-frame"
      />
    </View>
  );
}
