import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { CalibrationOuterExample } from "./CalibrationOuterExample";
import { CalibrationOuterTips } from "./CalibrationOuterTips";
import { getHelpSheetMediaLayout } from "./help-sheet-media-layout";
import { useBottomSheetInsets } from "./useBottomSheetInsets";

interface CalibrationHelpSheetProps {
  onClose: () => void;
}

export function CalibrationHelpSheet({ onClose }: CalibrationHelpSheetProps) {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const layout = getHelpSheetMediaLayout(width, height);
  const { bottomInset, contentPaddingBottom } = useBottomSheetInsets();

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
        borderWidth: 1,
        borderColor: "#27272a",
        borderRadius: 32,
      }}
      enableDynamicSizing
      maxDynamicContentSize={layout.maxHeight}
      enableOverDrag={false}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      bottomInset={bottomInset}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: contentPaddingBottom,
          paddingTop: 8,
        }}
      >
        <View className="flex-row items-start gap-4">
          <View className="flex-1 gap-4 px-5">
            <Text className="text-lg font-semibold text-white">
              {t("calibration.helpTitle")}
            </Text>
            <Text className="text-sm font-medium leading-6 text-zinc-300">
              {t("calibration.instruction")}
            </Text>
          </View>
        </View>

        <View className="mt-6 px-5">
          <CalibrationOuterTips />
        </View>

        <View className="mt-8 px-5">
          <CalibrationOuterExample />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
