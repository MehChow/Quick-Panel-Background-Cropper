import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { PanelAlignmentHelpSheet } from "@/features/quick-panel/shared/PanelAlignmentHelpSheet";
import { PanelReviewHelpSheet } from "@/features/quick-panel/shared/PanelReviewHelpSheet";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import {
  markHelpSeen,
  type HelpEntryId,
} from "@/features/quick-panel/store/storage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OuterCalibrationStep } from "../shared/OuterCalibrationStep";
import { isPanelPhase, type AdvancedCalibrationPhase } from "./advanced-steps";
import { AdvancedCalibrationControls } from "./AdvancedCalibrationControls";
import { AdvancedGridSheet } from "./AdvancedGridSheet";
import { AdvancedCalibrationLeaveDialog } from "./components/AdvancedCalibrationLeaveDialog";
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
    closeLeaveDialog,
    enabledPanels,
    errorKey,
    error,
    goBack,
    goForward,
    grid,
    isConfirmPhase,
    isGridPhase,
    isLeaveDialogOpen,
    isOuterPhase,
    isPanelSelectionPhase,
    leaveCalibration,
    phase,
    importScreenshot,
    requestLeaveCalibration,
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
  const showHelpButton = isEditing && (isPanelStep || isConfirmPhase);
  const activeHelpId = getActiveHelpId(phase);
  const actionAccessibilityLabel = showHelpButton
    ? t("calibration.helpButton")
    : undefined;
  const openActiveHelp = () => {
    if (activeHelpId) {
      markHelpSeen(activeHelpId);
    }
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

  if (isOuterPhase) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <OuterCalibrationStep
          error={error}
          errorKey={errorKey}
          footerTestID="advanced-calibration-footer"
          helpId="calibration-outer"
          primaryLabel={t("advancedCalibration.next")}
          rect={outerRect}
          screenshot={screenshot}
          subtitle={t("advancedCalibration.outerSubtitle")}
          title={t("advancedCalibration.title")}
          onImport={importScreenshot}
          onPrimaryPress={handleNext}
          onRectChange={setAdvancedOuterRect}
        />
      </SafeAreaView>
    );
  }

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
            actionHelpId={activeHelpId ?? undefined}
            actionVariant={showHelpButton ? "helper-balanced" : undefined}
            onActionPress={showHelpButton ? openActiveHelp : undefined}
            onBackPress={requestLeaveCalibration}
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
        ) : screenshot && outerRect && panels ? (
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
          <View />
        )}
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
      </QuickPanelScreenShell>
      {isHelpOpen && isPanelStep ? (
        <PanelAlignmentHelpSheet onClose={() => setIsHelpOpen(false)} />
      ) : null}
      {isHelpOpen && isConfirmPhase ? (
        <PanelReviewHelpSheet onClose={() => setIsHelpOpen(false)} />
      ) : null}
      {isGridHelpOpen && isGridPhase ? (
        <AdvancedGridSheet onClose={() => setIsGridHelpOpen(false)} />
      ) : null}
      <AdvancedCalibrationLeaveDialog
        onClose={closeLeaveDialog}
        onLeave={leaveCalibration}
        open={isLeaveDialogOpen}
      />
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

function getActiveHelpId(
  phase: AdvancedCalibrationPhase,
): HelpEntryId | null {
  if (isPanelPhase(phase)) {
    return "advanced-calibration-panel-alignment";
  }
  if (phase === "confirm") {
    return "advanced-calibration-panel-review";
  }
  return null;
}
