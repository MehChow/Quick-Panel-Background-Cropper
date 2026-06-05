import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  canUseAsSecondCustomScreenshot,
  getMergedCustomScreenshotMetrics,
} from "../custom-calibration-session";
import { panelIds } from "../../model/calibration-profile";
import { translate } from "../../model/i18n";
import { getSuggestedCalibrationRect } from "../calibration";
import type {
  CustomCalibrationSourceMode,
  PanelRect,
  PickedImage,
} from "../../model/types";
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
    customCalibrationSession,
    customCalibrationStep,
    isCustomCalibrationReview,
    error,
    setScreenshot,
    setCalibrationRect,
    acceptCalibration,
    acceptCalibrationProfile,
    setCustomCalibrationDraft,
    setCustomCalibrationSession,
    setCustomCalibrationStep,
    setCustomCalibrationReview,
    resetCustomCalibrationSession,
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

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      fileName: asset.fileName,
      height: asset.height,
      uri: asset.uri,
      width: asset.width,
    } satisfies PickedImage;
  };

  const startCustomCalibrationSession = (
    nextScreenshot: PickedImage,
    sourceMode: CustomCalibrationSourceMode,
  ) => {
    setCustomCalibrationDraft(
      createSuggestedCustomCalibrationProfile(nextScreenshot),
    );
    setCustomCalibrationStep(panelIds[0]);
    setCustomCalibrationReview(false);
    setCustomCalibrationSession({
      bottomOffsetY: null,
      bottomScreenshot: null,
      mergedHeight: sourceMode === "single" ? nextScreenshot.height : null,
      sourceMode,
      topScreenshot: nextScreenshot,
    });
  };

  const importScreenshot = async () => {
    setIsHelpOpen(false);
    setLocalError(null);

    const nextScreenshot = await pickScreenshot();
    if (!nextScreenshot) {
      return;
    }

    if (isCustomMode) {
      startCustomCalibrationSession(
        nextScreenshot,
        customCalibrationSession.sourceMode,
      );
      return;
    }

    setScreenshot(nextScreenshot, getSuggestedCalibrationRect(nextScreenshot));
  };

  const importCustomBottomScreenshot = async () => {
    setIsHelpOpen(false);
    setLocalError(null);

    const topScreenshot = customCalibrationSession.topScreenshot;
    if (!topScreenshot) {
      return;
    }

    const nextScreenshot = await pickScreenshot();
    if (!nextScreenshot) {
      return;
    }

    if (!canUseAsSecondCustomScreenshot(topScreenshot, nextScreenshot)) {
      setLocalError(
        translate("errors.customCalibrationSecondScreenshotSizeMismatch"),
      );
      return;
    }

    setCustomCalibrationSession({
      bottomScreenshot: nextScreenshot,
      mergedHeight: getMergedCustomScreenshotMetrics(
        topScreenshot,
        nextScreenshot,
        topScreenshot.height,
      ).height,
    });
  };

  const saveCalibration = () => {
    setLocalError(null);

    if (isCustomMode) {
      if (!canSaveCustomCalibration(customCalibrationDraft)) {
        setLocalError(translate("errors.customCalibrationIncomplete"));
        return;
      }

      acceptCalibrationProfile(customCalibrationDraft);
      resetCustomCalibrationSession();
      router.dismissTo("/");
      return;
    }

    if (screenshot && calibrationRect) {
      setLeavingCalibration({ screenshot, rect: calibrationRect });
    }
    if (acceptCalibration()) {
      router.dismissTo("/");
    }
  };

  const displayedScreenshot = isCustomMode
    ? customCalibrationSession.topScreenshot
    : screenshot ?? leavingCalibration?.screenshot ?? null;
  const displayedRect = calibrationRect ?? leavingCalibration?.rect ?? null;

  return {
    calibrationMode,
    customCalibrationSession,
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
    setCustomCalibrationSourceMode: (sourceMode: CustomCalibrationSourceMode) => {
      setLocalError(null);
      setCustomCalibrationSession({
        bottomOffsetY: null,
        bottomScreenshot: null,
        mergedHeight:
          sourceMode === "single"
            ? customCalibrationSession.topScreenshot?.height ?? null
            : null,
        sourceMode,
      });
    },
    importCustomBottomScreenshot,
    leaveCustomReview: () => {
      setLocalError(null);
      setCustomCalibrationReview(false);
    },
    saveCalibration,
    openHelp: () => setIsHelpOpen(true),
    closeHelp: () => setIsHelpOpen(false),
  };
}
