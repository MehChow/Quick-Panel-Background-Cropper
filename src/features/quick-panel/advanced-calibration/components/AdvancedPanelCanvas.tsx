import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { visualOrder } from "../../model/preset";
import type { PanelId, PanelRect, PanelRects, PickedImage } from "../../model/types";
import { AdvancedPanelBox } from "./AdvancedPanelBox";

interface Props {
  outerRect: PanelRect;
  panels: PanelRects;
  screenshot: PickedImage;
  onPanelsChange: (panels: PanelRects) => void;
}

export function AdvancedPanelCanvas({
  outerRect,
  panels,
  screenshot,
  onPanelsChange,
}: Props) {
  const [viewWidth, setViewWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<PanelId>("buttonBox");
  const scale = viewWidth ? viewWidth / screenshot.width : 1;

  const changePanel = (id: PanelId, rect: PanelRect) => {
    onPanelsChange({ ...panels, [id]: rect });
  };

  return (
    <View
      className="overflow-hidden rounded-[28px] border border-zinc-800 bg-black"
      onLayout={(event) => setViewWidth(event.nativeEvent.layout.width)}
      style={{ aspectRatio: screenshot.width / screenshot.height }}
    >
      <Image source={{ uri: screenshot.uri }} contentFit="fill" style={{ height: "100%", width: "100%" }} />
      <View
        pointerEvents="none"
        className="absolute border-2 border-emerald-300 bg-emerald-300/5"
        style={{
          height: outerRect.height * scale,
          left: outerRect.x * scale,
          top: outerRect.y * scale,
          width: outerRect.width * scale,
        }}
      />
      {visualOrder.map((id) => (
        <AdvancedPanelBox
          key={id}
          id={id}
          isSelected={selectedId === id}
          outerRect={outerRect}
          rect={panels[id]}
          scale={scale}
          onChange={(rect) => changePanel(id, rect)}
          onSelect={() => setSelectedId(id)}
        />
      ))}
    </View>
  );
}
