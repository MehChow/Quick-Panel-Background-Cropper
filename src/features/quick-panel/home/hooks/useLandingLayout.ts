import { useState } from "react";
import type { LayoutChangeEvent } from "react-native";

const landingTopPadding = 16;
const landingGap = 16;

export function useLandingLayout() {
  const [containerHeight, setContainerHeight] = useState(0);
  const [actionsHeight, setActionsHeight] = useState(0);
  const cardHeight = Math.max(
    0,
    containerHeight - actionsHeight - landingTopPadding - landingGap,
  );

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  const handleActionsLayout = (event: LayoutChangeEvent) => {
    setActionsHeight(event.nativeEvent.layout.height);
  };

  return { cardHeight, handleContainerLayout, handleActionsLayout };
}
