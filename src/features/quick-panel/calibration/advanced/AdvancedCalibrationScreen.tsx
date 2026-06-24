import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { CalibrationHelpSheet } from "@/features/quick-panel/shared/CalibrationHelpSheet";
import { PanelAlignmentHelpSheet } from "@/features/quick-panel/shared/PanelAlignmentHelpSheet";
import { PanelReviewHelpSheet } from "@/features/quick-panel/shared/PanelReviewHelpSheet";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalibrationCanvas } from "../shared/CalibrationCanvas";
import { isPanelPhase, type AdvancedCalibrationPhase } from "./advanced-steps";
import { AdvancedCalibrationControls } from "./AdvancedCalibrationControls";
import { AdvancedGridSheet } from "./AdvancedGridSheet";
import { AdvancedOuterOverlay } from "./components/AdvancedOuterOverlay";
import { AdvancedPanelCanvas } from "./components/AdvancedPanelCanvas";
import { AdvancedPanelSelection } from "./components/AdvancedPanelSelection";
import { useAdvancedCalibrationScreen } from "./hooks/useAdvancedCalibrationScreen";

export function AdvancedCalibrationScreen() {
  const { t } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGridHelpOpen, setIsGridHelpOpen] = useState(false);
  const {
    advancedDraft,
    canGoBack,
    enabledPanels,
    error,
    goBack,
    goForward,
    grid,
    isConfirmPhase,
    isGridPhase,
    isOuterPhase,
    isPanelSelectionPhase,
    phase,
    importScreenshot,
    saveCalibration,
    setColumns,
    setRows,
    setAdvancedEnabledPanels,
    setAdvancedOuterRect,
    setAdvancedPanels,
  } = useAdvancedCalibrationScreen();
  const screenshot = advancedDraft?.screenshot ?? null;
  const outerRect = advancedDraft?.outerRect ?? null;
  const panels = advancedDraft?.panels ?? null;
  const isEditing = Boolean(screenshot && outerRect);
  const isPanelStep = isPanelPhase(phase);
  const isNextDisabled = isPanelSelectionPhase && enabledPanels.length === 0;
  const showHelpButton =
    isEditing && (isOuterPhase || isPanelStep || isConfirmPhase);
  const actionAccessibilityLabel = showHelpButton
    ? t("calibration.helpButton")
    : undefined;
  const openActiveHelp = () => {
    if (isGridPhase) {
      setIsGridHelpOpen(true);
      return;
    }
    setIsHelpOpen(true);
  };

  const handleBack = () => {
    goBack();
  };
  const handleNext = () => {
    goForward();
  };
  const handleSave = () => {
    saveCalibration();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuickPanelScreenShell
        footer={
          isEditing ? (
            <AdvancedCalibrationControls
              canGoBack={canGoBack}
              columns={grid.columns}
              isConfirmPhase={isConfirmPhase}
              isGridPhase={isGridPhase}
              isNextDisabled={isNextDisabled}
              isOuterPhase={isOuterPhase}
              onBack={handleBack}
              onColumnsChange={setColumns}
              onGridHelpPress={() => setIsGridHelpOpen(true)}
              onImport={importScreenshot}
              onNext={handleNext}
              onRowsChange={setRows}
              onSave={handleSave}
              rows={grid.rows}
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
        footerTestID="advanced-calibration-footer"
        header={
          <SubPageHeader
            actionAccessibilityLabel={actionAccessibilityLabel}
            actionVariant={showHelpButton ? "helper-balanced" : undefined}
            onActionPress={showHelpButton ? openActiveHelp : undefined}
            title={t("advancedCalibration.title")}
            subtitle={getSubtitle(phase, t)}
          />
        }
      >
        {isPanelSelectionPhase && screenshot && outerRect ? (
          <View className="flex-1 justify-center">
            <AdvancedPanelSelection
              enabledPanels={enabledPanels}
              onEnabledPanelsChange={setAdvancedEnabledPanels}
            />
          </View>
        ) : !isOuterPhase && screenshot && outerRect && panels ? (
          <AdvancedPanelCanvas
            grid={grid}
            enabledPanels={enabledPanels}
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
            renderOverlay={(scale) =>
              outerRect && screenshot ? (
                <AdvancedOuterOverlay
                  rect={outerRect}
                  scale={scale}
                  screenshot={screenshot}
                  onRectChange={setAdvancedOuterRect}
                />
              ) : null
            }
            showControls={false}
            showImportButton={false}
          />
        )}
        {error ? (
          <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">
            {error}
          </Text>
        ) : null}
      </QuickPanelScreenShell>
      {isHelpOpen && isOuterPhase ? (
        <CalibrationHelpSheet onClose={() => setIsHelpOpen(false)} />
      ) : null}
      {isHelpOpen && isPanelStep ? (
        <PanelAlignmentHelpSheet onClose={() => setIsHelpOpen(false)} />
      ) : null}
      {isHelpOpen && isConfirmPhase ? (
        <PanelReviewHelpSheet onClose={() => setIsHelpOpen(false)} />
      ) : null}
      {isGridHelpOpen && isGridPhase ? (
        <AdvancedGridSheet onClose={() => setIsGridHelpOpen(false)} />
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
  if (phase === "panelSelection") {
    return t("advancedCalibration.panelSelectionSubtitle");
  }
  if (phase === "grid") {
    return t("advancedCalibration.gridSubtitle");
  }
  if (phase === "confirm") {
    return t("advancedCalibration.confirmSubtitle");
  }
  return t("advancedCalibration.panelSubtitle", {
    panel: t(`panels.${phase}`),
  });
}
