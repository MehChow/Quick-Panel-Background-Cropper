import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import type {
  CustomCalibrationSession,
  PanelRect,
  PickedImage,
} from "../../model/types";
import { useCalibrationMoveResponder } from "../hooks/useCalibrationMoveResponder";
import { CalibrationResizeHandle } from "./CalibrationResizeHandle";

interface CustomCalibrationCanvasProps {
  isHidden: boolean;
  onRectChange: (rect: PanelRect) => void;
  rect: PanelRect | null;
  session: CustomCalibrationSession;
}

export function CustomCalibrationCanvas({
  isHidden,
  onRectChange,
  rect,
  session,
}: CustomCalibrationCanvasProps) {
  const topScreenshot = session.topScreenshot;
  const [viewWidth, setViewWidth] = useState(0);

  if (!topScreenshot) {
    return null;
  }

  const calibrationSurface = getCalibrationSurface(session, topScreenshot);
  const scale = viewWidth ? viewWidth / calibrationSurface.width : 1;

  return (
    <View
      className="overflow-hidden rounded-[28px] border border-zinc-800 bg-black"
      onLayout={(event) => setViewWidth(event.nativeEvent.layout.width)}
      style={{ aspectRatio: calibrationSurface.width / calibrationSurface.height }}
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
      {session.bottomScreenshot && session.bottomOffsetY !== null ? (
        <Image
          source={{ uri: session.bottomScreenshot.uri }}
          contentFit="fill"
          style={{
            height: session.bottomScreenshot.height * scale,
            left: 0,
            position: "absolute",
            top: session.bottomOffsetY * scale,
            width: "100%",
          }}
        />
      ) : null}
      <CustomCalibrationOverlay
        isHidden={isHidden}
        onRectChange={onRectChange}
        rect={rect}
        scale={scale}
        screenshot={calibrationSurface}
      />
    </View>
  );
}

interface CustomCalibrationOverlayProps {
  isHidden: boolean;
  onRectChange: (rect: PanelRect) => void;
  rect: PanelRect | null;
  scale: number;
  screenshot: PickedImage;
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
      <View {...moveResponder.panHandlers} className="absolute inset-0" style={{ zIndex: 1 }} />
      {handlePositions.map((position) => (
        <CalibrationResizeHandle
          key={position}
          position={position}
          rect={rect}
          scale={scale}
          screenshot={screenshot}
          onRectChange={onRectChange}
        />
      ))}
    </View>
  );
}

function getCalibrationSurface(
  session: CustomCalibrationSession,
  topScreenshot: PickedImage,
): PickedImage {
  return {
    ...topScreenshot,
    height: session.mergedHeight ?? topScreenshot.height,
  };
}

const fallbackRect: PanelRect = { x: 0, y: 0, width: 1, height: 1, radius: 0 };
const handlePositions = [
  "top",
  "topLeft",
  "topRight",
  "right",
  "bottom",
  "bottomLeft",
  "bottomRight",
  "left",
] as const;
