import {
  PanResponder,
  type GestureResponderEvent,
  type PanResponderGestureState,
  View,
} from "react-native";
import { clampRect, resizeRect, type HandlePosition } from "../calibration-rect";
import type { PanelRect, PickedImage } from "../types";

interface CalibrationResizeHandleProps {
  position: HandlePosition;
  rect: PanelRect;
  scale: number;
  screenshot: PickedImage;
  onRectChange: (rect: PanelRect) => void;
}

export function CalibrationResizeHandle(props: CalibrationResizeHandleProps) {
  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: handleResize(props),
  });

  return (
    <View
      {...responder.panHandlers}
      className="absolute items-center justify-center"
      style={{
        ...getHandleStyle(props.position),
        zIndex: 2,
      }}
    >
      {isCorner(props.position) ? (
        <View className="h-6 w-6 rounded-full border-2 border-white bg-emerald-400" />
      ) : null}
    </View>
  );
}

function handleResize({
  rect,
  scale,
  screenshot,
  onRectChange,
  position,
}: CalibrationResizeHandleProps) {
  return (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const dx = gesture.dx / scale;
    const dy = gesture.dy / scale;
    onRectChange(clampRect(resizeRect(rect, position, dx, dy), screenshot));
  };
}

function getHandleStyle(position: HandlePosition) {
  const offset = -18;
  const edgeSize = 36;

  if (position === "top") {
    return { height: edgeSize, left: 18, right: 18, top: offset };
  }
  if (position === "topLeft") {
    return { height: edgeSize, left: offset, top: offset, width: edgeSize };
  }
  if (position === "topRight") {
    return { height: edgeSize, right: offset, top: offset, width: edgeSize };
  }
  if (position === "right") {
    return { bottom: 18, right: offset, top: 18, width: edgeSize };
  }
  if (position === "bottom") {
    return { bottom: offset, height: edgeSize, left: 18, right: 18 };
  }
  if (position === "bottomLeft") {
    return { bottom: offset, height: edgeSize, left: offset, width: edgeSize };
  }
  if (position === "left") {
    return { bottom: 18, left: offset, top: 18, width: edgeSize };
  }
  return { bottom: offset, height: edgeSize, right: offset, width: edgeSize };
}

function isCorner(position: HandlePosition) {
  return (
    position === "topLeft" ||
    position === "topRight" ||
    position === "bottomLeft" ||
    position === "bottomRight"
  );
}
