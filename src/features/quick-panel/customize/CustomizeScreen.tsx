import { Text } from "@/components/ani-ui/text";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { type Href, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomizeActions } from "./components/CustomizeActions";
import { ExportSuccessPanel } from "./components/ExportSuccessPanel";
import { ExportSurfaces } from "./components/ExportSurfaces";
import { ImagePickerCard } from "./components/ImagePickerCard";
import { QuickPanelPreview } from "./components/QuickPanelPreview";
import { useCustomizeScreen } from "./hooks/useCustomizeScreen";

export function CustomizeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    selectedMode,
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    error,
    refs,
    hasExported,
    isPreviewAdjusting,
    setIsPreviewAdjusting,
    exportImages,
    pickImage,
    resetFit,
    goToCalibration,
    goToAdvancedCalibration,
  } = useCustomizeScreen();

  const recalibrate = () => {
    if (selectedMode === "advanced") {
      goToAdvancedCalibration();
      router.push("/advanced-calibration" as Href);
      return;
    }
    goToCalibration();
    router.push("/calibration");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          title={t("customize.title")}
          subtitle={t("customize.subtitle")}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        scrollEnabled={!isPreviewAdjusting}
        overScrollMode="never"
      >
        {hasExported ? (
          <ExportSuccessPanel exports={exports} onConvertAnother={pickImage} />
        ) : image ? (
          <QuickPanelPreview
            image={image}
            preset={activePreset}
            onAdjustingChange={setIsPreviewAdjusting}
            transform={transform}
            onTransformChange={setTransform}
          />
        ) : (
          <ImagePickerCard
            mode={selectedMode ?? "default"}
            onPick={pickImage}
            onRecalibrate={recalibrate}
          />
        )}
        {!hasExported && image ? (
          <CustomizeActions
            isExporting={isExporting}
            onExport={exportImages}
            onPick={pickImage}
            onReset={resetFit}
          />
        ) : null}
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      {image && !hasExported ? (
        <ExportSurfaces
          image={image}
          transform={transform}
          preset={activePreset}
          refs={refs}
        />
      ) : null}
    </SafeAreaView>
  );
}
