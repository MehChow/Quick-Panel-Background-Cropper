import { Text } from "@/components/ani-ui/text";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import type { PanelFamily, PanelId, PanelRect } from "../../../model/types";
import type { AdvancedSnapGrid } from "../advanced-grid";
import { useAdvancedPanelMoveGesture } from "../hooks/useAdvancedPanelMoveGesture";
import { AdvancedPanelResizeHandle } from "./AdvancedPanelResizeHandle";

const activeColor = "#c084fc";
const completedColor = "#f97316";
const buttonColor = "#38bdf8";

interface Props {
  grid: AdvancedSnapGrid;
  family: PanelFamily;
  isActive: boolean;
  label: PanelId;
  labelText: string;
  outerRect: PanelRect;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
}

export function AdvancedPanelBox(props: Props) {
  const draftRect = useSharedValue(props.rect);
  const gesture = useAdvancedPanelMoveGesture({ ...props, draftRect });
  const animatedStyle = useAnimatedStyle(() => {
    const rect = draftRect.get();
    return {
      height: rect.height * props.scale,
      left: rect.x * props.scale,
      top: rect.y * props.scale,
      width: rect.width * props.scale,
    };
  });
  const color = props.isActive
    ? props.family === "button" ? buttonColor : activeColor
    : completedColor;
  const handleColor = darkenColor(color, 0.18);

  useEffect(() => {
    draftRect.set(props.rect);
  }, [draftRect, props.rect]);

  return (
    <Animated.View
      className="absolute"
      style={[
        {
          backgroundColor: `${color}26`,
          borderColor: color,
          borderWidth: props.isActive ? 3 : 2,
          zIndex: props.isActive ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={gesture}>
        <View
          pointerEvents={props.isActive ? "auto" : "none"}
          className="absolute inset-0 items-center justify-center"
        >
          <Text
            className="rounded-md px-2 py-1 text-xs font-semibold text-black"
            style={{ backgroundColor: color }}
          >
            {props.labelText}
          </Text>
        </View>
      </GestureDetector>
      {props.isActive ? (
        <>
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            draftRect={draftRect}
            position="topLeft"
          />
          <AdvancedPanelResizeHandle {...props} draftRect={draftRect} position="top" />
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            draftRect={draftRect}
            position="topRight"
          />
          <AdvancedPanelResizeHandle {...props} draftRect={draftRect} position="right" />
          <AdvancedPanelResizeHandle {...props} draftRect={draftRect} position="bottom" />
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            draftRect={draftRect}
            position="bottomLeft"
          />
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            draftRect={draftRect}
            position="bottomRight"
          />
          <AdvancedPanelResizeHandle {...props} draftRect={draftRect} position="left" />
        </>
      ) : null}
    </Animated.View>
  );
}

function darkenColor(hex: string, amount: number) {
  const channel = (start: number) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16);
    return Math.max(0, Math.round(value * (1 - amount)));
  };
  return `#${[1, 3, 5].map((start) => channel(start).toString(16).padStart(2, "0")).join("")}`;
}
