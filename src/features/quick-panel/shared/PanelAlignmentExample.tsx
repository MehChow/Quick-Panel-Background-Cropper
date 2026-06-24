import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";
import { getHelpSheetMediaLayout } from "./help-sheet-media-layout";

const panelAlignmentAspectRatio = 1080 / 1350;

export function PanelAlignmentExample() {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const layout = getHelpSheetMediaLayout(width, height);

  return (
    <View className="items-center">
      <Text className="text-center font-semibold text-orange-400">
        {t("landing.example")}
      </Text>

      <View className="mt-4 flex-row items-center gap-4">
        <ExampleCard maxWidth={layout.panelExampleWidth} source={images.calibratePanelBoxGood} />
        <ExampleCard maxWidth={layout.panelExampleWidth} source={images.calibratePanelBoxBad} />
      </View>
    </View>
  );
}

interface ExampleCardProps {
  maxWidth: number;
  source: number;
}

function ExampleCard({ maxWidth, source }: ExampleCardProps) {
  return (
    <HelpSheetZoomImage
      contentFit="contain"
      previewAspectRatio={panelAlignmentAspectRatio}
      previewMaxWidth={maxWidth}
      source={source}
      thumbnailStyle={{ aspectRatio: panelAlignmentAspectRatio, width: maxWidth }}
    />
  );
}
