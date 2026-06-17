import { Button } from "@/components/ani-ui/button";
import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Image } from "expo-image";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { PanelRect, PickedImage } from "../../model/types";

const exampleImageAspectRatio = 9 / 19.5;

interface CalibrationCanvasProps {
  controls?: ReactNode;
  rect: PanelRect | null;
  renderOverlay: (scale: number) => ReactNode;
  screenshot: PickedImage | null;
  onImport: () => void;
  showControls?: boolean;
}

interface ImportScreenshotCardProps {
  onImport: () => void;
}

interface ExamplePanelImageProps {
  icon: "check" | "x";
  iconColor: string;
  source: number;
}

export function CalibrationCanvas({
  controls,
  rect,
  renderOverlay,
  screenshot,
  onImport,
  showControls = true,
}: CalibrationCanvasProps) {
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
        {renderOverlay(scale)}
      </View>

      {showControls ? controls : null}
    </View>
  );
}

function ImportScreenshotCard({ onImport }: ImportScreenshotCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full gap-4 rounded-2xl border-zinc-800 bg-zinc-900">
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
            source={images.tutorialCorrect}
          />
          <ExamplePanelImage
            icon="x"
            iconColor="red"
            source={images.tutorialIncorrect}
          />
        </View>
      </View>

      <Button
        className="w-full"
        onPress={onImport}
        textClassName="font-semibold"
      >
        {t("calibration.chooseFromAlbum")}
      </Button>
    </Card>
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
