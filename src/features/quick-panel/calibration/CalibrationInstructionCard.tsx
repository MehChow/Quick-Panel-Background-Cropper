import { Text } from "@/components/ani-ui/text";
import { Image, type ImageSource } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const calibrationExampleAspectRatio = 1080 / 2340;

interface CalibrationInstructionCardProps {
  imageSource: ImageSource | number;
}

export function CalibrationInstructionCard({
  imageSource,
}: CalibrationInstructionCardProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center">
      <View className="w-full max-w-45 gap-2">
        <Text className="text-center font-semibold text-orange-400">
          {t("landing.example")}
        </Text>
        <View
          className="w-full overflow-hidden rounded-2xl border border-white/90"
          style={{ aspectRatio: calibrationExampleAspectRatio }}
        >
          <Image
            source={imageSource}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}
