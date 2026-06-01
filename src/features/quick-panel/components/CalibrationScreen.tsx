import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Image } from "expo-image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { PanelRect, PickedImage } from "../types";
import { CalibrationControls } from "./CalibrationControls";
import { CalibrationOverlay } from "./CalibrationOverlay";

const exampleImageAspectRatio = 9 / 19.5;

interface CalibrationScreenProps {
  screenshot: PickedImage | null;
  rect: PanelRect | null;
  onImport: () => void;
  onRectChange: (rect: PanelRect) => void;
  onContinue: () => void;
}

interface ImportScreenshotCardProps {
  onImport: () => void;
}

interface ExamplePanelImageProps {
  icon: "check" | "x";
  iconColor: string;
  source: number;
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
    return <ImportScreenshotCard onImport={onImport} />;
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

      <CalibrationControls onContinue={onContinue} onImport={onImport} />
    </View>
  );
}

function ImportScreenshotCard({ onImport }: ImportScreenshotCardProps) {
  const { t } = useTranslation();

  return (
    <View className="w-full gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <View>
        <Text className="text-center text-lg font-semibold text-white">
          {t("calibration.importTitle")}
        </Text>
        <Text className="text-center text-sm leading-5 text-zinc-400">
          {t("calibration.importSubtitle")}
        </Text>
      </View>

      <View className="w-full">
        <Text className="text-center font-bold text-orange-400">
          {t("landing.example")}
        </Text>

        <View className="flex-row gap-4">
          <ExamplePanelImage
            icon="check"
            iconColor="green"
            source={require("@/assets/correct.jpeg")}
          />
          <ExamplePanelImage
            icon="x"
            iconColor="red"
            source={require("@/assets/incorrect.jpeg")}
          />
        </View>
      </View>

      <Button className="w-full" onPress={onImport}>
        {t("calibration.chooseFromAlbum")}
      </Button>
    </View>
  );
}

function ExamplePanelImage({
  icon,
  iconColor,
  source,
}: ExamplePanelImageProps) {
  return (
    <View className="flex-1 items-center gap-2">
      <Lucide name={icon} size={24} color={iconColor} />
      <View
        className="w-full overflow-hidden rounded-2xl border border-white"
        style={{ aspectRatio: exampleImageAspectRatio }}
      >
        <Image
          source={source}
          style={{ height: "100%", width: "100%" }}
          contentFit="cover"
        />
      </View>
    </View>
  );
}
