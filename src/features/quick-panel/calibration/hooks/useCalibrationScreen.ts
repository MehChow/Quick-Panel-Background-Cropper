import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { getSuggestedCalibrationRect } from "../calibration";
import type { PanelRect, PickedImage } from "../../model/types";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";

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
    error,
    setScreenshot,
    setCalibrationRect,
    acceptCalibration,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.calibrationScreen));

  const importScreenshot = async () => {
    setIsHelpOpen(false);

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
      setScreenshot(
        nextScreenshot,
        getSuggestedCalibrationRect(nextScreenshot),
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
    isHelpOpen,
    displayedScreenshot,
    displayedRect,
    isCalibrating: Boolean(displayedScreenshot && displayedRect),
    setCalibrationRect,
    importScreenshot,
    saveCalibration,
    openHelp: () => setIsHelpOpen(true),
    closeHelp: () => setIsHelpOpen(false),
  };
}
