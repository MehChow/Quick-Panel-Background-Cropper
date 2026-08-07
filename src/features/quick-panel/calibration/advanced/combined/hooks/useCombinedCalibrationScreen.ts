import { useRouter } from "expo-router";
import { useEffect, useEffectEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackHandler } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { getDefaultAdvancedSnapGrid, clampGridValue } from "../../advanced-grid";
import {
  getCombinedActivePanelError,
  getCombinedPanelOrder,
  getPreviousCombinedPhase,
  getCombinedPhaseOrder,
  getVisibleCombinedPanelIds,
  type CombinedCalibrationPhase,
} from "../combined-steps";
import {
  getCombinedPanelItems,
  getCombinedPanelRects,
} from "../combined-calibration-state";
import type {
  AdvancedCombinedDraft,
  AdvancedSnapGrid,
  ButtonCalibrationItem,
  ControlPanelId,
  PanelFamily,
  PanelId,
  PanelRect,
} from "../../../../model/types";
import { pickImageFromLibrary } from "../../../../shared/pick-image-from-library";
import { getSuggestedCalibrationRect } from "../../../shared/calibration-preset";
import { useQuickPanelStore } from "../../../../store/quick-panel-store";
import { quickPanelSelectors } from "../../../../store/selectors";
import { useSnapSensitivityPreference } from "../../../../store/storage";
import { useOwnedImageCache } from "../../../../cache/useOwnedImageCache";
import { useAdvancedPanelCommitGate } from "../../hooks/useAdvancedPanelCommitGate";

