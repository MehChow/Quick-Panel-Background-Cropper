import { Button } from "@/components/ani-ui/button";
import { Skeleton } from "@/components/ani-ui/skeleton";
import { Text } from "@/components/ani-ui/text";
import { ExportSuccessPanel } from "@/features/quick-panel/components/ExportSuccessPanel";
import { ExportSurfaces } from "@/features/quick-panel/components/ExportSurfaces";
import { QuickPanelPreview } from "@/features/quick-panel/components/QuickPanelPreview";
import { SubPageHeader } from "@/features/quick-panel/components/SubPageHeader";
import { useQuickPanelStore } from "@/features/quick-panel/store";
import type { ExportRefs } from "@/features/quick-panel/types";
import { useQuickPanelActions } from "@/features/quick-panel/useQuickPanelActions";
import { useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomizePage() {
  const refs = useExportRefs();
  const activePreset = useQuickPanelStore((state) => state.activePreset);
  const image = useQuickPanelStore((state) => state.image);
  const transform = useQuickPanelStore((state) => state.transform);
  const setTransform = useQuickPanelStore((state) => state.setTransform);
  const exports = useQuickPanelStore((state) => state.exports);
  const isExporting = useQuickPanelStore((state) => state.isExporting);
  const error = useQuickPanelStore((state) => state.error);
  const { exportImages, pickImage, resetFit } = useQuickPanelActions(refs);
  const [isPreviewAdjusting, setIsPreviewAdjusting] = useState(false);
  const hasExported = exports.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090b" }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          title="Customize"
          subtitle="Choose an image, then adjust the position"
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        scrollEnabled={!isPreviewAdjusting}
        overScrollMode="never"
      >
        {hasExported ? (
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
          <ImagePickerCard onPick={pickImage} />
        )}
        {!hasExported && image ? (
          <CustomizeActions
            isExporting={isExporting}
            onExport={exportImages}
            onPick={pickImage}
            onReset={resetFit}
          />
        ) : null}
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

function useExportRefs(): ExportRefs {
  const buttonBoxRef = useRef<View>(null);
  const mediaPlayerRef = useRef<View>(null);
  const brightnessRef = useRef<View>(null);
  const volumeRef = useRef<View>(null);
  return {
    brightness: brightnessRef,
    buttonBox: buttonBoxRef,
    mediaPlayer: mediaPlayerRef,
    volume: volumeRef,
  };
}

interface ImagePickerCardProps {
  onPick: () => void;
}

function ImagePickerCard({ onPick }: ImagePickerCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-120 items-center justify-center rounded-[30px] border border-zinc-800 bg-zinc-900 px-6 active:opacity-80"
      onPress={onPick}
    >
      <Text className="text-center text-lg font-semibold text-white">
        Choose an image from album
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
        PNG, JPG, WEBP are supported.
      </Text>
    </Pressable>
  );
}

interface CustomizeActionsProps {
  isExporting: boolean;
  onExport: () => void;
  onPick: () => void;
  onReset: () => void;
}

function CustomizeActions({
  isExporting,
  onExport,
  onPick,
  onReset,
}: CustomizeActionsProps) {
  return (
    <View className="mt-5 gap-3">
      <Button onPress={onPick}>Choose another image</Button>
      <View className="flex-row gap-3 pb-4">
        <Button className="flex-1" variant="secondary" onPress={onReset}>
          Reset fit
        </Button>
        <View className="flex-1 overflow-hidden rounded-md">
          <Button
            className="w-full bg-green-200/90"
            loading={isExporting}
            onPress={onExport}
            textClassName="font-semibold text-green-900"
          >
            {isExporting ? "" : "Export PNGs"}
          </Button>
          {isExporting ? (
            <Skeleton
              className="absolute inset-0 bg-white/30"
              pointerEvents="none"
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
