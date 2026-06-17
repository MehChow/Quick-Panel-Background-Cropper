import { View } from "react-native";
import type { PanelRect, PickedImage } from "../../model/types";
import { CalibrationResizeHandle } from "./CalibrationResizeHandle";
import { useCalibrationMoveResponder } from "./hooks/useCalibrationMoveResponder";

interface Props {
  displayRect: PanelRect;
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function RectSelectionOverlay({
  displayRect,
  rect,
  scale,
  screenshot,
  onRectChange,
}: Props) {
  const moveResponder = useCalibrationMoveResponder({
    rect,
    scale,
    screenshot,
    onRectChange,
  });

  return (
    <View
      className="absolute border-2 border-emerald-300 bg-emerald-100/10"
      style={{
        height: displayRect.height * scale,
        left: displayRect.x * scale,
        top: displayRect.y * scale,
        width: displayRect.width * scale,
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
