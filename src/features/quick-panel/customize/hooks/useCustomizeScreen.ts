import { useRef, useState } from "react";
import type { View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import type { ExportRefs, PanelId } from "../../model/types";
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

function createEmptyExportImageReadiness(): Record<PanelId, boolean> {
  return {
    brightness: false,
    buttonBox: false,
    mediaPlayer: false,
    volume: false,
  };
}

export function useCustomizeScreen() {
  const refs = useExportRefs();
  const exportImageReadyRef = useRef(createEmptyExportImageReadiness());
  const [isPreviewAdjusting, setIsPreviewAdjusting] = useState(false);
  const { activePreset, image, transform, setTransform, exports, isExporting, error } =
    useQuickPanelStore(useShallow(quickPanelSelectors.customizeScreen));
  const { exportImages, pickImage, resetFit } = useCustomizeActions(
    refs,
    exportImageReadyRef,
    () => {
      exportImageReadyRef.current = createEmptyExportImageReadiness();
    },
  );

  const setExportImageReady = (panelId: PanelId, isReady: boolean) => {
    exportImageReadyRef.current[panelId] = isReady;
  };

  return {
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    error,
    refs,
    setExportImageReady,
    hasExported: exports.length > 0,
    isPreviewAdjusting,
    setIsPreviewAdjusting,
    exportImages,
    pickImage,
    resetFit,
  };
}
