import { useState } from "react";
import { Text } from "@/components/ani-ui/text";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AdvancedGridSheet } from "./AdvancedGridSheet";
import {
  isPanelPhase,
  type AdvancedCalibrationPhase,
} from "./advanced-steps";
import { CalibrationCanvas } from "../calibration/components/CalibrationCanvas";
import { AdvancedCalibrationControls } from "./AdvancedCalibrationControls";
import { AdvancedPanelCanvas } from "./components/AdvancedPanelCanvas";
import { useAdvancedCalibrationScreen } from "./hooks/useAdvancedCalibrationScreen";

export function AdvancedCalibrationScreen() {
  const { t } = useTranslation();
  const [isGridSheetOpen, setIsGridSheetOpen] = useState(false);
  const {
    advancedDraft,
    canGoBack,
    error,
    goBack,
    goForward,
    grid,
    incrementColumns,
    incrementRows,
    decrementColumns,
    decrementRows,
    isConfirmPhase,
    isOuterPhase,
    phase,
    importScreenshot,
    saveCalibration,
    setAdvancedOuterRect,
    setAdvancedPanels,
  } = useAdvancedCalibrationScreen();
  const screenshot = advancedDraft?.screenshot ?? null;
  const outerRect = advancedDraft?.outerRect ?? null;
  const panels = advancedDraft?.panels ?? null;
  const isEditing = Boolean(screenshot && outerRect);
  const isPanelStep = isPanelPhase(phase);
  const showGridSheet = isPanelStep && isGridSheetOpen;

  const handleBack = () => {
    setIsGridSheetOpen(false);
    goBack();
  };

  const handleNext = () => {
    setIsGridSheetOpen(false);
    goForward();
  };

  const handleSave = () => {
    setIsGridSheetOpen(false);
    saveCalibration();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          actionAccessibilityLabel={t("advancedCalibration.gridSettingsButton")}
          actionIcon="settings-2"
          onActionPress={isPanelStep ? () => setIsGridSheetOpen(true) : undefined}
          title={t("advancedCalibration.title")}
          subtitle={getSubtitle(phase, t)}
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        overScrollMode="never"
      >
        {!isOuterPhase && screenshot && outerRect && panels ? (
          <AdvancedPanelCanvas
            grid={grid}
            screenshot={screenshot}
            outerRect={outerRect}
            phase={phase}
            panels={panels}
            onPanelsChange={setAdvancedPanels}
          />
        ) : (
          <CalibrationCanvas
            screenshot={screenshot}
            rect={outerRect}
            onImport={importScreenshot}
            onRectChange={setAdvancedOuterRect}
            onContinue={goForward}
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
            canGoBack={canGoBack}
            isConfirmPhase={isConfirmPhase}
            isOuterPhase={isOuterPhase}
            onBack={handleBack}
            onNext={handleNext}
            onImport={importScreenshot}
            onSave={handleSave}
          />
        </View>
      ) : null}
      {showGridSheet ? (
        <AdvancedGridSheet
          columns={grid.columns}
          onClose={() => setIsGridSheetOpen(false)}
          onDecreaseColumns={decrementColumns}
          onDecreaseRows={decrementRows}
          onIncreaseColumns={incrementColumns}
          onIncreaseRows={incrementRows}
          rows={grid.rows}
        />
      ) : null}
    </SafeAreaView>
  );
}

function getSubtitle(
  phase: AdvancedCalibrationPhase,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (phase === "outer") {
    return t("advancedCalibration.outerSubtitle");
  }
  if (phase === "confirm") {
    return t("advancedCalibration.confirmSubtitle");
  }
  return t("advancedCalibration.panelSubtitle", { panel: t(`panels.${phase}`) });
}
