import { Button } from "@/components/ani-ui/button";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomizeActions } from "./components/CustomizeActions";
import { CustomizeImagePlacementHelpSheet } from "./components/CustomizeImagePlacementHelpSheet";
import { CustomizePreviewSection } from "./components/CustomizePreviewSection";
import { ExportSurfaceHost } from "./components/ExportSurfaceHost";
import { ImagePickerCard } from "./components/ImagePickerCard";
import { useButtonCustomizeControls } from "./hooks/useButtonCustomizeControls";
import { useCustomizePreviewImage } from "./hooks/useCustomizePreviewImage";
import { useCustomizeScreen } from "./hooks/useCustomizeScreen";
import { useSequentialExport } from "./hooks/useSequentialExport";
import { markHelpSeen } from "../store/storage";
export function CustomizeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const {
    selectedMode, activePreset, image, transform, setTransform,
    isExporting, isProcessingImage,
    setIsPreviewAdjusting,
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
  const openHelp = () => {
    markHelpSeen("customize-image-placement");
    setIsHelpOpen(true);
  };

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
              {isProcessingImage ? t("customize.optimizingImage") : t("calibration.chooseFromAlbum")}
            </Button>
          )
        }
        header={
          <SubPageHeader
            actionAccessibilityLabel={t("customize.imagePlacementHelpButton")}
            actionHelpId="customize-image-placement"
            actionVariant="helper-balanced"
            onActionPress={openHelp}
            subtitle={t("customize.subtitle")}
            title={t("customize.title")}
          />
        }
      >
        <View
          className="flex-1 overflow-hidden"
          testID="customize-middle-area"
          pointerEvents={isExporting ? "none" : "auto"}
        >
          {image ? (
            <CustomizePreviewSection
              buttonControls={buttonControls}
              image={image}
              onAdjustingChange={setIsPreviewAdjusting}
              onTransformChange={setTransform}
              preset={activePreset}
              previewUri={previewImage.previewUri}
              transform={transform}
            />
          ) : (
            <ImagePickerCard mode={selectedMode ?? "default"} onRecalibrate={recalibrate} preset={activePreset} />
          )}
        </View>
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
      {isHelpOpen ? <CustomizeImagePlacementHelpSheet onClose={() => setIsHelpOpen(false)} /> : null}
    </SafeAreaView>
  );
}
