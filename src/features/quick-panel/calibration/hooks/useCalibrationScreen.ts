import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { panelIds } from "../../model/calibration-profile";
import { translate } from "../../model/i18n";
import { getSuggestedCalibrationRect } from "../calibration";
import type { PanelRect, PickedImage } from "../../model/types";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";
import {
  canSaveCustomCalibration,
  createSuggestedCustomCalibrationProfile,
  useCustomCalibrationFlow,
} from "./useCustomCalibrationFlow";

interface CalibrationPresentation {
  screenshot: PickedImage;
  rect: PanelRect;
}

export function useCalibrationScreen() {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [leavingCalibration, setLeavingCalibration] =
    useState<CalibrationPresentation | null>(null);
  const {
    calibrationMode,
    screenshot,
    calibrationRect,
    customCalibrationDraft,
    customCalibrationStep,
    isCustomCalibrationReview,
    error,
    setScreenshot,
    setCalibrationRect,
    acceptCalibration,
    acceptCalibrationProfile,
    setCustomCalibrationDraft,
    setCustomCalibrationStep,
    setCustomCalibrationReview,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.calibrationScreen));
  const {
    currentPanel,
    currentStepIndex,
    isCurrentPanelHidden,
    isLastStep,
    goToNextStep,
    goToPreviousStep,
    markCurrentHidden,
    markCurrentPresent,
    setCurrentRect,
    stepCount,
  } = useCustomCalibrationFlow();
  const isCustomMode = calibrationMode === "custom-panels";

  const importScreenshot = async () => {
    setIsHelpOpen(false);
    setLocalError(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const nextScreenshot = {
        fileName: asset.fileName,
        height: asset.height,
        uri: asset.uri,
        width: asset.width,
      };
      setScreenshot(nextScreenshot, getSuggestedCalibrationRect(nextScreenshot));
      if (isCustomMode) {
        setCustomCalibrationDraft(
          createSuggestedCustomCalibrationProfile(nextScreenshot),
        );
        setCustomCalibrationStep(panelIds[0]);
        setCustomCalibrationReview(false);
      }
    }
  };

  const saveCalibration = () => {
    setLocalError(null);

    if (isCustomMode) {
      if (!canSaveCustomCalibration(customCalibrationDraft)) {
        setLocalError(translate("errors.customCalibrationIncomplete"));
        return;
      }

      acceptCalibrationProfile(customCalibrationDraft);
      router.replace("/");
      return;
    }

    if (screenshot && calibrationRect) {
      setLeavingCalibration({ screenshot, rect: calibrationRect });
    }
    if (acceptCalibration()) {
      router.replace("/");
    }
  };

  const displayedScreenshot = screenshot ?? leavingCalibration?.screenshot ?? null;
  const displayedRect = calibrationRect ?? leavingCalibration?.rect ?? null;

  return {
    calibrationMode,
    error: localError ?? error,
    isHelpOpen,
    displayedScreenshot,
    displayedRect,
    isCalibrating: Boolean(displayedScreenshot && displayedRect),
    customCalibrationDraft,
    customCalibrationStep,
    currentCustomRect: currentPanel.rect,
    currentStepIndex,
    isCurrentCustomHidden: isCurrentPanelHidden,
    isCustomCalibrationReview,
    isLastCustomStep: isLastStep,
    stepCount,
    setCalibrationRect,
    setCurrentCustomRect: setCurrentRect,
    importScreenshot,
    goToNextCustomStep: () => {
      setLocalError(null);
      if (!goToNextStep()) {
        setLocalError(translate("errors.customCalibrationIncomplete"));
      }
    },
    goToPreviousCustomStep: () => {
      setLocalError(null);
      goToPreviousStep();
    },
    markCurrentCustomHidden: () => {
      setLocalError(null);
      markCurrentHidden();
    },
    markCurrentCustomPresent: () => {
      setLocalError(null);
      markCurrentPresent();
    },
    leaveCustomReview: () => {
      setLocalError(null);
      setCustomCalibrationReview(false);
    },
    saveCalibration,
    openHelp: () => setIsHelpOpen(true),
    closeHelp: () => setIsHelpOpen(false),
  };
}
