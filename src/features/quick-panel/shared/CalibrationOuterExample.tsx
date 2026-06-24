import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";
import { getHelpSheetMediaLayout } from "./help-sheet-media-layout";

const calibrationExampleAspectRatio = 1080 / 2340;

export function CalibrationOuterExample() {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const layout = getHelpSheetMediaLayout(width, height);

  return (
    <View className="items-center">
      <Text className="text-center font-semibold text-orange-400">
        {t("landing.example")}
      </Text>

      <View className="mt-4 flex-row items-start gap-4">
        <HelpSheetZoomImage
          contentFit="contain"
          previewAspectRatio={calibrationExampleAspectRatio}
          previewMaxWidth={layout.tallExampleWidth}
          source={images.calibrateOuterExample1}
          thumbnailStyle={{
            aspectRatio: calibrationExampleAspectRatio,
            width: layout.tallExampleWidth,
          }}
        />
        <HelpSheetZoomImage
          contentFit="contain"
          previewAspectRatio={calibrationExampleAspectRatio}
          previewMaxWidth={layout.tallExampleWidth}
          source={images.calibrateOuterExample2}
          thumbnailStyle={{
            aspectRatio: calibrationExampleAspectRatio,
            width: layout.tallExampleWidth,
          }}
        />
      </View>
    </View>
  );
}
