import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { isTransformAtFit } from "../../model/image-placement";
import { useQuickPanelStore } from "../../store/quick-panel-store";
import { quickPanelSelectors } from "../../store/selectors";
import { useCustomizeActions } from "./useCustomizeActions";

export function useCustomizeScreen() {
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
    goToCalibration,
    goToAdvancedCalibration,
  } =
    useQuickPanelStore(useShallow(quickPanelSelectors.customizeScreen));
  const { pickImage, resetFit } = useCustomizeActions();
  const canReset = image
    ? !isTransformAtFit(transform, image, activePreset)
    : false;

  return {
    selectedMode,
    activePreset,
    image,
    transform,
    setTransform,
    exports,
    isExporting,
    isProcessingImage,
    isPreviewAdjusting,
    setIsPreviewAdjusting,
    pickImage,
    resetFit,
    canReset,
    goToCalibration,
    goToAdvancedCalibration,
  };
}
