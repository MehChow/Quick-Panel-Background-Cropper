import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";
import { getHelpSheetLayout } from "./help-sheet-layout";

interface PanelReviewHelpSheetProps {
  onClose: () => void;
}

export function PanelReviewHelpSheet({ onClose }: PanelReviewHelpSheetProps) {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const layout = getHelpSheetLayout(width, height);
  const panelReviewAspectRatio = 1080 / 1346;

  return (
    <BottomSheet
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{
        backgroundColor: "#18181b",
        borderColor: "#27272a",
        borderRadius: 32,
        borderWidth: 1,
      }}
      enableDynamicSizing
      enableOverDrag={false}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      maxDynamicContentSize={layout.maxHeight}
      onClose={onClose}
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}>
        <View className="gap-4 px-5">
          <Text className="text-lg font-semibold text-white">
            {t("advancedCalibration.reviewHelpTitle")}
          </Text>
          <Text className="text-sm font-medium leading-6 text-zinc-300">
            {t("advancedCalibration.reviewHelpBody")}
          </Text>
        </View>

        <View className="mt-6 items-center px-5">
          <Text className="text-center font-semibold text-orange-400">
            {t("landing.example")}
          </Text>

          <HelpSheetZoomImage
            contentFit="contain"
            previewAspectRatio={panelReviewAspectRatio}
            previewMaxWidth={layout.reviewExampleWidth}
            source={images.calibratePanelBoxReview}
            thumbnailClassName="mt-4 border-0 bg-zinc-900"
            thumbnailStyle={{
              aspectRatio: panelReviewAspectRatio,
              marginBottom: 8,
              width: layout.reviewExampleWidth,
            }}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
