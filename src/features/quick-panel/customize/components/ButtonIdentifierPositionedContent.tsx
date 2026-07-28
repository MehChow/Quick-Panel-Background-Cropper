import type { ReactNode } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import {
  getConstrainedAxisOffset,
  type ButtonIdentifierBounds,
  type ButtonIdentifierLayout,
  type ButtonIdentifierPositions,
} from "../../model/button-identifier-layout";
import { buttonIdentifierStyles as styles } from "./button-identifier-content";

interface ButtonIdentifierPositionedContentProps {
  bounds: ButtonIdentifierBounds;
  children: ReactNode;
  layout: ButtonIdentifierLayout;
  measuredWidth: number | null;
  onHorizontalLayout: (event: LayoutChangeEvent) => void;
  positions: ButtonIdentifierPositions;
}

export function ButtonIdentifierPositionedContent({
  bounds,
  children,
  layout,
  measuredWidth,
  onHorizontalLayout,
  positions,
}: ButtonIdentifierPositionedContentProps) {
  if (layout.kind === "horizontal") {
    const maxWidth = Math.max(0, bounds.width - layout.inset * 2);
    const left = getConstrainedAxisOffset({
      axisLength: bounds.width,
      contentLength: measuredWidth ?? maxWidth,
      inset: layout.inset,
      position: positions.horizontal,
    });
    return (
      <View
        onLayout={onHorizontalLayout}
        testID="button-identifier-movable-content"
        style={[styles.horizontal, { gap: layout.gap, left, maxWidth }]}
      >
        {children}
      </View>
    );
  }
  if (layout.kind === "vertical") {
    const top = getConstrainedAxisOffset({
      axisLength: bounds.height,
      contentLength: layout.iconBackgroundSize,
      inset: layout.inset,
      position: positions.vertical,
    });
    return (
      <View
        testID="button-identifier-movable-content"
        style={[styles.vertical, {
          height: layout.iconBackgroundSize,
          top,
          width: bounds.width,
        }]}
      >
        {children}
      </View>
    );
  }
  const contentStyle = layout.kind === "single" ? styles.center : [
    styles.corner,
    {
      paddingHorizontal: layout.cornerPadding,
      paddingVertical: layout.cornerPadding,
    },
  ];
  return (
    <View testID="button-identifier-content" style={[styles.content, contentStyle]}>
      {children}
    </View>
  );
}
