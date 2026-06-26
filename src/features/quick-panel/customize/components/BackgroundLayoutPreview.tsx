import { images } from "@/data/images";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { getPanelUnion } from "../../model/panel-geometry";
import type { QuickPanelPreset } from "../../model/types";
import { PanelOverlay } from "./PanelOverlay";

interface BackgroundLayoutPreviewProps {
  preset: QuickPanelPreset;
}

interface PreviewSize {
  height: number;
  width: number;
}

const previewPadding = 28;

export function BackgroundLayoutPreview({
  preset,
}: BackgroundLayoutPreviewProps) {
  const [size, setSize] = useState<PreviewSize | null>(null);
  const panelUnion = getPanelUnion(preset);
  const scale = size
    ? Math.max(
        0,
        Math.min(
          (size.width - previewPadding * 2) / panelUnion.width,
          (size.height - previewPadding * 2) / panelUnion.height,
        ),
      )
    : 0;
  const previewWidth = panelUnion.width * scale;
  const previewHeight = panelUnion.height * scale;
  const originX = size ? (size.width - previewWidth) / 2 : 0;
  const originY = size ? (size.height - previewHeight) / 2 : 0;

  return (
    <View
      className="mt-4 h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
      onLayout={(event) =>
        setSize({
          height: event.nativeEvent.layout.height,
          width: event.nativeEvent.layout.width,
        })
      }
    >
      <Image
        contentFit="cover"
        source={images.exampleSrc}
        style={{ height: "100%", width: "100%" }}
      />
      <View className="absolute inset-0 bg-black/50" />
      {size && scale > 0
        ? preset.visualOrder.map((id) => {
            const panel = preset.panels[id];
            const height = panel.rect.height * scale;
            const left = originX + (panel.rect.x - panelUnion.x) * scale;
            const radius = Math.max(
              10,
              Math.min(22, panel.rect.radius * scale),
            );
            const top = originY + (panel.rect.y - panelUnion.y) * scale;
            const width = panel.rect.width * scale;

            return (
              <View
                key={id}
                className="absolute"
                style={{
                  borderRadius: radius,
                  elevation: 8,
                  height,
                  left,
                  shadowColor: "#000",
                  shadowOffset: { height: 8, width: 0 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  top,
                  width,
                }}
              >
                <View
                  className="flex-1 overflow-hidden border border-white/70 bg-white/10"
                  style={{ borderRadius: radius }}
                >
                  <Image
                    contentFit="cover"
                    source={images.exampleSrc}
                    style={{
                      height: size.height,
                      left: -left,
                      position: "absolute",
                      top: -top,
                      width: size.width,
                    }}
                  />
                  <View className="absolute inset-0 bg-black/5" />
                  <PanelOverlay
                    height={height}
                    mode={preset.mode}
                    panelId={panel.id}
                    width={width}
                  />
                </View>
              </View>
            );
          })
        : null}
    </View>
  );
}
