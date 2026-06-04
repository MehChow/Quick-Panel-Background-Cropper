import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import type { PanelRect, PickedImage } from "../../model/types";
import { useCalibrationMoveResponder } from "../hooks/useCalibrationMoveResponder";
import { CalibrationResizeHandle } from "./CalibrationResizeHandle";

interface CustomCalibrationCanvasProps {
  isHidden: boolean;
  onRectChange: (rect: PanelRect) => void;
  rect: PanelRect | null;
  screenshot: PickedImage;
}

interface CustomCalibrationOverlayProps {
  isHidden: boolean;
  onRectChange: (rect: PanelRect) => void;
  rect: PanelRect | null;
  scale: number;
  screenshot: PickedImage;
}

export function CustomCalibrationCanvas({
  isHidden,
  onRectChange,
  rect,
  screenshot,
}: CustomCalibrationCanvasProps) {
  const [viewWidth, setViewWidth] = useState(0);
  const scale = viewWidth ? viewWidth / screenshot.width : 1;

  return (
    <View
      className="overflow-hidden rounded-[28px] border border-zinc-800 bg-black"
      onLayout={(event) => setViewWidth(event.nativeEvent.layout.width)}
      style={{ aspectRatio: screenshot.width / screenshot.height }}
    >
      <Image
        source={{ uri: screenshot.uri }}
        contentFit="fill"
        style={{ height: "100%", width: "100%" }}
      />
      <CustomCalibrationOverlay
        isHidden={isHidden}
        onRectChange={onRectChange}
        rect={rect}
        scale={scale}
        screenshot={screenshot}
      />
    </View>
  );
}

function CustomCalibrationOverlay({
  isHidden,
  onRectChange,
  rect,
  scale,
  screenshot,
}: CustomCalibrationOverlayProps) {
  const moveResponder = useCalibrationMoveResponder({
    rect: rect ?? fallbackRect,
    scale,
    screenshot,
    onRectChange,
  });

  if (!rect || isHidden) {
    return null;
  }

  return (
    <View
      className="absolute border-2 border-emerald-300 bg-emerald-300/10"
      style={{
        height: rect.height * scale,
        left: rect.x * scale,
        top: rect.y * scale,
        width: rect.width * scale,
      }}
    >
      <View
        {...moveResponder.panHandlers}
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      />
      <CalibrationResizeHandle
        position="top"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="topLeft"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="topRight"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="right"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="bottom"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="bottomLeft"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="bottomRight"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
      <CalibrationResizeHandle
        position="left"
        rect={rect}
        scale={scale}
        screenshot={screenshot}
        onRectChange={onRectChange}
      />
    </View>
  );
}

const fallbackRect: PanelRect = { x: 0, y: 0, width: 1, height: 1, radius: 0 };
