import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const calibrationExampleAspectRatio = 1080 / 2340;

export function CalibrationOuterExample() {
  const { t } = useTranslation();

  return (
    <View className="items-center h-100">
      <Text className="text-center font-semibold text-orange-400">
        {t("landing.example")}
      </Text>

      <View className="flex-row items-center gap-4">
        <View
          className="w-[45%] overflow-hidden rounded-2xl border border-white/90 mt-4"
          style={{ aspectRatio: calibrationExampleAspectRatio }}
        >
          <Image
            contentFit="contain"
            source={images.calibrateOuterExample1}
            style={{ height: "100%", width: "100%" }}
          />
        </View>

        <View
          className="w-[45%] overflow-hidden rounded-2xl border border-white/90 mt-4"
          style={{ aspectRatio: calibrationExampleAspectRatio }}
        >
          <Image
            contentFit="contain"
            source={images.calibrateOuterExample2}
            style={{ height: "100%", width: "100%" }}
          />
        </View>
      </View>
    </View>
  );
}
