import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";
import type { PanelFamily, PanelId, PanelRect } from "../../../model/types";
import type { AdvancedSnapGrid } from "../advanced-grid";
import { useAdvancedPanelMoveResponder } from "../hooks/useAdvancedPanelMoveResponder";
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
  const responder = useAdvancedPanelMoveResponder(props);
  const color = props.family === "button" ? buttonColor : props.isActive ? activeColor : completedColor;
  const handleColor = darkenColor(color, 0.18);

  return (
    <View
      className="absolute"
      style={{
        backgroundColor: `${color}26`,
        borderColor: color,
        borderWidth: props.isActive ? 3 : 2,
        height: props.rect.height * props.scale,
        left: props.rect.x * props.scale,
        top: props.rect.y * props.scale,
        width: props.rect.width * props.scale,
        zIndex: props.isActive ? 2 : 1,
      }}
    >
      <View
        {...(props.isActive ? responder.panHandlers : {})}
        className="absolute inset-0 items-center justify-center"
      >
        <Text
          className="rounded-md px-2 py-1 text-xs font-semibold text-black"
          style={{ backgroundColor: color }}
        >
          {props.labelText}
        </Text>
      </View>
      {props.isActive ? (
        <>
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            position="topLeft"
          />
          <AdvancedPanelResizeHandle {...props} position="top" />
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            position="topRight"
          />
          <AdvancedPanelResizeHandle {...props} position="right" />
          <AdvancedPanelResizeHandle {...props} position="bottom" />
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            position="bottomLeft"
          />
          <AdvancedPanelResizeHandle
            {...props}
            color={handleColor}
            position="bottomRight"
          />
          <AdvancedPanelResizeHandle {...props} position="left" />
        </>
      ) : null}
    </View>
  );
}

function darkenColor(hex: string, amount: number) {
  const channel = (start: number) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16);
    return Math.max(0, Math.round(value * (1 - amount)));
  };
  return `#${[1, 3, 5].map((start) => channel(start).toString(16).padStart(2, "0")).join("")}`;
}
