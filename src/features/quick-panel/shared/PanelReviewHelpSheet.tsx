import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HelpSheetZoomImage } from "./HelpSheetZoomImage";

interface PanelReviewHelpSheetProps {
  onClose: () => void;
}

export function PanelReviewHelpSheet({ onClose }: PanelReviewHelpSheetProps) {
  const { t } = useTranslation();

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
      enableOverDrag={false}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      onClose={onClose}
    >
      <BottomSheetView className="pt-2">
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
            source={images.calibratePanelBoxReview}
            thumbnailClassName="mt-4 mb-8 w-3/4 border-0 bg-zinc-900"
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
