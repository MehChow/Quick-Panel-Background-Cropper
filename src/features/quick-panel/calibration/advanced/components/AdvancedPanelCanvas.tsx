import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import type { PanelId, PanelRect, PanelRects, PickedImage } from "../../../model/types";
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
  enabledPanels: PanelId[];
  outerRect: PanelRect;
  phase: AdvancedCalibrationPhase;
  panels: PanelRects;
  screenshot: PickedImage;
  onPanelsChange: (panels: PanelRects) => void;
}

export function AdvancedPanelCanvas({
  grid,
  enabledPanels,
  outerRect,
  phase,
  panels,
  screenshot,
  onPanelsChange,
}: Props) {
  const [contentWidth, setContentWidth] = useState(0);
  const viewportRect = getViewportRect(outerRect, screenshot);
  const scale = contentWidth ? contentWidth / viewportRect.width : 1;
  const activeId = isPanelPhase(phase) ? phase : null;
  const visibleIds = getVisiblePanelIds(phase, enabledPanels);
  const localOuterRect = toLocalRect(outerRect, viewportRect);

  const changePanel = (id: keyof PanelRects, rect: PanelRect) => {
    onPanelsChange({ ...panels, [id]: fromLocalRect(rect, viewportRect) });
  };

  return (
    <View
      className="overflow-hidden border border-zinc-800 bg-black"
      style={{ aspectRatio: viewportRect.width / viewportRect.height }}
    >
      <View
        className="absolute inset-px overflow-hidden"
        onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
      >
        <Image
          source={{ uri: screenshot.uri }}
          contentFit="fill"
          style={{
            height: screenshot.height * scale,
            left: -viewportRect.x * scale,
            position: "absolute",
            top: -viewportRect.y * scale,
            width: screenshot.width * scale,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute inset-0 border-2 border-emerald-300 bg-emerald-300/5"
        />
        {phase !== "confirm" ? (
          <AdvancedSnapGridOverlay
            grid={grid}
            outerRect={localOuterRect}
            scale={scale}
          />
        ) : null}
        {visibleIds.map((id) => (
          <AdvancedPanelBox
            key={id}
            grid={grid}
            isActive={activeId === id}
            outerRect={localOuterRect}
            rect={toLocalRect(panels[id], viewportRect)}
            scale={scale}
            onChange={(rect) => changePanel(id, rect)}
            label={id}
          />
        ))}
      </View>
    </View>
  );
}

function getViewportRect(outerRect: PanelRect, screenshot: PickedImage): PanelRect {
  return {
    x: outerRect.x,
    y: outerRect.y,
    width: Math.min(outerRect.width, screenshot.width - outerRect.x),
    height: Math.min(outerRect.height, screenshot.height - outerRect.y),
    radius: 0,
  };
}

function toLocalRect(rect: PanelRect, viewportRect: PanelRect): PanelRect {
  return {
    ...rect,
    x: rect.x - viewportRect.x,
    y: rect.y - viewportRect.y,
  };
}

function fromLocalRect(rect: PanelRect, viewportRect: PanelRect): PanelRect {
  return {
    ...rect,
    x: rect.x + viewportRect.x,
    y: rect.y + viewportRect.y,
  };
}
