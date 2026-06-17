import { useRef, useState } from "react";
import type { View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import type { ExportRefs } from "../../model/types";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";
import { useCustomizeActions } from "./useCustomizeActions";

function useExportRefs(): ExportRefs {
  const buttonBoxRef = useRef<View>(null);
  const mediaPlayerRef = useRef<View>(null);
  const brightnessRef = useRef<View>(null);
  const volumeRef = useRef<View>(null);

  return {
    brightness: brightnessRef,
    buttonBox: buttonBoxRef,
    mediaPlayer: mediaPlayerRef,
    volume: volumeRef,
  };
}

export function useCustomizeScreen() {
  const refs = useExportRefs();
  const [isPreviewAdjusting, setIsPreviewAdjusting] = useState(false);
  const {
    selectedMode,
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    error,
    goToCalibration,
    goToAdvancedCalibration,
  } =
    useQuickPanelStore(useShallow(quickPanelSelectors.customizeScreen));
  const { exportImages, pickImage, resetFit } = useCustomizeActions(refs);

  return {
    selectedMode,
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    error,
    refs,
    isPreviewAdjusting,
    setIsPreviewAdjusting,
    exportImages,
    pickImage,
    resetFit,
    goToCalibration,
    goToAdvancedCalibration,
  };
}
