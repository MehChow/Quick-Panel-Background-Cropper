import { Lucide } from "@react-native-vector-icons/lucide";
import { View } from "react-native";
import type { PanelId } from "../../model/types";

interface PanelOverlayProps {
  height: number;
  panelId: PanelId;
  width: number;
}

interface ButtonGrid {
  columns: number;
  rows: number;
}

const minButtonBoxWidth = 72;
const minButtonBoxHeight = 48;

export function PanelOverlay({ height, panelId, width }: PanelOverlayProps) {
  if (panelId === "buttonBox") {
    const grid = getButtonGrid(width, height);
    if (!grid) {
      return null;
    }

    const iconSize = Math.max(
      18,
      Math.min(42, width / (grid.columns * 2.3), height / (grid.rows * 1.8)),
    );

    return (
      <View
        className="absolute inset-0 justify-evenly"
        style={{ paddingHorizontal: Math.max(12, width * 0.08) }}
      >
        {Array.from({ length: grid.rows }, (_, row) => (
          <View key={row} className="flex-row justify-between">
            {Array.from({ length: grid.columns }, (_, column) => (
              <View
                key={column}
                className="rounded-full bg-black/30"
                style={{ height: iconSize, width: iconSize }}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (panelId === "mediaPlayer") {
    const iconSize = Math.max(18, Math.min(28, height * 0.44));
    const pillWidth = Math.max(0, Math.min(96, width * 0.24));
    const showPill = width >= 120 && height >= 34;

    return (
      <View
        className="absolute inset-0 flex-row items-center justify-between"
        style={{ paddingHorizontal: Math.max(12, width * 0.07) }}
      >
        <Lucide color="rgba(255,255,255,0.92)" name="play" size={iconSize} />
        {showPill ? (
          <View
            className="rounded-full bg-black/30"
            style={{ height: Math.max(14, height * 0.34), width: pillWidth }}
          />
        ) : null}
      </View>
    );
  }

  const iconSize = Math.max(18, Math.min(28, height * 0.42));
  const iconContainerSize = Math.max(28, Math.min(44, height * 0.72));
  const horizontalPadding = Math.max(12, width * 0.07);
  const availableBarWidth = width - horizontalPadding * 2 -
    iconContainerSize - 12;
  const barWidth = Math.max(
    0,
    Math.min(panelId === "brightness" ? 160 : 96, availableBarWidth),
  );
  const showBar = barWidth >= 36 && height >= 32;
  const showIcon = width >= 52 && height >= 32;

  return (
    <View
      className="absolute inset-0 flex-row items-center"
      style={{ paddingHorizontal: horizontalPadding }}
    >
      {showBar ? (
        <View
          className="rounded-full bg-white/70"
          style={{ height: Math.max(16, Math.min(32, height * 0.5)), width: barWidth }}
        />
      ) : null}
      {showIcon ? (
        <View
          className="ml-auto items-center justify-center rounded-full bg-white/75"
          style={{ height: iconContainerSize, width: iconContainerSize }}
        >
          <Lucide
            color="rgba(0,0,0,0.7)"
            name={panelId === "brightness" ? "moon" : "volume-2"}
            size={iconSize}
          />
        </View>
      ) : null}
    </View>
  );
}

function getButtonGrid(width: number, height: number): ButtonGrid | null {
  if (width < minButtonBoxWidth || height < minButtonBoxHeight) {
    return null;
  }

  const aspectRatio = width / height;
  if (aspectRatio >= 2.35) {
    return { columns: 4, rows: height >= 86 ? 2 : 1 };
  }
  if (aspectRatio >= 1.35) {
    return { columns: 3, rows: height >= 92 ? 2 : 1 };
  }
  if (aspectRatio >= 0.75) {
    return { columns: 2, rows: height >= 92 ? 2 : 1 };
  }
  return { columns: 1, rows: height >= 132 ? 3 : 2 };
}
