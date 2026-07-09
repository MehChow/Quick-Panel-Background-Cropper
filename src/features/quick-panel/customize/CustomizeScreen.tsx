import { Text } from "@/components/ani-ui/text";
import { Button } from "@/components/ani-ui/button";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { type Href, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomizeActions } from "./components/CustomizeActions";
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
    isExporting,
    isProcessingImage,
    noticeKey,
    errorKey,
    error,
    refs,
    isPreviewAdjusting,
    setIsPreviewAdjusting,
    exportImages,
    exportLoadToken,
    pickImage,
    resetFit,
    canReset,
    setIsExportSurfaceReady,
    shouldRenderExportSurfaces,
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
      <QuickPanelScreenShell
        footer={
          image ? (
            <CustomizeActions
              isExporting={isExporting}
              isProcessingImage={isProcessingImage}
              onExport={exportImages}
              onPick={pickImage}
              onReset={resetFit}
              canReset={canReset}
            />
          ) : (
            <Button
              className="my-4 w-full bg-white"
              disabled={isProcessingImage}
              loading={isProcessingImage}
              onPress={pickImage}
              textClassName="font-semibold text-zinc-900"
            >
              {isProcessingImage
                ? t("customize.optimizingImage")
                : t("calibration.chooseFromAlbum")}
            </Button>
          )
        }
        header={
          <SubPageHeader
            title={t("customize.title")}
            subtitle={t("customize.subtitle")}
          />
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center pb-4"
          scrollEnabled={!isPreviewAdjusting}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {image ? (
            <View className="items-center">
              <QuickPanelPreview
                image={image}
                preset={activePreset}
                onAdjustingChange={setIsPreviewAdjusting}
                transform={transform}
                onTransformChange={setTransform}
              />
            </View>
          ) : (
            <ImagePickerCard
              mode={selectedMode ?? "default"}
              onRecalibrate={recalibrate}
              preset={activePreset}
            />
          )}
          {noticeKey ? (
            <Text className="mt-4 rounded-md bg-green-500/15 p-3 text-sm text-green-100">
              {t(noticeKey)}
            </Text>
          ) : null}
          {error ? (
            <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
              {error}
            </Text>
          ) : null}
          {errorKey ? (
            <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
              {t(errorKey)}
            </Text>
          ) : null}
        </ScrollView>
      </QuickPanelScreenShell>
      {image && shouldRenderExportSurfaces ? (
        <ExportSurfaces
          image={image}
          loadToken={exportLoadToken}
          onReady={setIsExportSurfaceReady}
          transform={transform}
          preset={activePreset}
          refs={refs}
        />
      ) : null}
    </SafeAreaView>
  );
}
