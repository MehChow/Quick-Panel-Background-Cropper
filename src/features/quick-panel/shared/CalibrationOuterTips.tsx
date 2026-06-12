import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import Lucide from "@react-native-vector-icons/lucide";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface TipCardProps {
  description: string;
  icon: "check" | "x";
  iconColor: string;
  source: number;
}

export function CalibrationOuterTips() {
  const { t } = useTranslation();

  return (
    <View className="gap-4 h-100">
      <Text className="text-center font-semibold text-orange-400">
        {t("calibration.bestResultTitle")}
      </Text>

      <View className="flex-row mt-12">
        <TipCard
          description={t("calibration.bestResultGood")}
          icon="check"
          iconColor="#16a34a"
          source={images.calibrateGood}
        />
        <TipCard
          description={t("calibration.bestResultBad")}
          icon="x"
          iconColor="#dc2626"
          source={images.calibrateBad}
        />
      </View>
    </View>
  );
}

function TipCard({ description, icon, iconColor, source }: TipCardProps) {
  return (
    <View className="flex-col items-center gap-4 flex-1">
      <View
        className="w-32 overflow-hidden rounded-2xl border border-white/90"
        style={{ aspectRatio: 1 }}
      >
        <Image
          contentFit="cover"
          source={source}
          style={{ height: "100%", width: "100%" }}
        />
      </View>

      <View className="items-center gap-2">
        <Lucide color={iconColor} name={icon} size={28} />
        <Text className="text-sm font-medium text-center text-zinc-200">
          {description}
        </Text>
      </View>
    </View>
  );
}
