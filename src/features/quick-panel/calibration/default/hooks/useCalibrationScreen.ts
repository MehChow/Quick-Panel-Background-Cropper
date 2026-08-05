import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PanelRect, PickedImage } from "../../../model/types";
import { pickImageFromLibrary } from "../../../shared/pick-image-from-library";
import { useQuickPanelStore } from "../../../store/quick-panel-store";
import { quickPanelSelectors } from "../../../store/selectors";
import { getSuggestedCalibrationRect } from "../../shared/calibration-preset";
import { useOwnedImageCache } from "../../../cache/useOwnedImageCache";

interface CalibrationPresentation {
  screenshot: PickedImage;
  rect: PanelRect;
}

export function useCalibrationScreen() {
  const router = useRouter();
  const ownedImageCache = useOwnedImageCache();
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
    try {
      const nextScreenshot = await pickImageFromLibrary();
      if (!nextScreenshot) {
        return;
      }

      ownedImageCache.track(nextScreenshot);
      setScreenshot(
        nextScreenshot,
        getSuggestedCalibrationRect(nextScreenshot),
      );
      ownedImageCache.release(screenshot);
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
    displayedScreenshot,
    displayedRect,
    setCalibrationRect,
    importScreenshot,
    saveCalibration,
  };
}
