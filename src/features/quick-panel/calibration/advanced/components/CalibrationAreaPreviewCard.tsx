import { Image } from "expo-image";
import type { RefObject } from "react";
import { View } from "react-native";
import type { PanelRect, PickedImage } from "../../../model/types";
import type { CalibrationAreaLayout } from "../calibration-area-geometry";

interface CalibrationAreaPreviewCardProps {
  cardRef: RefObject<View | null>;
  crop: PanelRect;
  previewSize: CalibrationAreaLayout;
  screenshot: PickedImage;
}

export function CalibrationAreaPreviewCard({
  cardRef,
  crop,
  previewSize,
  screenshot,
}: CalibrationAreaPreviewCardProps) {
  const dimensions = {
    height: previewSize.height,
    width: previewSize.width,
  };

  return (
    <View
      ref={cardRef}
      accessible={false}
      style={dimensions}
      testID="calibration-area-preview-card"
    >
      <View
        className="absolute inset-0 overflow-hidden rounded-2xl bg-black"
        style={dimensions}
        testID="calibration-area-preview-clip"
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
          testID="calibration-area-preview-image"
        />
      </View>
      <View
        className="absolute inset-0 rounded-2xl border-2 border-emerald-300"
        pointerEvents="none"
        testID="calibration-area-preview-frame"
      />
    </View>
  );
}
