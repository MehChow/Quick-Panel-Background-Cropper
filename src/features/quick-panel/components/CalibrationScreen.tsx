import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import type { PanelRect, PickedImage } from "../types";
import { CalibrationControls } from "./CalibrationControls";
import { CalibrationOverlay } from "./CalibrationOverlay";

interface CalibrationScreenProps {
  screenshot: PickedImage | null;
  rect: PanelRect | null;
  onImport: () => void;
  onRectChange: (rect: PanelRect) => void;
  onContinue: () => void;
}

export function CalibrationScreen({
  screenshot,
  rect,
  onImport,
  onRectChange,
  onContinue,
}: CalibrationScreenProps) {
  const [viewWidth, setViewWidth] = useState(0);
  const scale = screenshot && viewWidth ? viewWidth / screenshot.width : 1;

  if (!screenshot || !rect) {
    return (
      <View className="h-120 items-center justify-center rounded-[30px] border border-zinc-800 bg-zinc-900 px-6">
        <Text className="text-center text-lg font-semibold text-white">
          Import Quick Panel screenshot
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
          Use a fully expanded screenshot. The app will suggest the panel area.
        </Text>
        <Button className="mt-6 w-full" onPress={onImport}>
          Choose screenshot
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View
        className="overflow-hidden rounded-[28px] border border-zinc-800 bg-black"
        onLayout={(event) => setViewWidth(event.nativeEvent.layout.width)}
        style={{ aspectRatio: screenshot.width / screenshot.height }}
      >
        <Image
          source={{ uri: screenshot.uri }}
          contentFit="fill"
          style={{ height: "100%", width: "100%" }}
        />
        <CalibrationOverlay
          rect={rect}
          scale={scale}
          screenshot={screenshot}
          onRectChange={onRectChange}
        />
      </View>

      <CalibrationControls
        onContinue={onContinue}
        onImport={onImport}
      />
    </View>
  );
}
