import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { OuterCalibrationStep } from "../shared/OuterCalibrationStep";
import { getDefaultDisplayRect } from "./default-display-rect";
import { useCalibrationScreen } from "./hooks/useCalibrationScreen";

export function CalibrationScreen() {
  const { t } = useTranslation();
  const {
    errorKey,
    error,
    displayedScreenshot,
    displayedRect,
    setCalibrationRect,
    importScreenshot,
    saveCalibration,
  } = useCalibrationScreen();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <OuterCalibrationStep
        error={error}
        errorKey={errorKey}
        footerTestID="calibration-footer"
        getDisplayRect={getDefaultDisplayRect}
        helpId="calibration-outer"
        primaryLabel={t("common.confirm")}
        rect={displayedRect}
        screenshot={displayedScreenshot}
        subtitle={t("calibration.subtitle")}
        title={t("calibration.title")}
        onImport={importScreenshot}
        onPrimaryPress={saveCalibration}
        onRectChange={setCalibrationRect}
      />
    </SafeAreaView>
  );
}
