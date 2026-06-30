import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { useShallow } from "zustand/react/shallow";
import {
  getDefaultAdvancedSnapGrid,
} from "../advanced-grid";
import {
  getNextPhase,
  getPreviousPhase,
  isPanelPhase,
  type AdvancedCalibrationPhase,
} from "../advanced-steps";
import type {
  AdvancedCalibrationDraft,
  AdvancedSnapGrid,
  PanelId,
} from "../../../model/types";
import { pickImageFromLibrary } from "../../../shared/pick-image-from-library";
import { useQuickPanelStore } from "../../../store/quick-panel-store";
import { quickPanelSelectors } from "../../../store/selectors";
import { getSuggestedCalibrationRect } from "../../shared/calibration-preset";

export function useAdvancedCalibrationScreen() {
  const router = useRouter();
  const {
    advancedCalibration,
    advancedDraft,
    errorKey,
    error,
    setAdvancedScreenshot,
    setAdvancedOuterRect,
    confirmAdvancedOuterRect,
    setAdvancedEnabledPanels,
    setAdvancedPanels,
    acceptAdvancedCalibration,
    failImageProcessing,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.advancedCalibrationScreen));
  const [phase, setPhase] = useState<AdvancedCalibrationPhase>("outer");
  const [grid, setGrid] = useState<AdvancedSnapGrid>(() =>
    advancedCalibration?.grid ?? { columns: 4, rows: 5 }
  );
  const [leavingDraft, setLeavingDraft] = useState<AdvancedCalibrationDraft | null>(null);
  const [leavingPhase, setLeavingPhase] = useState<AdvancedCalibrationPhase | null>(null);
  const [resumePhase, setResumePhase] = useState<AdvancedCalibrationPhase | null>(null);

  const importScreenshot = async () => {
    try {
      const screenshot = await pickImageFromLibrary();
      if (!screenshot) {
        return;
      }

      const suggestedRect = getSuggestedCalibrationRect(screenshot);
      setAdvancedScreenshot(screenshot, suggestedRect);
      setGrid(advancedCalibration?.grid ?? getDefaultAdvancedSnapGrid(suggestedRect));
      setLeavingDraft(null);
      setLeavingPhase(null);
      setPhase("outer");
      setResumePhase(null);
    } catch (error) {
      failImageProcessing(
        null,
        error instanceof Error
          ? error.message
          : "errors.unableToOpenImagePicker",
      );
    }
  };

  const continueToNextPhase = () => {
    confirmAdvancedOuterRect();
    setPhase(resumePhase ?? "panelSelection");
    setResumePhase(null);
  };

  const saveCalibration = () => {
    if (advancedDraft?.screenshot && advancedDraft.outerRect) {
      setLeavingDraft(advancedDraft);
      setLeavingPhase(phase);
    }
    if (acceptAdvancedCalibration(grid)) {
      router.dismissTo("/customize");
    }
  };

  const displayedDraft = advancedDraft ?? leavingDraft;
  const displayedPhase = advancedDraft ? phase : leavingPhase ?? phase;
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const shouldConfirmLeave = displayedPhase !== "outer";
  const enabledPanels = displayedDraft?.enabledPanels ?? [];
  const previousPhase = getPreviousPhase(displayedPhase, enabledPanels);
  const nextPhase = getNextPhase(displayedPhase, enabledPanels);

  const leaveCalibration = () => {
    router.back();
  };

  const closeLeaveDialog = () => {
    setIsLeaveDialogOpen(false);
  };

  const requestLeaveCalibration = () => {
    if (!shouldConfirmLeave) {
      leaveCalibration();
      return true;
    }

    setIsLeaveDialogOpen(true);
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      requestLeaveCalibration,
    );

    return () => subscription.remove();
  });

  const goBack = () => {
    if (!previousPhase) {
      return;
    }
    if (previousPhase === "outer") {
      setResumePhase(displayedPhase === "outer" ? null : displayedPhase);
    }
    setPhase(previousPhase);
  };

  const goForward = () => {
    if (displayedPhase === "outer") {
      continueToNextPhase();
      return;
    }
    if (displayedPhase === "panelSelection" && enabledPanels.length === 0) {
      setAdvancedEnabledPanels([]);
      return;
    }
    if (!nextPhase) {
      return;
    }
    setPhase(nextPhase);
  };

  const returnToOuter = () => {
    if (displayedPhase !== "outer") {
      setResumePhase(displayedPhase);
    }
    setPhase("outer");
  };

  const updateEnabledPanels = (nextPanels: PanelId[]) => {
    setAdvancedEnabledPanels(nextPanels);
    if (isPanelPhase(displayedPhase) && !nextPanels.includes(displayedPhase)) {
      setPhase("panelSelection");
    }
  };

  return {
    advancedDraft: displayedDraft,
    enabledPanels,
    errorKey,
    error,
    grid,
    phase: displayedPhase,
    canGoBack: previousPhase !== null,
    closeLeaveDialog,
    importScreenshot,
    decrementColumns: () => setGrid((current) => ({ ...current, columns: Math.max(1, current.columns - 1) })),
    decrementRows: () => setGrid((current) => ({ ...current, rows: Math.max(1, current.rows - 1) })),
    goBack,
    goForward,
    incrementColumns: () => setGrid((current) => ({ ...current, columns: Math.min(8, current.columns + 1) })),
    incrementRows: () => setGrid((current) => ({ ...current, rows: Math.min(8, current.rows + 1) })),
    isConfirmPhase: displayedPhase === "confirm",
    isGridPhase: displayedPhase === "grid",
    isLeaveDialogOpen,
    isOuterPhase: displayedPhase === "outer",
    isPanelSelectionPhase: displayedPhase === "panelSelection",
    leaveCalibration,
    requestLeaveCalibration,
    returnToOuter,
    saveCalibration,
    setColumns: (columns: number) => setGrid((current) => ({ ...current, columns })),
    setRows: (rows: number) => setGrid((current) => ({ ...current, rows })),
    setAdvancedEnabledPanels: updateEnabledPanels,
    setAdvancedOuterRect,
    setAdvancedPanels,
  };
}
