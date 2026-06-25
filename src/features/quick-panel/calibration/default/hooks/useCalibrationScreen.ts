import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PanelRect, PickedImage } from "../../../model/types";
import { pickImageFromLibrary } from "../../../shared/pick-image-from-library";
import { markHelpSeen } from "../../../store/storage";
import { useQuickPanelStore } from "../../../store/quick-panel-store";
import { quickPanelSelectors } from "../../../store/selectors";
import { getSuggestedCalibrationRect } from "../../shared/calibration-preset";

interface CalibrationPresentation {
  screenshot: PickedImage;
  rect: PanelRect;
}

export function useCalibrationScreen() {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [leavingCalibration, setLeavingCalibration] =
    useState<CalibrationPresentation | null>(null);
  const {
    screenshot,
    calibrationRect,
    errorKey,
    error,
    setScreenshot,
    setCalibrationRect,
    acceptCalibration,
    failImageProcessing,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.calibrationScreen));

  const importScreenshot = async () => {
    setIsHelpOpen(false);

    try {
      const nextScreenshot = await pickImageFromLibrary();
      if (!nextScreenshot) {
        return;
      }

      setScreenshot(
        nextScreenshot,
        getSuggestedCalibrationRect(nextScreenshot),
      );
    } catch (error) {
      failImageProcessing(
        null,
        error instanceof Error
          ? error.message
          : "errors.unableToOpenImagePicker",
      );
    }
  };

  const saveCalibration = () => {
    if (screenshot && calibrationRect) {
      setLeavingCalibration({ screenshot, rect: calibrationRect });
    }
    if (acceptCalibration()) {
      router.dismissTo("/customize");
    }
  };

  const displayedScreenshot = screenshot ?? leavingCalibration?.screenshot ?? null;
  const displayedRect = calibrationRect ?? leavingCalibration?.rect ?? null;

  return {
    error,
    errorKey,
    isHelpOpen,
    displayedScreenshot,
    displayedRect,
    isCalibrating: Boolean(displayedScreenshot && displayedRect),
    setCalibrationRect,
    importScreenshot,
    saveCalibration,
    openHelp: () => {
      markHelpSeen("default-calibration");
      setIsHelpOpen(true);
    },
    closeHelp: () => setIsHelpOpen(false),
  };
}
