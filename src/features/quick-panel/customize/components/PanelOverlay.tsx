import { Lucide } from "@react-native-vector-icons/lucide";
import { View } from "react-native";
import type { CustomizationMode, PanelId } from "../../model/types";

interface PanelOverlayProps {
  height: number;
  mode: CustomizationMode;
  panelId: PanelId;
  width: number;
}

export function PanelOverlay({
  height,
  mode,
  panelId,
  width,
}: PanelOverlayProps) {
  if (panelId.startsWith("button-")) {
    return null;
  }

  if (panelId === "buttonBox") {
    if (mode !== "default") {
      return null;
    }

    const iconSize = Math.max(
      18,
      Math.min(42, width / 9.2, height / 3.6),
    );

    return (
      <View
        className="absolute inset-0 justify-evenly"
        style={{ paddingHorizontal: Math.max(12, width * 0.08) }}
      >
        {Array.from({ length: 2 }, (_, row) => (
          <View key={row} className="flex-row justify-between">
            {Array.from({ length: 4 }, (_, column) => (
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
  const isVerticalControl = mode === "advanced" && height > width;
  const availableBarWidth = width - horizontalPadding * 2 -
    iconContainerSize - 12;
  const verticalPadding = Math.max(12, height * 0.07);
  const barWidth = Math.max(
    0,
    Math.min(panelId === "brightness" ? 160 : 96, availableBarWidth),
  );
  const showBar = barWidth >= 36 && height >= 32;
  const verticalBarMaxHeight = panelId === "brightness"
    ? height * 0.44
    : height * 0.3;
  const verticalBarHeight = Math.max(
    0,
    Math.min(
      height - verticalPadding * 2 - iconContainerSize - 12,
      verticalBarMaxHeight,
    ),
  );
  const showVerticalBar = verticalBarHeight >= 36 && width >= 32;
  const showIcon = width >= 52 && height >= 32;

  if (isVerticalControl) {
    return showIcon || showVerticalBar ? (
      <View
        className="absolute inset-0 items-center"
        style={{ paddingHorizontal: horizontalPadding, paddingVertical: verticalPadding }}
      >
        {showVerticalBar ? (
          <View
            className="rounded-full bg-white/70"
            style={{
              height: verticalBarHeight,
              marginTop: Math.max(4, height * 0.04),
              width: Math.max(16, Math.min(32, width * 0.36)),
            }}
          />
        ) : null}
        {showIcon ? (
          <View
            className="mt-auto self-center items-center justify-center rounded-full bg-white/75"
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
    ) : null;
  }

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
