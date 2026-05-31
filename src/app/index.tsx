import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { CalibrationScreen } from "@/features/quick-panel/components/CalibrationScreen";
import { ExportSurfaces } from "@/features/quick-panel/components/ExportSurfaces";
import { ExportSuccessPanel } from "@/features/quick-panel/components/ExportSuccessPanel";
import { QuickPanelPreview } from "@/features/quick-panel/components/QuickPanelPreview";
import { useQuickPanelStore } from "@/features/quick-panel/store";
import type { ExportRefs } from "@/features/quick-panel/types";
import { useQuickPanelActions } from "@/features/quick-panel/useQuickPanelActions";
import { useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
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
  const step = useQuickPanelStore((state) => state.step);
  const activePreset = useQuickPanelStore((state) => state.activePreset);
  const screenshot = useQuickPanelStore((state) => state.screenshot);
  const calibrationRect = useQuickPanelStore((state) => state.calibrationRect);
  const setCalibrationRect = useQuickPanelStore(
    (state) => state.setCalibrationRect
  );
  const acceptCalibration = useQuickPanelStore(
    (state) => state.acceptCalibration
  );
  const image = useQuickPanelStore((state) => state.image);
  const transform = useQuickPanelStore((state) => state.transform);
  const setTransform = useQuickPanelStore((state) => state.setTransform);
  const exports = useQuickPanelStore((state) => state.exports);
  const isExporting = useQuickPanelStore((state) => state.isExporting);
  const error = useQuickPanelStore((state) => state.error);
  const { exportImages, pickImage, pickScreenshot, resetFit } =
    useQuickPanelActions(refs);
  const [isPreviewAdjusting, setIsPreviewAdjusting] = useState(false);
  const hasExported = exports.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b" }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-8"
        scrollEnabled={!isPreviewAdjusting}
        overScrollMode="never"
      >
        <View className="mb-5">
          <Text variant="h2" className="text-white">
            Quick Panel Exporter
          </Text>
          <Text className="mt-2 text-sm leading-5 text-zinc-400">
            Put your Waifu as the background in the Quick Panel!
          </Text>
        </View>

        {step === "calibration" ? (
          <CalibrationScreen
            screenshot={screenshot}
            rect={calibrationRect}
            onImport={pickScreenshot}
            onRectChange={setCalibrationRect}
            onContinue={acceptCalibration}
          />
        ) : hasExported ? (
          <ExportSuccessPanel exports={exports} onConvertAnother={pickImage} />
        ) : image ? (
          <QuickPanelPreview
            image={image}
            preset={activePreset}
            onAdjustingChange={setIsPreviewAdjusting}
            transform={transform}
            onTransformChange={setTransform}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            className="h-120 items-center justify-center rounded-[30px] border border-zinc-800 bg-zinc-900 px-6 active:opacity-80"
            onPress={pickImage}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Choose an image from album
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
              PNG, JPG, WEBP are supported.
            </Text>
          </Pressable>
        )}

        {step !== "calibration" && !hasExported ? (
          <View className="mt-5 gap-3">
            {image ? (
              <Button onPress={pickImage}>Choose another image</Button>
            ) : null}
            {image ? (
              <View className="flex-row gap-3 pb-4">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onPress={resetFit}
                >
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
        ) : null}

        <View className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
          <Text className="text-sm leading-5 text-amber-100">
            Tested for Galaxy S25+ with One UI 8.5 only.
          </Text>
        </View>

        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      {image && !hasExported ? (
        <ExportSurfaces
          image={image}
          transform={transform}
          preset={activePreset}
          refs={refs}
        />
      ) : null}
    </SafeAreaView>
  );
}
