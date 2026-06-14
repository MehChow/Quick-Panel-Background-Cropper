import { useState } from "react";
import { Text } from "@/components/ani-ui/text";
import { CalibrationHelpSheet } from "@/features/quick-panel/shared/CalibrationHelpSheet";
import { PanelAlignmentHelpSheet } from "@/features/quick-panel/shared/PanelAlignmentHelpSheet";
import { PanelReviewHelpSheet } from "@/features/quick-panel/shared/PanelReviewHelpSheet";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalibrationCanvas } from "../shared/CalibrationCanvas";
import { isPanelPhase, type AdvancedCalibrationPhase } from "./advanced-steps";
import { AdvancedCalibrationControls } from "./AdvancedCalibrationControls";
import { AdvancedOuterOverlay } from "./components/AdvancedOuterOverlay";
import { AdvancedPanelCanvas } from "./components/AdvancedPanelCanvas";
import { useAdvancedCalibrationScreen } from "./hooks/useAdvancedCalibrationScreen";

export function AdvancedCalibrationScreen() {
  const { t } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const {
    advancedDraft,
    canGoBack,
    error,
    goBack,
    goForward,
    grid,
    isConfirmPhase,
    isOuterPhase,
    phase,
    importScreenshot,
    saveCalibration,
    setColumns,
    setRows,
    setAdvancedOuterRect,
    setAdvancedPanels,
  } = useAdvancedCalibrationScreen();
  const screenshot = advancedDraft?.screenshot ?? null;
  const outerRect = advancedDraft?.outerRect ?? null;
  const panels = advancedDraft?.panels ?? null;
  const isEditing = Boolean(screenshot && outerRect);
  const isPanelStep = isPanelPhase(phase);
  const showHelpButton = isEditing && (isOuterPhase || isPanelStep || isConfirmPhase);

  const handleBack = () => { goBack(); };
  const handleNext = () => { goForward(); };
  const handleSave = () => { saveCalibration(); };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="px-5 pt-8">
        <SubPageHeader
          actionAccessibilityLabel={showHelpButton ? t("calibration.helpButton") : undefined}
          actionIcon={showHelpButton ? "circle-help" : undefined}
          onActionPress={showHelpButton ? () => setIsHelpOpen(true) : undefined}
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
            renderOverlay={(scale) => (
              outerRect && screenshot
                ? (
                  <AdvancedOuterOverlay
                    rect={outerRect}
                    scale={scale}
                    screenshot={screenshot}
                    onRectChange={setAdvancedOuterRect}
                  />
                )
                : null
            )}
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
            columns={grid.columns}
            isGridVisible={isPanelStep}
            isConfirmPhase={isConfirmPhase}
            isOuterPhase={isOuterPhase}
            onBack={handleBack}
            onColumnsChange={setColumns}
            onImport={importScreenshot}
            onNext={handleNext}
            onRowsChange={setRows}
            onSave={handleSave}
            rows={grid.rows}
          />
        </View>
      ) : null}
      {isHelpOpen && isOuterPhase ? <CalibrationHelpSheet onClose={() => setIsHelpOpen(false)} /> : null}
      {isHelpOpen && isPanelStep ? <PanelAlignmentHelpSheet onClose={() => setIsHelpOpen(false)} /> : null}
      {isHelpOpen && isConfirmPhase ? <PanelReviewHelpSheet onClose={() => setIsHelpOpen(false)} /> : null}
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
