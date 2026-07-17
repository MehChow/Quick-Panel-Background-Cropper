import { Text } from "@/components/ani-ui/text";
import { Button } from "@/components/ani-ui/button";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { type Href, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomizeActions } from "./components/CustomizeActions";
import { ButtonCustomizeControls } from "./components/ButtonCustomizeControls";
import { ExportSurfaceHost } from "./components/ExportSurfaceHost";
import { ImagePickerCard } from "./components/ImagePickerCard";
import { QuickPanelPreview } from "./components/QuickPanelPreview";
import { useButtonCustomizeControls } from "./hooks/useButtonCustomizeControls";
import { useCustomizePreviewImage } from "./hooks/useCustomizePreviewImage";
import { useCustomizeScreen } from "./hooks/useCustomizeScreen";
import { useSequentialExport } from "./hooks/useSequentialExport";

export function CustomizeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    selectedMode, activePreset, image, transform, setTransform,
    isExporting, isProcessingImage, noticeKey, errorKey, error,
    isPreviewAdjusting, setIsPreviewAdjusting,
    pickImage, resetFit, canReset,
    goToCalibration, goToAdvancedCalibration,
  } = useCustomizeScreen();
  const buttonControls = useButtonCustomizeControls(activePreset);
  const previewImage = useCustomizePreviewImage(image);
  const sequentialExport = useSequentialExport({
    image,
    isProcessingImage,
    preset: activePreset,
    showButtonIdentifiers: buttonControls.showButtonIdentifiers,
  });

  const recalibrate = () => {
    if (selectedMode === "advanced") {
      goToAdvancedCalibration();
      router.push("/advanced-calibration" as Href);
      return;
    }
    goToCalibration();
    router.push("/calibration");
  };
  const hasButtonPanels = activePreset.visualOrder.some(
    (id) => activePreset.panels[id]?.family === "button",
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuickPanelScreenShell
        footer={
          image ? (
            <CustomizeActions
              isExporting={isExporting}
              isProcessingImage={isProcessingImage}
              onExport={sequentialExport.startExport}
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
          <SubPageHeader title={t("customize.title")} subtitle={t("customize.subtitle")} />
        }
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center pb-4"
          pointerEvents={isExporting ? "none" : "auto"}
          scrollEnabled={!isPreviewAdjusting && !isExporting}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {image ? (
            <View className="items-center">
              <QuickPanelPreview
                buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
                buttonPanelOpacity={buttonControls.buttonPanelOpacity / 100}
                identifierPositions={buttonControls.identifierPositions}
                image={image}
                previewUri={previewImage.previewUri}
                preset={activePreset}
                onAdjustingChange={setIsPreviewAdjusting}
                transform={transform}
                onTransformChange={setTransform}
                showButtonIdentifiers={buttonControls.showButtonIdentifiers}
              />
              {hasButtonPanels ? (
                <ButtonCustomizeControls
                  buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity}
                  buttonPanelOpacity={buttonControls.buttonPanelOpacity}
                  hasHorizontalButtons={buttonControls.hasHorizontalButtons}
                  hasVerticalButtons={buttonControls.hasVerticalButtons}
                  horizontalIdentifierPosition={buttonControls.horizontalIdentifierPosition}
                  onButtonIdentifierOpacityChange={buttonControls.setButtonIdentifierOpacity}
                  onButtonPanelOpacityChange={buttonControls.setButtonPanelOpacity}
                  onHorizontalIdentifierPositionChange={buttonControls.setHorizontalIdentifierPosition}
                  onShowButtonIdentifiersChange={buttonControls.setShowButtonIdentifiers}
                  onVerticalIdentifierPositionChange={buttonControls.setVerticalIdentifierPosition}
                  showButtonIdentifiers={buttonControls.showButtonIdentifiers}
                  verticalIdentifierPosition={buttonControls.verticalIdentifierPosition}
                />
              ) : null}
            </View>
          ) : (
            <ImagePickerCard mode={selectedMode ?? "default"} onRecalibrate={recalibrate} preset={activePreset} />
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
      {image && sequentialExport.activePanel && sequentialExport.activeToken ? (
        <ExportSurfaceHost
          activePanel={sequentialExport.activePanel}
          activeToken={sequentialExport.activeToken}
          buttonIdentifierOpacity={buttonControls.buttonIdentifierOpacity / 100}
          buttonPanelOpacity={buttonControls.buttonPanelOpacity / 100}
          exportRef={sequentialExport.exportRef}
          identifierPositions={buttonControls.identifierPositions}
          image={image}
          markIdentifierReady={sequentialExport.markIdentifierReady}
          markImageReady={sequentialExport.markImageReady}
          transform={transform}
          showButtonIdentifiers={buttonControls.showButtonIdentifiers}
        />
      ) : null}
    </SafeAreaView>
  );
}
