import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const calibrationExampleAspectRatio = 1080 / 2340;

export function CalibrationInstructionCard() {
  const { t } = useTranslation();

  return (
    <View className="items-center">
      <View className="w-full max-w-[180px] gap-2">
        <Text className="text-center font-semibold text-orange-400">
          {t("landing.example")}
        </Text>
        <View
          className="w-full overflow-hidden rounded-2xl border border-white/90"
          style={{ aspectRatio: calibrationExampleAspectRatio }}
        >
          <Image
            source={require("@/assets/calibrate.jpeg")}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}
