import { Text } from "@/components/ani-ui/text";
import { CalibrationHelpSheet } from "@/features/quick-panel/shared/CalibrationHelpSheet";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
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
      <View className="px-5 pt-8">
        <SubPageHeader
          actionAccessibilityLabel={t("calibration.helpButton")}
          actionIcon="circle-help"
          onActionPress={isCalibrating ? openHelp : undefined}
          title={t("calibration.title")}
          subtitle={t("calibration.subtitle")}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        <CalibrationCanvas
          screenshot={displayedScreenshot}
          rect={displayedRect}
          onImport={importScreenshot}
          controls={(
            <CalibrationControls
              onContinue={saveCalibration}
              onImport={importScreenshot}
            />
          )}
          renderOverlay={(scale) => (
            displayedRect && displayedScreenshot
              ? (
                <DefaultCalibrationOverlay
                  rect={displayedRect}
                  scale={scale}
                  screenshot={displayedScreenshot}
                  onRectChange={setCalibrationRect}
                />
              )
              : null
          )}
          showControls={!isCalibrating}
        />
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      {isCalibrating ? (
        <View className="border-t border-white/10 px-5">
          <CalibrationControls
            onContinue={saveCalibration}
            onImport={importScreenshot}
          />
        </View>
      ) : null}
      {isHelpOpen ? <CalibrationHelpSheet onClose={closeHelp} /> : null}
    </SafeAreaView>
  );
}
