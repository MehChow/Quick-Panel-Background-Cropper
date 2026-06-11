import { View } from "react-native";
import type { PanelRect } from "../../model/types";
import {
  getSnapGridPoints,
  type AdvancedSnapGrid,
} from "../advanced-grid";

interface Props {
  grid: AdvancedSnapGrid;
  outerRect: PanelRect;
  scale: number;
}

export function AdvancedSnapGridOverlay({
  grid,
  outerRect,
  scale,
}: Props) {
  const points = getSnapGridPoints(outerRect, grid);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      {points.map((point, index) => (
        <View
          key={`${index}-${point.x}-${point.y}`}
          className="absolute rounded-full bg-white/25"
          style={{
            height: 4,
            left: point.x * scale - 2,
            top: point.y * scale - 2,
            width: 4,
          }}
        />
      ))}
    </View>
  );
}
