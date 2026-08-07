import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { PanelAlignmentHelpSheet } from "@/features/quick-panel/shared/PanelAlignmentHelpSheet";
import { PanelReviewHelpSheet } from "@/features/quick-panel/shared/PanelReviewHelpSheet";
import { QuickPanelScreenShell } from "@/features/quick-panel/shared/QuickPanelScreenShell";
import { SubPageHeader } from "@/features/quick-panel/shared/SubPageHeader";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import type { PanelId } from "../../../model/types";
import { OuterCalibrationStep } from "../../shared/OuterCalibrationStep";
import { AdvancedCalibrationControls } from "../AdvancedCalibrationControls";
import { AdvancedGridSheet } from "../AdvancedGridSheet";
import { AdvancedCalibrationLeaveDialog } from "../components/AdvancedCalibrationLeaveDialog";
import { AdvancedPanelCanvas } from "../components/AdvancedPanelCanvas";
import { CombinedSelectionStep } from "./CombinedSelectionStep";
import { useCombinedCalibrationScreen } from "./hooks/useCombinedCalibrationScreen";

export function CombinedCalibrationScreen() {
  const { t } = useTranslation();
  const [isGridHelpOpen, setIsGridHelpOpen] = useState(false);
  const [isAlignmentHelpOpen, setIsAlignmentHelpOpen] = useState(false);
  const [isReviewHelpOpen, setIsReviewHelpOpen] = useState(false);
  const {
    advancedDraft, activePanelFamily, activePanelId, beginPanelGesture, canGoBack, closeLeaveDialog,
    commitPanelGesture,
    error, errorKey, grid, goBack, goForward, importScreenshot,
    isButtonSelectionPhase, isConfirmPhase, isControlSelectionPhase, isGridPhase,
    isLeaveDialogOpen, isOuterPhase, leaveCalibration, panelItems, panels, phase,
    requestLeaveCalibration, saveCalibration, setColumns, setRows,
    setCombinedButtons, setCombinedEnabledControls, setCombinedOuterRect,
    isPanelGesturePending,
    setSnapSensitivity, snapSensitivity,
  } = useCombinedCalibrationScreen();
  const screenshot = advancedDraft?.screenshot ?? null;
  const outerRect = advancedDraft?.outerRect ?? null;
  const isEditing = Boolean(screenshot && outerRect);
  const isNextDisabled = (isControlSelectionPhase && !advancedDraft?.enabledControls.length)
    || (isButtonSelectionPhase && !advancedDraft?.buttons.length)
    || (activePanelId !== null && isPanelGesturePending);

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
          subtitle={t("advancedCalibration.combinedOuterSubtitle")}
          title={t("advancedCalibration.title")}
          onImport={importScreenshot}
          onPrimaryPress={goForward}
          onRectChange={setCombinedOuterRect}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <QuickPanelScreenShell
        footer={isEditing ? (
          <AdvancedCalibrationControls
            canGoBack={canGoBack}
            columns={grid.columns}
            isConfirmPhase={isConfirmPhase}
            isGridPhase={isGridPhase}
            isNextDisabled={isNextDisabled}
            isOuterPhase={false}
            isPanelPhase={activePanelId !== null}
            onBack={goBack}
            onColumnsChange={setColumns}
            onGridHelpPress={() => setIsGridHelpOpen(true)}
            onImport={importScreenshot}
            onNext={goForward}
            onRowsChange={setRows}
            onSave={saveCalibration}
            onSnapSensitivityChange={setSnapSensitivity}
            rows={grid.rows}
            snapSensitivity={snapSensitivity}
          />
        ) : <Button className="my-4 w-full bg-white" onPress={importScreenshot}>{t("calibration.chooseFromAlbum")}</Button>}
        footerTestID="advanced-calibration-footer"
        header={<SubPageHeader
          actionAccessibilityLabel={t("calibration.helpButton")}
          actionHelpId={activePanelFamily ? "advanced-calibration-panel-alignment" : isConfirmPhase ? "advanced-calibration-panel-review" : undefined}
          actionVariant={activePanelFamily || isConfirmPhase ? "helper-balanced" : undefined}
          onActionPress={activePanelFamily ? () => setIsAlignmentHelpOpen(true) : isConfirmPhase ? () => setIsReviewHelpOpen(true) : undefined}
          onBackPress={requestLeaveCalibration}
          title={t("advancedCalibration.title")}
          subtitle={getSubtitle(
            phase,
            activePanelFamily,
            panelItems.find((item) => item.id === activePanelId)?.label,
            t,
          )}
        />}
      >
        {advancedDraft && (isControlSelectionPhase || isButtonSelectionPhase) ? (
          <CombinedSelectionStep
            draft={advancedDraft}
            isButtonSelectionPhase={isButtonSelectionPhase}
            isControlSelectionPhase={isControlSelectionPhase}
            onButtonsChange={setCombinedButtons}
            onControlsChange={setCombinedEnabledControls}
          />
        ) : screenshot && outerRect && panels ? (
          <AdvancedPanelCanvas
            activePanelId={activePanelId}
            grid={grid}
            isReview={isConfirmPhase}
            panelItems={panelItems}
            panels={panels}
            screenshot={screenshot}
            snapSensitivity={snapSensitivity}
            visiblePanelIds={getVisiblePanelIds(panelItems, phase, activePanelId)}
            outerRect={outerRect}
            onGestureBegin={beginPanelGesture}
            onGestureCommit={commitPanelGesture}
          />
        ) : null}
        {error ? <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">{error}</Text> : null}
        {errorKey ? <Text className="mt-4 rounded-md bg-red-500/15 p-3 text-sm text-red-100">{t(errorKey)}</Text> : null}
      </QuickPanelScreenShell>
      {isAlignmentHelpOpen && activePanelFamily ? <PanelAlignmentHelpSheet family={activePanelFamily} onClose={() => setIsAlignmentHelpOpen(false)} /> : null}
      {isReviewHelpOpen && isConfirmPhase ? <PanelReviewHelpSheet onClose={() => setIsReviewHelpOpen(false)} /> : null}
      {isGridHelpOpen && isGridPhase ? <AdvancedGridSheet target="combined" onClose={() => setIsGridHelpOpen(false)} /> : null}
      <AdvancedCalibrationLeaveDialog onClose={closeLeaveDialog} onLeave={leaveCalibration} open={isLeaveDialogOpen} />
    </SafeAreaView>
  );
}

function getSubtitle(
  phase: string,
  family: "control" | "button" | null,
  panelLabel: string | undefined,
  t: (key: string) => string,
) {
  if (phase === "controlSelection") return t("advancedCalibration.combinedControlSelectionSubtitle");
  if (phase === "buttonSelection") return t("advancedCalibration.combinedButtonSelectionSubtitle");
  if (phase === "grid") return t("advancedCalibration.combinedGridSubtitle");
  if (phase === "confirm") return t("advancedCalibration.combinedConfirmSubtitle");
  return family && panelLabel
    ? t("advancedCalibration.panelSubtitle").replace("{{panel}}", panelLabel)
    : t("advancedCalibration.combinedOuterSubtitle");
}

function getVisiblePanelIds(
  items: { id: PanelId }[],
  phase: string,
  activeId: PanelId | null,
): PanelId[] {
  if (phase === "confirm") return items.map((item) => item.id);
  const activeIndex = activeId ? items.findIndex((item) => item.id === activeId) : -1;
  return activeIndex < 0 ? [] : items.slice(0, activeIndex + 1).map((item) => item.id);
}
