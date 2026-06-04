import { useShallow } from "zustand/react/shallow";
import {
  panelIds,
  type CustomPanelsCalibrationProfile,
  type PanelCalibration,
} from "../../model/calibration-profile";
import type { PanelRect, PickedImage } from "../../model/types";
import { quickPanelSelectors } from "../../store/selectors";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { getSuggestedCalibrationRect, getCalibratedPreset } from "../calibration";

export function createSuggestedCustomCalibrationProfile(
  screenshot: PickedImage,
): CustomPanelsCalibrationProfile {
  const preset = getCalibratedPreset(getSuggestedCalibrationRect(screenshot));

  return {
    mode: "custom-panels",
    panels: Object.fromEntries(
      panelIds.map((id) => [
        id,
        {
          id,
          rect: { ...preset.panels[id].rect },
          status: "unconfigured",
        } satisfies PanelCalibration,
      ]),
    ) as CustomPanelsCalibrationProfile["panels"],
    version: 1,
  };
}

export function canSaveCustomCalibration(
  profile: CustomPanelsCalibrationProfile,
) {
  const panels = Object.values(profile.panels);

  return (
    panels.every((panel) => panel.status !== "unconfigured") &&
    panels.some((panel) => panel.status === "present" && panel.rect !== null)
  );
}

export function useCustomCalibrationFlow() {
  const {
    customCalibrationDraft,
    customCalibrationStep,
    isCustomCalibrationReview,
    setCustomCalibrationDraft,
    setCustomCalibrationReview,
    setCustomCalibrationStep,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.calibrationScreen));
  const currentStepIndex = panelIds.indexOf(customCalibrationStep);
  const currentPanel = customCalibrationDraft.panels[customCalibrationStep];
  const isLastStep = currentStepIndex === panelIds.length - 1;

  const setCurrentPanel = (panel: PanelCalibration) => {
    setCustomCalibrationDraft({
      ...customCalibrationDraft,
      panels: {
        ...customCalibrationDraft.panels,
        [panel.id]: panel,
      },
    });
  };

  const setCurrentRect = (rect: PanelRect) => {
    setCurrentPanel({
      ...currentPanel,
      rect,
      status: currentPanel.status === "hidden" ? "present" : currentPanel.status,
    });
  };

  const markCurrentHidden = () => {
    setCurrentPanel({ ...currentPanel, status: "hidden" });
  };

  const markCurrentPresent = () => {
    if (!currentPanel.rect) {
      return;
    }

    setCurrentPanel({ ...currentPanel, status: "present" });
  };

  const goToNextStep = () => {
    if (!currentPanel.rect && currentPanel.status !== "hidden") {
      return false;
    }

    if (currentPanel.status !== "hidden") {
      markCurrentPresent();
    }

    if (isLastStep) {
      setCustomCalibrationReview(true);
      return true;
    }

    setCustomCalibrationStep(panelIds[currentStepIndex + 1]);
    return true;
  };

  const goToPreviousStep = () => {
    if (isCustomCalibrationReview) {
      setCustomCalibrationReview(false);
      return;
    }

    if (currentStepIndex > 0) {
      setCustomCalibrationStep(panelIds[currentStepIndex - 1]);
    }
  };

  return {
    customCalibrationDraft,
    currentPanel,
    currentStepIndex,
    isCurrentPanelHidden: currentPanel.status === "hidden",
    isCustomCalibrationReview,
    isLastStep,
    canSave: canSaveCustomCalibration(customCalibrationDraft),
    goToNextStep,
    goToPreviousStep,
    markCurrentHidden,
    markCurrentPresent,
    setCurrentRect,
    stepCount: panelIds.length,
  };
}
