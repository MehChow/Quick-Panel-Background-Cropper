import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { PanelAlignmentTips } from "./PanelAlignmentTips";
import { getHelpSheetMediaLayout } from "./help-sheet-media-layout";

interface PanelAlignmentHelpSheetProps {
  onClose: () => void;
}

export function PanelAlignmentHelpSheet({
  onClose,
}: PanelAlignmentHelpSheetProps) {
  const { t } = useTranslation();
  const { height, width } = useWindowDimensions();
  const layout = getHelpSheetMediaLayout(width, height);

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
        <View className="mb-5 flex-row items-start gap-4">
          <View className="flex-1 gap-4 px-5">
            <Text className="text-lg font-semibold text-white">
              {t("advancedCalibration.panelHelpTitle")}
            </Text>
            <Text className="text-sm font-medium leading-6 text-zinc-300">
              {t("advancedCalibration.panelHelpBody")}
            </Text>
          </View>
        </View>

        <View className="px-5">
          <PanelAlignmentTips />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
