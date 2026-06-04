import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import type { PanelId, PanelRect } from "../../model/types";
import { useAdvancedPanelMoveResponder } from "../hooks/useAdvancedPanelMoveResponder";
import { AdvancedPanelResizeHandle } from "./AdvancedPanelResizeHandle";

const colors: Record<PanelId, string> = {
  buttonBox: "#60a5fa",
  mediaPlayer: "#c084fc",
  brightness: "#facc15",
  volume: "#fb7185",
};

interface Props {
  id: PanelId;
  isSelected: boolean;
  outerRect: PanelRect;
  rect: PanelRect;
  scale: number;
  onChange: (rect: PanelRect) => void;
  onSelect: () => void;
}

export function AdvancedPanelBox(props: Props) {
  const { t } = useTranslation();
  const responder = useAdvancedPanelMoveResponder(props);
  const color = colors[props.id];

  return (
    <View
      className="absolute"
      style={{
        backgroundColor: `${color}26`,
        borderColor: color,
        borderWidth: props.isSelected ? 3 : 2,
        height: props.rect.height * props.scale,
        left: props.rect.x * props.scale,
        top: props.rect.y * props.scale,
        width: props.rect.width * props.scale,
      }}
      onTouchStart={props.onSelect}
    >
      <View {...responder.panHandlers} className="absolute inset-0 items-center justify-center">
        <Text
          className="rounded-md px-2 py-1 text-xs font-semibold text-black"
          style={{ backgroundColor: color }}
        >
          {t(`panels.${props.id}`)}
        </Text>
      </View>
      {props.isSelected ? (
        <>
          <AdvancedPanelResizeHandle {...props} position="topLeft" />
          <AdvancedPanelResizeHandle {...props} position="top" />
          <AdvancedPanelResizeHandle {...props} position="topRight" />
          <AdvancedPanelResizeHandle {...props} position="right" />
          <AdvancedPanelResizeHandle {...props} position="bottom" />
          <AdvancedPanelResizeHandle {...props} position="bottomLeft" />
          <AdvancedPanelResizeHandle {...props} position="bottomRight" />
          <AdvancedPanelResizeHandle {...props} position="left" />
        </>
      ) : null}
    </View>
  );
}
