import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { CalibrationInstructionCard } from "./CalibrationInstructionCard";

interface CalibrationHelpSheetProps {
  onClose: () => void;
  visible: boolean;
}

export function CalibrationHelpSheet({
  onClose,
  visible,
}: CalibrationHelpSheetProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

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
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={visible ? 0 : -1}
      maxDynamicContentSize={height * 0.85}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <View className="mb-4">
          <Text className="text-lg font-semibold text-white">
            {t("calibration.helpTitle")}
          </Text>
        </View>
        <Text className="mb-4 text-sm font-medium leading-6 text-zinc-300">
          {t("calibration.instruction")}
        </Text>
        <CalibrationInstructionCard />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
