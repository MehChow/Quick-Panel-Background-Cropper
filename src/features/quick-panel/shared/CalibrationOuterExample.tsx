import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";

const calibrationExampleAspectRatio = 1080 / 2340;

export function CalibrationOuterExample() {
  const { t } = useTranslation();

  return (
    <View className="items-center h-100">
      <Text className="text-center font-semibold text-orange-400">
        {t("landing.example")}
      </Text>

      <View className="flex-row items-center gap-4">
        <HelpSheetZoomImage
          contentFit="contain"
          previewAspectRatio={calibrationExampleAspectRatio}
          source={images.calibrateOuterExample1}
          thumbnailClassName="mt-4 w-[45%]"
          thumbnailStyle={{ aspectRatio: calibrationExampleAspectRatio }}
        />
        <HelpSheetZoomImage
          contentFit="contain"
          previewAspectRatio={calibrationExampleAspectRatio}
          source={images.calibrateOuterExample2}
          thumbnailClassName="mt-4 w-[45%]"
          thumbnailStyle={{ aspectRatio: calibrationExampleAspectRatio }}
        />
      </View>
    </View>
  );
}
