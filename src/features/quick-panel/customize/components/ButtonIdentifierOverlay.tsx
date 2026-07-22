import { useEffect, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import {
  getConstrainedAxisOffset,
  getButtonIdentifierLayout,
  type ButtonIdentifierBounds,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";
import { buttonIdentifierStyles as styles } from "./button-identifier-content";
import { ButtonIdentifierVisuals } from "./ButtonIdentifierVisuals";

interface HorizontalMeasurement {
  key: string;
  width: number;
}

interface ButtonIdentifierOverlayProps {
  bounds: ButtonIdentifierBounds;
  identifier: ButtonIdentifierDefinition;
  label: string;
  onPositionReady?: () => void;
  opacity: number;
  positions: ButtonIdentifierPositions;
  referenceCellSize: number;
}

export function ButtonIdentifierOverlay({
  bounds,
  identifier,
  label,
  onPositionReady,
  opacity,
  positions,
  referenceCellSize,
}: ButtonIdentifierOverlayProps) {
  const layout = getButtonIdentifierLayout(bounds, identifier, referenceCellSize);
  const measurementKey = [
    bounds.width,
    layout.fontSize,
    layout.iconBackgroundSize,
    label,
  ].join(":");
  const [measurement, setMeasurement] = useState<HorizontalMeasurement | null>(null);
  const measuredWidth = measurement?.key === measurementKey
    ? measurement.width
    : null;

  useEffect(() => {
    if (layout.kind === "horizontal" && measuredWidth !== null) {
      onPositionReady?.();
    }
  }, [layout.kind, measuredWidth, onPositionReady, positions.horizontal]);

  const handleHorizontalLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setMeasurement((current) => current?.key === measurementKey && current.width === width
      ? current
      : { key: measurementKey, width });
  };
  const visuals = (
    <ButtonIdentifierVisuals identifier={identifier} label={label} layout={layout} />
  );
  let content;

  if (layout.kind === "horizontal") {
    const maxWidth = Math.max(0, bounds.width - layout.inset * 2);
    const left = getConstrainedAxisOffset({
      axisLength: bounds.width,
      contentLength: measuredWidth ?? maxWidth,
      inset: layout.inset,
      position: positions.horizontal,
    });
    content = (
      <View
        onLayout={handleHorizontalLayout}
        testID="button-identifier-movable-content"
        style={[styles.horizontal, { gap: layout.gap, left, maxWidth }]}
      >
        {visuals}
      </View>
    );
  } else if (layout.kind === "vertical") {
    const top = getConstrainedAxisOffset({
      axisLength: bounds.height,
      contentLength: layout.iconBackgroundSize,
      inset: layout.inset,
      position: positions.vertical,
    });
    content = (
      <View
        testID="button-identifier-movable-content"
        style={[
          styles.vertical,
          { height: layout.iconBackgroundSize, top, width: bounds.width },
        ]}
      >
        {visuals}
      </View>
    );
  } else {
    const contentStyle = layout.kind === "single"
      ? styles.center
      : [
        styles.corner,
        {
          paddingHorizontal: layout.cornerPadding,
          paddingVertical: layout.cornerPadding,
        },
      ];
    content = (
      <View testID="button-identifier-content" style={[styles.content, contentStyle]}>
        {visuals}
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      testID="button-identifier-overlay"
      style={{
        height: bounds.height,
        left: bounds.x,
        opacity: layout.kind === "horizontal" && measuredWidth === null ? 0 : opacity,
        position: "absolute",
        top: bounds.y,
        width: bounds.width,
      }}
    >
      {content}
    </View>
  );
}
