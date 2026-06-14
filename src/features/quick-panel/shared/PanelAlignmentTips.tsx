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

export function PanelAlignmentTips() {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <Text className="text-center font-semibold text-orange-400">
        {t("calibration.bestResultTitle")}
      </Text>

      <View className="flex-row">
        <TipCard
          description={t("advancedCalibration.panelHelpGood")}
          icon="check"
          iconColor="#16a34a"
          source={images.calibratePanelBoxGood}
        />
        <TipCard
          description={t("advancedCalibration.panelHelpBad")}
          icon="x"
          iconColor="#dc2626"
          source={images.calibratePanelBoxBad}
        />
      </View>
    </View>
  );
}

function TipCard({ description, icon, iconColor, source }: TipCardProps) {
  return (
    <View className="flex-1 items-center gap-4">
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

      <View className="items-center gap-2 px-2">
        <Lucide color={iconColor} name={icon} size={28} />
        <Text className="text-center text-sm font-medium text-zinc-200">
          {description}
        </Text>
      </View>
    </View>
  );
}
