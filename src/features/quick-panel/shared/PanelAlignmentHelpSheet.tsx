import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PanelAlignmentTips } from "./PanelAlignmentTips";

interface PanelAlignmentHelpSheetProps {
  onClose: () => void;
}

export function PanelAlignmentHelpSheet({
  onClose,
}: PanelAlignmentHelpSheetProps) {
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
      <BottomSheetView className="pb-8 pt-2">
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
      </BottomSheetView>
    </BottomSheet>
  );
}
