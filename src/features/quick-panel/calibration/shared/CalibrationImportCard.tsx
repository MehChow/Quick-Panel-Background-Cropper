import { Button } from "@/components/ani-ui/button";
import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const exampleImageAspectRatio = 9 / 19.5;

interface CalibrationImportCardProps {
  onImport?: () => void;
}

interface ExamplePanelImageProps {
  icon: "check" | "x";
  iconColor: string;
  source: number;
}

export function CalibrationImportCard({
  onImport,
}: CalibrationImportCardProps) {
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
          contentFit="cover"
          source={source}
          style={{ height: "100%", width: "100%" }}
        />
      </View>
    </View>
  );
}
