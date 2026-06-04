import { View } from "react-native";
import type { PanelRect } from "../../model/types";
import type { HandlePosition } from "../../calibration/calibration-rect";
import { useAdvancedPanelResizeResponder } from "../hooks/useAdvancedPanelResizeResponder";

interface Props {
  outerRect: PanelRect;
  position: HandlePosition;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function AdvancedPanelResizeHandle(props: Props) {
  const responder = useAdvancedPanelResizeResponder(props);
  return (
    <View
      {...responder.panHandlers}
      className="absolute items-center justify-center"
      style={{ ...getStyle(props.position), zIndex: 3 }}
    >
      {isCorner(props.position) ? (
        <View className="h-5 w-5 rounded-full border-2 border-white bg-orange-400" />
      ) : null}
    </View>
  );
}

function getStyle(position: HandlePosition) {
  const offset = -14;
  const size = 28;
  if (position === "topLeft") return { height: size, left: offset, top: offset, width: size };
  if (position === "topRight") return { height: size, right: offset, top: offset, width: size };
  if (position === "bottomLeft") return { bottom: offset, height: size, left: offset, width: size };
  if (position === "top") return { height: size, left: 14, right: 14, top: offset };
  if (position === "right") return { bottom: 14, right: offset, top: 14, width: size };
  if (position === "bottom") return { bottom: offset, height: size, left: 14, right: 14 };
  if (position === "left") return { bottom: 14, left: offset, top: 14, width: size };
  return { bottom: offset, height: size, right: offset, width: size };
}

function isCorner(position: HandlePosition) {
  return position === "topLeft" ||
    position === "topRight" ||
    position === "bottomLeft" ||
    position === "bottomRight";
}
