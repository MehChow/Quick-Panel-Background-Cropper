import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import type { PanelRect, PanelRects, PickedImage } from "../../../model/types";
import type { AdvancedSnapGrid } from "../advanced-grid";
import {
  getVisiblePanelIds,
  isPanelPhase,
  type AdvancedCalibrationPhase,
} from "../advanced-steps";
import { AdvancedPanelBox } from "./AdvancedPanelBox";
import { AdvancedSnapGridOverlay } from "./AdvancedSnapGridOverlay";

interface Props {
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  phase: AdvancedCalibrationPhase;
  panels: PanelRects;
  screenshot: PickedImage;
  onPanelsChange: (panels: PanelRects) => void;
}

export function AdvancedPanelCanvas({
  grid,
  outerRect,
  phase,
  panels,
  screenshot,
  onPanelsChange,
}: Props) {
  const [viewWidth, setViewWidth] = useState(0);
  const scale = viewWidth ? viewWidth / screenshot.width : 1;
  const activeId = isPanelPhase(phase) ? phase : null;
  const visibleIds = getVisiblePanelIds(phase);

  const changePanel = (id: keyof PanelRects, rect: PanelRect) => {
    onPanelsChange({ ...panels, [id]: rect });
  };

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
      {phase !== "confirm" ? (
        <AdvancedSnapGridOverlay
          grid={grid}
          outerRect={outerRect}
          scale={scale}
        />
      ) : null}
      {visibleIds.map((id) => (
        <AdvancedPanelBox
          key={id}
          grid={grid}
          isActive={activeId === id}
          outerRect={outerRect}
          rect={panels[id]}
          scale={scale}
          onChange={(rect) => changePanel(id, rect)}
          label={id}
        />
      ))}
    </View>
  );
}
