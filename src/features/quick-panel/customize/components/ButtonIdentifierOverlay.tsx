import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useEffect, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import {
  getConstrainedAxisOffset,
  getButtonIdentifierLayout,
  type ButtonIdentifierBounds,
  type ButtonIdentifierPositions,
  type ButtonIdentifierRenderTarget,
} from "../../model/button-identifier-layout";
import type { ButtonIdentifierDefinition } from "../../model/types";
import { buttonIdentifierStyles as styles } from "./button-identifier-content";

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
  target: ButtonIdentifierRenderTarget;
}

export function ButtonIdentifierOverlay({
  bounds,
  identifier,
  label,
  onPositionReady,
  opacity,
  positions,
  target,
}: ButtonIdentifierOverlayProps) {
  const layout = getButtonIdentifierLayout(bounds, identifier, target);
  const measurementKey = [bounds.width, layout.fontSize, layout.iconSize, label, target]
    .join(":");
  const [measurement, setMeasurement] = useState<HorizontalMeasurement | null>(null);
  const measuredWidth = measurement?.key === measurementKey
    ? measurement.width
    : null;

  useEffect(() => {
    if (layout.orientation === "horizontal" && measuredWidth !== null) {
      onPositionReady?.();
    }
  }, [layout.orientation, measuredWidth, onPositionReady, positions.horizontal]);

  const handleHorizontalLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setMeasurement((current) => current?.key === measurementKey && current.width === width
      ? current
      : { key: measurementKey, width });
  };

  const icon = (
    <Lucide
      color="#FFFFFF"
      name={identifier.iconName}
      size={layout.iconSize}
      style={styles.shadow}
    />
  );
  const labelContent = layout.showLabel ? (
    <Text
      adjustsFontSizeToFit
      allowFontScaling={false}
      ellipsizeMode="tail"
      minimumFontScale={layout.minimumFontScale}
      numberOfLines={1}
      testID="button-identifier-label"
      style={[
        styles.label,
        styles.shadow,
        { fontSize: layout.fontSize, maxWidth: layout.maxLabelWidth },
      ]}
    >
      {label}
    </Text>
  ) : null;
  let content;

  if (layout.orientation === "horizontal") {
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
        {icon}
        {labelContent}
      </View>
    );
  } else if (layout.orientation === "vertical") {
    const top = getConstrainedAxisOffset({
      axisLength: bounds.height,
      contentLength: layout.iconSize,
      inset: layout.inset,
      position: positions.vertical,
    });
    content = (
      <View
        testID="button-identifier-movable-content"
        style={[styles.vertical, { height: layout.iconSize, top, width: bounds.width }]}
      >
        {icon}
      </View>
    );
  } else {
    const contentStyle = layout.alignment === "center"
      ? styles.center
      : [styles.leftCenter, { gap: layout.gap, paddingHorizontal: layout.inset }];
    content = (
      <View testID="button-identifier-content" style={[styles.content, contentStyle]}>
        {icon}
        {labelContent}
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
        opacity: layout.orientation === "horizontal" && measuredWidth === null
          ? 0
          : opacity,
        position: "absolute",
        top: bounds.y,
        width: bounds.width,
      }}
    >
      {content}
    </View>
  );
}
