import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { getSuggestedCalibrationRect } from "../../calibration/calibration";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";

export type AdvancedCalibrationPhase = "outer" | "panels";

export function useAdvancedCalibrationScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<AdvancedCalibrationPhase>("outer");
  const {
    advancedDraft,
    error,
    setAdvancedScreenshot,
    setAdvancedOuterRect,
    confirmAdvancedOuterRect,
    setAdvancedPanels,
    acceptAdvancedCalibration,
  } = useQuickPanelStore(useShallow(quickPanelSelectors.advancedCalibrationScreen));

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
      setAdvancedScreenshot(screenshot, getSuggestedCalibrationRect(screenshot));
      setPhase("outer");
    }
  };

  const continueToPanels = () => {
    confirmAdvancedOuterRect();
    setPhase("panels");
  };

  const saveCalibration = () => {
    if (acceptAdvancedCalibration()) {
      router.dismissTo("/customize");
    }
  };

  return {
    advancedDraft,
    error,
    phase,
    importScreenshot,
    continueToPanels,
    returnToOuter: () => setPhase("outer"),
    saveCalibration,
    setAdvancedOuterRect,
    setAdvancedPanels,
  };
}
