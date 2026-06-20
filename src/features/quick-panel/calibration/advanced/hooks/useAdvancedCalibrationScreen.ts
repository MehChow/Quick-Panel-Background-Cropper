import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  getDefaultAdvancedSnapGrid,
} from "../advanced-grid";
import {
  getNextPhase,
  getPreviousPhase,
  type AdvancedCalibrationPhase,
} from "../advanced-steps";
import type {
  AdvancedCalibrationDraft,
  AdvancedSnapGrid,
} from "../../../model/types";
import { useQuickPanelStore } from "../../../store/quick-panel-store";
import { quickPanelSelectors } from "../../../store/selectors";
import { getSuggestedCalibrationRect } from "../../shared/calibration-preset";

export function useAdvancedCalibrationScreen() {
  const router = useRouter();
  const {
    advancedCalibration,
    advancedDraft,
    error,
    setAdvancedScreenshot,
    setAdvancedOuterRect,
    confirmAdvancedOuterRect,
    setAdvancedPanels,
    acceptAdvancedCalibration,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.advancedCalibrationScreen));
  const [phase, setPhase] = useState<AdvancedCalibrationPhase>("outer");
  const [grid, setGrid] = useState<AdvancedSnapGrid>(() =>
    advancedCalibration?.grid ?? { columns: 4, rows: 5 }
  );
  const [leavingDraft, setLeavingDraft] = useState<AdvancedCalibrationDraft | null>(null);
  const [leavingPhase, setLeavingPhase] = useState<AdvancedCalibrationPhase | null>(null);
  const [resumePhase, setResumePhase] = useState<AdvancedCalibrationPhase | null>(null);

  const importScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const screenshot = {
        fileName: asset.fileName,
        height: asset.height,
        uri: asset.uri,
        width: asset.width,
      };
      const suggestedRect = getSuggestedCalibrationRect(screenshot);
      setAdvancedScreenshot(screenshot, suggestedRect);
      setGrid(advancedCalibration?.grid ?? getDefaultAdvancedSnapGrid(suggestedRect));
      setLeavingDraft(null);
      setLeavingPhase(null);
      setPhase("outer");
      setResumePhase(null);
    }
  };

  const continueToNextPhase = () => {
    confirmAdvancedOuterRect();
    setPhase(resumePhase ?? "grid");
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
  const previousPhase = getPreviousPhase(displayedPhase);
  const nextPhase = getNextPhase(displayedPhase);

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

  return {
    advancedDraft: displayedDraft,
    error,
    grid,
    phase: displayedPhase,
    canGoBack: previousPhase !== null,
    importScreenshot,
    decrementColumns: () => setGrid((current) => ({ ...current, columns: Math.max(2, current.columns - 1) })),
    decrementRows: () => setGrid((current) => ({ ...current, rows: Math.max(2, current.rows - 1) })),
    goBack,
    goForward,
    incrementColumns: () => setGrid((current) => ({ ...current, columns: Math.min(8, current.columns + 1) })),
    incrementRows: () => setGrid((current) => ({ ...current, rows: Math.min(8, current.rows + 1) })),
    isConfirmPhase: displayedPhase === "confirm",
    isGridPhase: displayedPhase === "grid",
    isOuterPhase: displayedPhase === "outer",
    returnToOuter,
    saveCalibration,
    setColumns: (columns: number) => setGrid((current) => ({ ...current, columns })),
    setRows: (rows: number) => setGrid((current) => ({ ...current, rows })),
    setAdvancedOuterRect,
    setAdvancedPanels,
  };
}
