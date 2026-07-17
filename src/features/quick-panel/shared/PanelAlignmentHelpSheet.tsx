import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { PanelAlignmentTips } from "./PanelAlignmentTips";
import { getHelpSheetMediaLayout } from "./help-sheet-media-layout";
import { useBottomSheetInsets } from "./useBottomSheetInsets";
import type { AdvancedTarget } from "../model/types";

interface PanelAlignmentHelpSheetProps {
  onClose: () => void;
  target: AdvancedTarget;
}

export function PanelAlignmentHelpSheet({
  onClose,
  target,
}: PanelAlignmentHelpSheetProps) {
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
      bottomInset={bottomInset}
      maxDynamicContentSize={layout.maxHeight}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: contentPaddingBottom,
          paddingTop: 8,
        }}
      >
        <View className="mb-5 flex-row items-start gap-4">
          <View className="flex-1 gap-4 px-5">
            <Text className="text-lg font-semibold text-white">
              {t("advancedCalibration.panelHelpTitle")}
            </Text>
            <Text className="text-sm font-medium leading-6 text-zinc-300">
              {t(
                target === "buttons"
                  ? "advancedCalibration.buttonPanelHelpBody"
                  : "advancedCalibration.panelHelpBody",
              )}
            </Text>
          </View>
        </View>

        <View className="px-5">
          <PanelAlignmentTips target={target} />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
