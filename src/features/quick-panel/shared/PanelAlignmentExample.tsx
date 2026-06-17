import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";

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
    <HelpSheetZoomImage
      contentFit="contain"
      previewAspectRatio={panelAlignmentAspectRatio}
      source={source}
      thumbnailClassName="w-[45%]"
      thumbnailStyle={{ aspectRatio: panelAlignmentAspectRatio }}
    />
  );
}
