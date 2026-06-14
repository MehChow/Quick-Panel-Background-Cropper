import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

const panelAlignmentAspectRatio = 1080 / 1350;

export function PanelAlignmentExample() {
  const { t } = useTranslation();

  return (
    <View className="h-100 items-center">
      <Text className="text-center font-semibold text-orange-400">
        {t("landing.example")}
      </Text>

      <View className="mt-4 flex-row items-center gap-4">
        <ExampleCard source={images.calibratePanelBoxGood} />
        <ExampleCard source={images.calibratePanelBoxBad} />
      </View>
    </View>
  );
}

interface ExampleCardProps {
  source: number;
}

function ExampleCard({ source }: ExampleCardProps) {
  return (
    <View
      className="w-[45%] overflow-hidden rounded-2xl border border-white/90"
      style={{ aspectRatio: panelAlignmentAspectRatio }}
    >
      <Image
        contentFit="contain"
        source={source}
        style={{ height: "100%", width: "100%" }}
      />
    </View>
  );
}
