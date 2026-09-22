import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PanelRect, PickedImage } from "../../../model/types";
import { useImageImport } from "../../../shared/useImageImport";
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
  } = useQuickPanelStore(useShallow(quickPanelSelectors.calibrationScreen));

  const { importImage: importScreenshot, isImporting } = useImageImport((nextScreenshot) => {
    ownedImageCache.track(nextScreenshot);
    setScreenshot(
      nextScreenshot,
      getSuggestedCalibrationRect(nextScreenshot),
    );
    ownedImageCache.release(screenshot);
  });

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
    isImporting,
    saveCalibration,
  };
}
