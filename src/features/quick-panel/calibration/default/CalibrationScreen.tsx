import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { CalibrationHelpSheet } from "@/features/quick-panel/shared/CalibrationHelpSheet";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalibrationCanvas } from "../shared/CalibrationCanvas";
import { CalibrationControls } from "./CalibrationControls";
import { DefaultCalibrationOverlay } from "./components/DefaultCalibrationOverlay";
import { useCalibrationScreen } from "./hooks/useCalibrationScreen";

export function CalibrationScreen() {
  const { t } = useTranslation();
  const {
    error,
    isHelpOpen,
    displayedScreenshot,
    displayedRect,
    isCalibrating,
    setCalibrationRect,
    importScreenshot,
    saveCalibration,
    openHelp,
    closeHelp,
  } = useCalibrationScreen();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuickPanelScreenShell
        footer={
          isCalibrating ? (
            <CalibrationControls
              onContinue={saveCalibration}
              onImport={importScreenshot}
            />
          ) : (
            <Button
              className="my-4 w-full bg-white"
              onPress={importScreenshot}
              textClassName="font-semibold text-black"
            >
              {t("calibration.chooseFromAlbum")}
            </Button>
          )
        }
        footerTestID="calibration-footer"
        header={
          <SubPageHeader
            actionAccessibilityLabel={t("calibration.helpButton")}
            actionVariant="helper-balanced"
            onActionPress={isCalibrating ? openHelp : undefined}
            title={t("calibration.title")}
            subtitle={t("calibration.subtitle")}
          />
        }
      >
        <CalibrationCanvas
          screenshot={displayedScreenshot}
          rect={displayedRect}
          onImport={importScreenshot}
          renderOverlay={(scale) =>
            displayedRect && displayedScreenshot ? (
              <DefaultCalibrationOverlay
                rect={displayedRect}
                scale={scale}
                screenshot={displayedScreenshot}
                onRectChange={setCalibrationRect}
              />
            ) : null
          }
          showControls={false}
          showImportButton={false}
        />
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </QuickPanelScreenShell>
      {isHelpOpen ? <CalibrationHelpSheet onClose={closeHelp} /> : null}
    </SafeAreaView>
  );
}
