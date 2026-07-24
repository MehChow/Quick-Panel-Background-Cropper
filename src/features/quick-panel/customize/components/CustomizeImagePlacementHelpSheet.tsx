import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import { useBottomSheetInsets } from "../../shared/useBottomSheetInsets";

interface CustomizeImagePlacementHelpSheetProps {
  onClose: () => void;
}

export function CustomizeImagePlacementHelpSheet({
  onClose,
}: CustomizeImagePlacementHelpSheetProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
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
      bottomInset={bottomInset}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      maxDynamicContentSize={height * 0.85}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: contentPaddingBottom,
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <View className="gap-2">
          <Text className="text-lg font-semibold text-white">
            {t("customize.imagePlacementHelpTitle")}
          </Text>
          <View className="gap-3">
            <Text className="text-sm leading-6 text-zinc-300">
              {t("customize.imagePlacementHelpBody")}
            </Text>
            <Text className="text-sm leading-6 text-zinc-300">
              {t("customize.imagePlacementBoundaryHelp")}
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
