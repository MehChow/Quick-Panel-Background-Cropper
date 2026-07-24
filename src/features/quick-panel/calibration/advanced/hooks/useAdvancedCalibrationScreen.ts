import { useRouter } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";
import { BackHandler } from "react-native";
import { useShallow } from "zustand/react/shallow";
import {
  getDefaultAdvancedSnapGrid,
} from "../advanced-grid";
import { getButtonPanelItems, getButtonPanelRects } from "../buttons-geometry";
import {
  getNextPhase,
  getPreviousPhase,
  isPanelPhase,
  type AdvancedCalibrationPhase,
} from "../advanced-steps";
import type {
  AdvancedCalibrationDraft,
  AdvancedSnapGrid,
  ButtonCalibrationItem,
  ControlPanelId,
  ControlPanelRects,
  EditablePanelItem,
  PanelRects,
} from "../../../model/types";
import { pickImageFromLibrary } from "../../../shared/pick-image-from-library";
import { getPanelLabel } from "../../../model/i18n";
import { useQuickPanelStore } from "../../../store/quick-panel-store";
import { quickPanelSelectors } from "../../../store/selectors";
import { getSuggestedCalibrationRect } from "../../shared/calibration-preset";

export function useAdvancedCalibrationScreen() {
  const router = useRouter();
  const {
    advancedCalibration,
    advancedButtonsCalibration,
    advancedDraft,
    advancedButtonsDraft,
    selectedAdvancedTarget,
    errorKey,
    error,
    setError,
    setAdvancedScreenshot,
    setAdvancedOuterRect,
    confirmAdvancedOuterRect,
    setAdvancedEnabledPanels,
    setAdvancedPanels,
    setAdvancedButtons,
    setAdvancedButtonPanels,
    acceptAdvancedCalibration,
    failImageProcessing,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.advancedCalibrationScreen));
  const savedCalibration = selectedAdvancedTarget === "buttons"
    ? advancedButtonsCalibration
    : advancedCalibration;
  const [phase, setPhase] = useState<AdvancedCalibrationPhase>("outer");
  const [grid, setGrid] = useState<AdvancedSnapGrid>(() =>
    savedCalibration?.grid ?? { columns: 4, rows: 5 }
  );
  const [isGridEnabled, setIsGridEnabled] = useState(
    () => savedCalibration?.isGridEnabled ?? true,
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
      setGrid(savedCalibration?.grid ?? getDefaultAdvancedSnapGrid(suggestedRect));
      setIsGridEnabled(savedCalibration?.isGridEnabled ?? true);
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
    const draftForSave = selectedAdvancedTarget === "buttons" ? advancedButtonsDraft : advancedDraft;
    if (selectedAdvancedTarget !== "buttons" && advancedDraft?.screenshot && advancedDraft.outerRect) {
      setLeavingDraft(advancedDraft);
      setLeavingPhase(phase);
    }
    if (
      draftForSave?.screenshot &&
      draftForSave.outerRect &&
      acceptAdvancedCalibration(grid, isGridEnabled)
    ) {
      router.dismissTo("/customize");
    }
  };

  const displayedDraft = selectedAdvancedTarget === "buttons" ? advancedButtonsDraft : advancedDraft ?? leavingDraft;
  const displayedPhase = selectedAdvancedTarget === "buttons" || advancedDraft ? phase : leavingPhase ?? phase;
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const shouldConfirmLeave = displayedPhase !== "outer";
  const enabledPanels = selectedAdvancedTarget === "buttons"
    ? advancedButtonsDraft?.buttons.map((button) => button.id) ?? []
    : advancedDraft?.enabledPanels ?? [];
  const panelItems: EditablePanelItem[] = selectedAdvancedTarget === "buttons"
    ? getButtonPanelItems(advancedButtonsDraft?.buttons ?? [])
    : (advancedDraft?.enabledPanels ?? []).map((id) => ({
        id,
        label: getPanelLabel(id),
        family: "control",
      }));
  const panels: PanelRects | null = selectedAdvancedTarget === "buttons"
    ? getButtonPanelRects(advancedButtonsDraft?.buttons ?? [])
    : advancedDraft?.panels ?? null;
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

  const handleHardwareBack = useEffectEvent(requestLeaveCalibration);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => handleHardwareBack(),
    );

    return () => subscription.remove();
  }, []);

  const goBack = () => {
    if (!previousPhase) {
      return;
    }
    setError(null);
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

  const updateEnabledPanels = (nextPanels: ControlPanelId[]) => {
    setAdvancedEnabledPanels(nextPanels);
    if (isPanelPhase(displayedPhase) && !nextPanels.some((id) => id === displayedPhase)) {
      setPhase("panelSelection");
    }
  };

  const updateButtons = (buttons: ButtonCalibrationItem[]) => {
    setAdvancedButtons(buttons);
    if (isPanelPhase(displayedPhase) && !buttons.some((button) => button.id === displayedPhase)) {
      setPhase("panelSelection");
    }
  };

  const updatePanels = (nextPanels: PanelRects) => {
    if (selectedAdvancedTarget === "buttons") {
      setAdvancedButtonPanels(nextPanels);
      return;
    }
    setAdvancedPanels(nextPanels as ControlPanelRects);
  };

  return {
    advancedDraft: displayedDraft,
    buttons: advancedButtonsDraft?.buttons ?? [],
    controlEnabledPanels: advancedDraft?.enabledPanels ?? [],
    panelItems,
    panels,
    selectedAdvancedTarget,
    enabledPanels,
    errorKey,
    error,
    grid,
    isGridEnabled,
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
    setIsGridEnabled,
    setAdvancedEnabledPanels: updateEnabledPanels,
    setAdvancedButtons: updateButtons,
    setAdvancedOuterRect,
    setAdvancedPanels: updatePanels,
  };
}
