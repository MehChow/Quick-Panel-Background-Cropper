import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const exampleImageAspectRatio = 1080 / 2340;

interface LandingScreenProps {
  isCalibrated: boolean;
  onCalibrate: () => void;
  onStart: () => void;
}

export function LandingScreen({
  isCalibrated,
  onCalibrate,
  onStart,
}: LandingScreenProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-8">
      <ExampleCard />

      <View className="gap-4">
        <Button className="w-full" onPress={onStart} disabled={!isCalibrated}>
          {t("landing.startCustomizing")}
        </Button>
        {isCalibrated ? (
          <Text className="text-center text-sm leading-5 text-zinc-400">
            {t("landing.calibrated")}{" "}
            <Text
              accessibilityRole="link"
              className="text-sm leading-5 text-emerald-300 underline"
              onPress={onCalibrate}
            >
              {t("landing.recalibrate")}
            </Text>
          </Text>
        ) : (
          <Button
            className="w-full bg-orange-200"
            onPress={onCalibrate}
            textClassName="font-semibold text-orange-800"
          >
            {t("landing.calibration")}
          </Button>
        )}
        {!isCalibrated ? (
          <Text className="text-center text-sm leading-5 text-zinc-400">
            {t("landing.calibrationRequired")}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ExampleCard() {
  const { t } = useTranslation();

  return (
    <View className="w-full flex-row items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <View className="items-center justify-center" style={{ width: 96 }}>
        <View style={{ height: 88, width: 88 }}>
          <Image
            source={require("@/assets/doro_like.gif")}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-center font-semibold text-orange-400">
          {t("landing.example")}
        </Text>
        <View
          className="w-full overflow-hidden rounded-2xl border border-white"
          style={{ aspectRatio: exampleImageAspectRatio }}
        >
          <Image
            source={require("@/assets/example.jpeg")}
            style={{ height: "100%", width: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}
