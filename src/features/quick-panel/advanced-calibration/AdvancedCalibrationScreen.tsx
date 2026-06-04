import { Text } from "@/components/ani-ui/text";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalibrationCanvas } from "../calibration/components/CalibrationCanvas";
import { AdvancedCalibrationControls } from "./AdvancedCalibrationControls";
import { AdvancedPanelCanvas } from "./components/AdvancedPanelCanvas";
import { useAdvancedCalibrationScreen } from "./hooks/useAdvancedCalibrationScreen";

export function AdvancedCalibrationScreen() {
  const { t } = useTranslation();
  const {
    advancedDraft,
    error,
    phase,
    importScreenshot,
    continueToPanels,
    returnToOuter,
    saveCalibration,
    setAdvancedOuterRect,
    setAdvancedPanels,
  } = useAdvancedCalibrationScreen();
  const screenshot = advancedDraft?.screenshot ?? null;
  const outerRect = advancedDraft?.outerRect ?? null;
  const panels = advancedDraft?.panels ?? null;
  const isEditing = Boolean(screenshot && outerRect);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          title={t("advancedCalibration.title")}
          subtitle={t(`advancedCalibration.${phase}Subtitle`)}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        {phase === "panels" && screenshot && outerRect && panels ? (
          <AdvancedPanelCanvas
            screenshot={screenshot}
            outerRect={outerRect}
            panels={panels}
            onPanelsChange={setAdvancedPanels}
          />
        ) : (
          <CalibrationCanvas
            screenshot={screenshot}
            rect={outerRect}
            onImport={importScreenshot}
            onRectChange={setAdvancedOuterRect}
            onContinue={continueToPanels}
            showControls={false}
          />
        )}
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      {isEditing ? (
        <View className="border-t border-white/10 px-5">
          <AdvancedCalibrationControls
            phase={phase}
            onBack={returnToOuter}
            onContinue={continueToPanels}
            onImport={importScreenshot}
            onSave={saveCalibration}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
