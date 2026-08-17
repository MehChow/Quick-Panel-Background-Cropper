import { useEffect, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import {
  getButtonIdentifierLayout,
  type ButtonIdentifierBounds,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";
import type { ButtonIdentifierContentMode } from "../../model/button-identifier-content";
import type { ButtonIdentifierBackgroundTheme } from "../button-identifier-color";
import { ButtonIdentifierVisuals } from "./ButtonIdentifierVisuals";
import { AnimatedButtonIdentifierFrame } from "./AnimatedButtonIdentifierFrame";
import { AnimatedButtonIdentifierVisuals } from "./AnimatedButtonIdentifierVisuals";
import type { AnimatedButtonIdentifierAppearance } from "./button-identifier-animated-appearance";
import { ButtonIdentifierPositionedContent } from "./ButtonIdentifierPositionedContent";

interface HorizontalMeasurement {
  key: string;
  width: number;
}

interface ButtonIdentifierOverlayProps {
  animatedAppearance?: AnimatedButtonIdentifierAppearance;
  backgroundTheme?: ButtonIdentifierBackgroundTheme;
  bounds: ButtonIdentifierBounds;
  color?: string;
  contentMode?: ButtonIdentifierContentMode;
  identifier: ButtonIdentifierDefinition;
  label: string;
  onPositionReady?: () => void;
  opacity: number;
  positions: ButtonIdentifierPositions;
  referenceCellSize: number;
}

export function ButtonIdentifierOverlay({
  animatedAppearance,
  backgroundTheme = "dark",
  bounds,
  color = "#FFFFFF",
  contentMode = "both",
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
    contentMode,
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

  if (contentMode === "none") {
    return null;
  }

  const handleHorizontalLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setMeasurement((current) => current?.key === measurementKey && current.width === width
      ? current
      : { key: measurementKey, width });
  };
  const visuals = animatedAppearance ? (
    <AnimatedButtonIdentifierVisuals
      appearance={animatedAppearance}
      identifier={identifier}
      label={label}
      layout={layout}
      contentMode={contentMode}
    />
  ) : (
    <ButtonIdentifierVisuals
      backgroundTheme={backgroundTheme}
      color={color}
      identifier={identifier}
      label={label}
      layout={layout}
      contentMode={contentMode}
    />
  );
  const content = (
    <ButtonIdentifierPositionedContent
      bounds={bounds}
      layout={layout}
      measuredWidth={measuredWidth}
      onHorizontalLayout={handleHorizontalLayout}
      positions={positions}
    >
      {visuals}
    </ButtonIdentifierPositionedContent>
  );

  const baseStyle = {
    height: bounds.height,
    left: bounds.x,
    position: "absolute" as const,
    top: bounds.y,
    width: bounds.width,
  };
  const hidden = layout.kind === "horizontal" && measuredWidth === null;
  return animatedAppearance ? (
    <AnimatedButtonIdentifierFrame
      baseStyle={baseStyle}
      hidden={hidden}
      opacity={animatedAppearance.opacity}
    >
      {content}
    </AnimatedButtonIdentifierFrame>
  ) : (
    <View
      pointerEvents="none"
      testID="button-identifier-overlay"
      style={[baseStyle, { opacity: hidden ? 0 : opacity }]}
    >
      {content}
    </View>
  );
}