export function useCombinedCalibrationScreen() {
  const router = useRouter();
  const ownedImageCache = useOwnedImageCache();
  const { t } = useTranslation();
  const { snapSensitivity, setSnapSensitivity } = useSnapSensitivityPreference();
  const {
    advancedCombinedCalibration,
    advancedCombinedDraft,
    errorKey,
    error,
    setError,
    setCombinedScreenshot,
    setCombinedOuterRect,
    confirmCombinedOuterRect,
    setCombinedEnabledControls,
    setCombinedButtons,
    setCombinedPanel,
    acceptCombinedCalibration,
    failImageProcessing,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.combinedCalibrationScreen));
  const [phase, setPhase] = useState<CombinedCalibrationPhase>("outer");
  const [grid, setGrid] = useState<AdvancedSnapGrid>(() =>
    advancedCombinedCalibration?.grid ?? { columns: 4, rows: 5 },
  );
  const [resumePhase, setResumePhase] = useState<CombinedCalibrationPhase | null>(null);
  const [leavingDraft, setLeavingDraft] = useState<AdvancedCombinedDraft | null>(null);
  const [leavingPhase, setLeavingPhase] = useState<CombinedCalibrationPhase | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const importScreenshot = async () => {
    try {
      const screenshot = await pickImageFromLibrary();
      if (!screenshot) return;
      const previousScreenshot = advancedCombinedDraft?.screenshot ?? null;
      const suggestedOuter = getSuggestedCalibrationRect(screenshot);
      ownedImageCache.track(screenshot);
      setCombinedScreenshot(screenshot, suggestedOuter);
      ownedImageCache.release(previousScreenshot);
      setGrid(advancedCombinedCalibration?.grid ?? getDefaultAdvancedSnapGrid(suggestedOuter));
      setPhase("outer");
      setResumePhase(null);
      setLeavingDraft(null);
      setLeavingPhase(null);
    } catch (caught) {
      failImageProcessing(
        null,
        caught instanceof Error ? caught.message : "errors.unableToOpenImagePicker",
      );
    }
  };

  const draft = advancedCombinedDraft ?? leavingDraft;
  const displayedPhase = advancedCombinedDraft ? phase : leavingPhase ?? phase;
  const panelOrder = getCombinedPanelOrder(
    draft?.enabledControls ?? [],
    draft?.buttons ?? [],
  );
  const panelItems = draft ? getCombinedPanelItems(draft) : [];
  const panels = draft ? getCombinedPanelRects(draft) : null;
  const visiblePanelIds = getVisibleCombinedPanelIds(displayedPhase, panelOrder);
  const activePanelId = panelOrder.includes(displayedPhase as PanelId)
    ? displayedPhase as PanelId
    : null;
  const activePanelFamily: PanelFamily | null = activePanelId
    ? activePanelId.startsWith("button-") ? "button" : "control"
    : null;
  const previousPhase = getPreviousCombinedPhase(displayedPhase, panelOrder);
  const isOuterPhase = displayedPhase === "outer";
  const isControlSelectionPhase = displayedPhase === "controlSelection";
  const isButtonSelectionPhase = displayedPhase === "buttonSelection";
  const isGridPhase = displayedPhase === "grid";
  const isConfirmPhase = displayedPhase === "confirm";
  const commitPanel = (id: PanelId, rect: PanelRect) => {
    if (
      draft?.enabledControls.includes(id as ControlPanelId) ||
      draft?.buttons.some((button) => button.id === id)
    ) {
      setCombinedPanel(id, rect);
    }
  };
  const {
    beginPanelGesture,
    commitPanelGesture,
    isPanelGesturePending,
  } = useAdvancedPanelCommitGate(activePanelId, commitPanel);

  const goForward = () => {
    if (activePanelId && isPanelGesturePending) {
      return;
    }
    if (isOuterPhase) {
      confirmCombinedOuterRect();
      setPhase(resumePhase ?? "controlSelection");
      setResumePhase(null);
      return;
    }
    if (isControlSelectionPhase && !draft?.enabledControls.length) {
      setCombinedEnabledControls([]);
      return;
    }
    if (isButtonSelectionPhase && !draft?.buttons.length) {
      setCombinedButtons([]);
      return;
    }
    if (activePanelId && panels && draft?.outerRect) {
      const panelError = getCombinedActivePanelError(
        activePanelId,
        visiblePanelIds,
        panels,
        draft.outerRect,
      );
      if (panelError === "overlap") {
        setError(t("errors.combinedPanelOverlap"));
        return;
      }
      if (panelError === "invalid") {
        setError(t("errors.invalidCombinedPanels"));
        return;
      }
    }
    const phaseOrder = getCombinedPhaseOrder(draft?.enabledControls ?? [], draft?.buttons ?? []);
    const next = phaseOrder[phaseOrder.indexOf(displayedPhase) + 1];
    if (next) setPhase(next);
  };

  const goBack = () => {
    if (!previousPhase) return;
    setError(null);
    if (previousPhase === "outer") {
      setResumePhase(displayedPhase);
    }
    setPhase(previousPhase);
  };

  const requestLeaveCalibration = () => {
    if (isOuterPhase) {
      router.back();
      return true;
    }
    setIsLeaveDialogOpen(true);
    return true;
  };

  const handleHardwareBack = useEffectEvent(requestLeaveCalibration);
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => handleHardwareBack());
    return () => subscription.remove();
  }, []);

  const saveCalibration = () => {
    if (advancedCombinedDraft && acceptCombinedCalibration(grid)) {
      router.dismissTo("/customize");
      return;
    }
    if (advancedCombinedDraft) {
      setLeavingDraft(advancedCombinedDraft);
      setLeavingPhase(phase);
    }
  };

  const updateControls = (ids: ControlPanelId[]) => {
    setCombinedEnabledControls(ids);
  };

  const updateButtons = (buttons: ButtonCalibrationItem[]) => {
    setCombinedButtons(buttons);
  };

  return {
    advancedDraft: draft,
    activePanelFamily,
    activePanelId,
    canGoBack: previousPhase !== null,
    closeLeaveDialog: () => setIsLeaveDialogOpen(false),
    error,
    errorKey,
    grid,
    goBack,
    goForward,
    importScreenshot,
    isButtonSelectionPhase,
    isConfirmPhase,
    isControlSelectionPhase,
    isGridPhase,
    isLeaveDialogOpen,
    isOuterPhase,
    leaveCalibration: () => router.back(),
    panelItems,
    panels,
    phase: displayedPhase,
    requestLeaveCalibration,
    saveCalibration,
    setColumns: (columns: number) => setGrid((current) => ({ ...current, columns: clampGridValue(columns) })),
    setRows: (rows: number) => setGrid((current) => ({ ...current, rows: clampGridValue(rows) })),
    setCombinedEnabledControls: updateControls,
    setCombinedButtons: updateButtons,
    setCombinedOuterRect,
    beginPanelGesture,
    commitPanelGesture,
    isPanelGesturePending,
    setSnapSensitivity,
    snapSensitivity,
  };
}
