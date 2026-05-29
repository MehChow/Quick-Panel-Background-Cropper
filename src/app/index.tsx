import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { ExportSurfaces } from "@/features/quick-panel/components/ExportSurfaces";
import { QuickPanelPreview } from "@/features/quick-panel/components/QuickPanelPreview";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/preset";
import { useQuickPanelStore } from "@/features/quick-panel/store";
import type { ExportRefs } from "@/features/quick-panel/types";
import { useQuickPanelActions } from "@/features/quick-panel/useQuickPanelActions";
import { useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const buttonBoxRef = useRef<View>(null);
  const mediaPlayerRef = useRef<View>(null);
  const brightnessRef = useRef<View>(null);
  const volumeRef = useRef<View>(null);
  const refs: ExportRefs = {
    brightness: brightnessRef,
    buttonBox: buttonBoxRef,
    mediaPlayer: mediaPlayerRef,
    volume: volumeRef,
  };
  const image = useQuickPanelStore((state) => state.image);
  const transform = useQuickPanelStore((state) => state.transform);
  const setTransform = useQuickPanelStore((state) => state.setTransform);
  const exports = useQuickPanelStore((state) => state.exports);
  const isExporting = useQuickPanelStore((state) => state.isExporting);
  const error = useQuickPanelStore((state) => state.error);
  const { exportImages, pickImage, resetFit } = useQuickPanelActions(refs);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b" }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-5"
      >
        <View className="mb-5">
          <Text variant="h2" className="text-white">
            Quick Panel Exporter
          </Text>
          <Text className="mt-2 text-sm leading-5 text-zinc-400">
            Tune one image across the S25+ One UI 8.5 control panels, then
            export four Good Lock-ready PNGs.
          </Text>
        </View>

        {image ? (
          <QuickPanelPreview
            image={image}
            transform={transform}
            onTransformChange={setTransform}
          />
        ) : (
          <View className="h-130 items-center justify-center rounded-[30px] border border-zinc-800 bg-zinc-900 px-6">
            <Text className="text-center text-lg font-semibold text-white">
              Choose an image to start
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
              Square, portrait, and landscape images are supported.
            </Text>
          </View>
        )}

        <View className="mt-5 gap-3">
          <Button onPress={pickImage}>
            {image ? "Choose another image" : "Choose image"}
          </Button>
          {image ? (
            <View className="flex-row gap-3">
              <Button className="flex-1" variant="secondary" onPress={resetFit}>
                Reset fit
              </Button>
              <Button
                className="flex-1"
                loading={isExporting}
                onPress={exportImages}
              >
                Export PNGs
              </Button>
            </View>
          ) : null}
        </View>

        <View className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
          <Text className="text-sm leading-5 text-amber-100">
            Preset: {s25PlusOneUi85Preset.label}. In Good Lock, apply the
            exported files directly and avoid the Crop option.
          </Text>
        </View>

        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}

        {exports.length > 0 ? (
          <View className="mt-6 gap-3">
            <Text variant="h4" className="text-white">
              Apply in Good Lock order
            </Text>
            {exports.map((item) => (
              <View
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <Text className="font-semibold text-white">{item.label}</Text>
                <Text className="mt-1 text-sm text-zinc-400">
                  {item.fileName}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
      {image ? (
        <ExportSurfaces image={image} transform={transform} refs={refs} />
      ) : null}
    </SafeAreaView>
  );
}
