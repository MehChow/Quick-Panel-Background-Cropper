import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import Lucide from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";
import { getHelpSheetLayout } from "./help-sheet-layout";

const panelAlignmentGoodAspectRatio = 1080 / 1291;
const panelAlignmentBadAspectRatio = 1080 / 1293;

interface TipCardProps {
  aspectRatio: number;
  description: string;
  icon: "check" | "x";
  iconColor: string;
  maxWidth: number;
  source: number;
}

export function PanelAlignmentTips() {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const layout = getHelpSheetLayout(width, height);

  return (
    <View className="gap-4">
      <Text className="text-center font-semibold text-orange-400">
        {t("calibration.bestResultTitle")}
      </Text>

      <View className="flex-row">
        <TipCard
          aspectRatio={panelAlignmentGoodAspectRatio}
          description={t("advancedCalibration.panelHelpGood")}
          icon="check"
          iconColor="#16a34a"
          maxWidth={layout.panelExampleWidth}
          source={images.calibratePanelBoxGood}
        />
        <TipCard
          aspectRatio={panelAlignmentBadAspectRatio}
          description={t("advancedCalibration.panelHelpBad")}
          icon="x"
          iconColor="#dc2626"
          maxWidth={layout.panelExampleWidth}
          source={images.calibratePanelBoxBad}
        />
      </View>
    </View>
  );
}

function TipCard({
  aspectRatio,
  description,
  icon,
  iconColor,
  maxWidth,
  source,
}: TipCardProps) {
  return (
    <View className="flex-1 items-center gap-4">
      <HelpSheetZoomImage
        contentFit="contain"
        previewAspectRatio={aspectRatio}
        previewMaxWidth={maxWidth}
        source={source}
        thumbnailStyle={{ aspectRatio, width: maxWidth }}
      />

      <View className="items-center gap-2 px-2">
        <Lucide color={iconColor} name={icon} size={28} />
        <Text className="text-center text-sm font-medium text-zinc-200">
          {description}
        </Text>
      </View>
    </View>
  );
}
