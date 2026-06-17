import { Text } from "@/components/ani-ui/text";
import { images } from "@/data/images";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HelpSheetZoomImage } from "@/features/quick-panel/shared/HelpSheetZoomImage";

interface Props {
  onClose: () => void;
}

export function AdvancedGridSheet({ onClose }: Props) {
  const { i18n, t } = useTranslation();
  const isEnglish = i18n.resolvedLanguage === "en";
  const columnUnit = isEnglish ? "col" : t("advancedCalibration.columns");
  const rowUnit = isEnglish ? "row" : t("advancedCalibration.rows");
  const firstExampleLabels = (
    <View className="flex-row gap-2">
      <Text className="font-semibold text-red-500">4 {columnUnit}</Text>
      <Text className="font-semibold text-blue-500">3 {rowUnit}</Text>
    </View>
  );
  const secondExampleLabels = (
    <View className="flex-row gap-2">
      <Text className="font-semibold text-red-500">4 {columnUnit}</Text>
      <Text className="font-semibold text-blue-500">5 {rowUnit}</Text>
    </View>
  );

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
      backgroundStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: 32, borderWidth: 1 }}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "#52525b", height: 6, width: 48 }}
      index={0}
      onClose={onClose}
    >
      <BottomSheetView style={{ paddingBottom: 32, paddingHorizontal: 20, paddingTop: 8 }}>
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-lg font-semibold text-white">
              {t("advancedCalibration.gridSheetTitle")}
            </Text>
            <Text className="text-sm leading-6 text-zinc-300">
              {t("advancedCalibration.gridSheetSubtitle")}
            </Text>
          </View>

          <View className="gap-3">
            <Text className="text-center font-semibold text-orange-400">
              {t("landing.example")}
            </Text>

            <View className="flex-row gap-4">
              <View className="flex-1 items-center">
                {firstExampleLabels}
                <HelpSheetZoomImage
                  contentFit="contain"
                  source={images.calibrateGridCountExample1}
                  thumbnailClassName="mt-3 h-56 w-full border-0 bg-zinc-900"
                  thumbnailStyle={{ aspectRatio: undefined }}
                />
              </View>

              <View className="flex-1 items-center">
                {secondExampleLabels}
                <HelpSheetZoomImage
                  contentFit="contain"
                  source={images.calibrateGridCountExample2}
                  thumbnailClassName="mt-3 h-56 w-full border-0 bg-zinc-900"
                  thumbnailStyle={{ aspectRatio: undefined }}
                />
              </View>
            </View>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
