import { createRef, useEffect, useRef, useState } from "react";
import type { View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import type { ExportRefs, PanelId } from "../../model/types";
import { isTransformAtFit } from "../../model/image-placement";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";
import { scheduleExportWork } from "../schedule-export-work";
import { useCustomizeActions } from "./useCustomizeActions";

function useExportRefs(panelIds: PanelId[]): ExportRefs {
  const [refs] = useState<ExportRefs>({});
  for (const id of panelIds) {
    refs[id] ??= createRef<View>();
  }
  return refs;
}

export function useCustomizeScreen() {
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
  const refs = useExportRefs(activePreset.goodLockOrder);
  const { beginExport, exportImages, pickImage, resetFit } = useCustomizeActions(refs);
  const canReset = image
    ? !isTransformAtFit(transform, image, activePreset)
    : false;

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
    canReset,
    setIsExportSurfaceReady: () => setReadyExportLoadToken(exportLoadToken),
    shouldRenderExportSurfaces: Boolean(image && isExporting),
    goToCalibration,
    goToAdvancedCalibration,
  };
}
