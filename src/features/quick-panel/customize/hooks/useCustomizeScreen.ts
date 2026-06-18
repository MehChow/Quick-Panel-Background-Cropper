import { useEffect, useRef, useState } from "react";
import type { View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import type { ExportRefs } from "../../model/types";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";
import { scheduleExportWork } from "../schedule-export-work";
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
  const isRunningExportRef = useRef(false);
  const [exportLoadToken, setExportLoadToken] = useState(0);
  const [readyExportLoadToken, setReadyExportLoadToken] = useState(0);
  const [isPreviewAdjusting, setIsPreviewAdjusting] = useState(false);
  const {
    selectedMode,
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    isProcessingImage,
    noticeKey,
    errorKey,
    error,
    goToCalibration,
    goToAdvancedCalibration,
  } =
    useQuickPanelStore(useShallow(quickPanelSelectors.customizeScreen));
  const { beginExport, exportImages, pickImage, resetFit } = useCustomizeActions(refs);

  const startExport = () => {
    if (!image || isProcessingImage || isExporting) {
      return;
    }

    setExportLoadToken((current) => current + 1);
    beginExport();
  };

  useEffect(() => {
    if (
      !image ||
      !isExporting ||
      readyExportLoadToken !== exportLoadToken ||
      isRunningExportRef.current
    ) {
      return;
    }

    isRunningExportRef.current = true;
    const task = scheduleExportWork(() => {
      void exportImages().finally(() => {
        isRunningExportRef.current = false;
      });
    });

    return () => task.cancel();
  }, [exportImages, exportLoadToken, image, isExporting, readyExportLoadToken]);

  return {
    selectedMode,
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    isProcessingImage,
    noticeKey,
    errorKey,
    error,
    refs,
    isPreviewAdjusting,
    setIsPreviewAdjusting,
    exportImages: startExport,
    exportLoadToken,
    pickImage,
    resetFit,
    setIsExportSurfaceReady: () => setReadyExportLoadToken(exportLoadToken),
    shouldRenderExportSurfaces: Boolean(image && isExporting),
    goToCalibration,
    goToAdvancedCalibration,
  };
}
