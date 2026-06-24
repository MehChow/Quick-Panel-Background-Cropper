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
const canvasPadding = 12;

interface CalibrationCanvasProps {
  controls?: ReactNode;
  rect: PanelRect | null;
  renderOverlay: (scale: number) => ReactNode;
  screenshot: PickedImage | null;
  onImport: () => void;
  showControls?: boolean;
  showImportButton?: boolean;
}

interface ImportScreenshotCardProps {
  onImport?: () => void;
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
  showImportButton = true,
}: CalibrationCanvasProps) {
  const [viewport, setViewport] = useState({ height: 0, width: 0 });

  if (!screenshot || !rect) {
    return (
      <View className="flex-1 justify-center">
        <ImportScreenshotCard
          onImport={showImportButton ? onImport : undefined}
        />
      </View>
    );
  }

  const maxWidth = Math.max(viewport.width - canvasPadding * 2, 0);
  const maxHeight = Math.max(viewport.height - canvasPadding * 2, 0);
  const widthScale = maxWidth / screenshot.width;
  const heightScale = maxHeight / screenshot.height;
  const scale = Math.min(widthScale, heightScale);
  const canvasWidth = Number.isFinite(scale) ? screenshot.width * scale : 0;
  const canvasHeight = Number.isFinite(scale) ? screenshot.height * scale : 0;

  return (
    <View
      className="flex-1 justify-center"
      onLayout={(event) =>
        setViewport({
          height: event.nativeEvent.layout.height,
          width: event.nativeEvent.layout.width,
        })
      }
    >
      <View
        className="self-center overflow-hidden rounded-[28px] border border-zinc-800 bg-black"
        style={{
          height: canvasHeight,
          width: canvasWidth,
        }}
      >
        <Image
          source={{ uri: screenshot.uri }}
          contentFit="fill"
          style={{ height: "100%", width: "100%" }}
        />
        {renderOverlay(scale)}
      </View>

      {showControls ? <View className="mt-4">{controls}</View> : null}
    </View>
  );
}

function ImportScreenshotCard({ onImport }: ImportScreenshotCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-107.5 gap-4 self-center rounded-2xl border-zinc-800 bg-zinc-900 min-[480px]:max-w-115 min-[600px]:max-w-130">
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

        <View className="w-full max-w-95 self-center">
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
      </View>

      {onImport ? (
        <Button
          className="w-full"
          onPress={onImport}
          textClassName="font-semibold"
        >
          {t("calibration.chooseFromAlbum")}
        </Button>
      ) : null}
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
