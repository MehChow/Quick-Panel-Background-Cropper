import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
  View,
} from "react-native";
import { clampRect } from "../calibration-rect";
import { getCalibratedPreset } from "../calibration";
import { getPanelUnion } from "../transform";
import type { PanelRect, PickedImage } from "../types";
import { CalibrationResizeHandle } from "./CalibrationResizeHandle";

interface CalibrationOverlayProps {
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function CalibrationOverlay({
  rect,
  scale,
  screenshot,
  onRectChange,
}: CalibrationOverlayProps) {
  const previewPreset = getCalibratedPreset(rect);
  const union = getPanelUnion(previewPreset);
  const moveResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: handleMove(rect, scale, screenshot, onRectChange),
  });

  return (
    <View
      className="absolute border-2 border-emerald-300 bg-emerald-300/10"
      style={{
        height: union.height * scale,
        left: union.x * scale,
        top: union.y * scale,
        width: union.width * scale,
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

function handleMove(
  rect: PanelRect,
  scale: number,
  screenshot: PickedImage,
  onRectChange: (rect: PanelRect) => void
) {
  return (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
    onRectChange(
      clampRect(
        {
          ...rect,
          x: rect.x + gesture.dx / scale,
          y: rect.y + gesture.dy / scale,
        },
        screenshot
      )
    );
  };
}
