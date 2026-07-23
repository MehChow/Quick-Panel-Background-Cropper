import { type ReactNode, useState } from "react";
import { View } from "react-native";
import type { PanelRect, PickedImage } from "../../model/types";
import { CalibrationImageSurface } from "./CalibrationImageSurface";
import { CalibrationImportCard } from "./CalibrationImportCard";

const canvasPadding = 12;

interface CalibrationCanvasProps {
  controls?: ReactNode;
  rect: PanelRect | null;
  renderOverlay: (scale: number) => ReactNode;
  screenshot: PickedImage | null;
  onImport: () => void;
  showControls?: boolean;
  showImportButton?: boolean;
}

export function CalibrationCanvas({
  controls,
  rect,
  renderOverlay,
  screenshot,
  onImport,
  showControls = true,
  showImportButton = true,
}: CalibrationCanvasProps) {
  const [viewport, setViewport] = useState({ height: 0, width: 0 });

  if (!screenshot || !rect) {
    return (
      <View className="flex-1 justify-center">
        <CalibrationImportCard
          onImport={showImportButton ? onImport : undefined}
        />
      </View>
    );
  }

  const maxWidth = Math.max(viewport.width - canvasPadding * 2, 0);
  const maxHeight = Math.max(viewport.height - canvasPadding * 2, 0);
  const widthScale = maxWidth / screenshot.width;
  const heightScale = maxHeight / screenshot.height;
  const scale = Math.min(widthScale, heightScale);
  const canvasWidth = Number.isFinite(scale) ? screenshot.width * scale : 0;
  const canvasHeight = Number.isFinite(scale) ? screenshot.height * scale : 0;

  return (
    <View
      className="flex-1 justify-center"
      onLayout={(event) =>
        setViewport({
          height: event.nativeEvent.layout.height,
          width: event.nativeEvent.layout.width,
        })
      }
    >
      <CalibrationImageSurface
        canvasHeight={canvasHeight}
        canvasWidth={canvasWidth}
        renderOverlay={renderOverlay}
        scale={scale}
        screenshot={screenshot}
      />

      {showControls ? <View className="mt-4">{controls}</View> : null}
    </View>
  );
}
