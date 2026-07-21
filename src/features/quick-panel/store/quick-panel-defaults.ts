import { createAdvancedPreset } from "../calibration/advanced/advanced-geometry";
import { createButtonsPreset } from "../calibration/advanced/buttons-geometry";
import { getCalibratedPreset } from "../calibration/shared/calibration-preset";
import { s25PlusOneUi85Preset } from "../model/preset";
import type {
  AdvancedCalibration,
  AdvancedButtonsCalibration,
  AdvancedButtonsDraft,
  AdvancedTarget,
  AdvancedCalibrationDraft,
  CustomizationMode,
  DefaultCalibration,
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
  QuickPanelStep,
} from "../model/types";
import {
  loadCalibrations,
  loadLastExportedAdvancedTarget,
  loadLastExportedMode,
} from "./storage";

export interface QuickPanelStateData {
  step: QuickPanelStep;
  selectedMode: CustomizationMode | null;
  lastExportedMode: CustomizationMode | null;
  lastExportedAdvancedTarget: AdvancedTarget | null;
  defaultCalibration: DefaultCalibration | null;
  advancedCalibration: AdvancedCalibration | null;
  advancedButtonsCalibration: AdvancedButtonsCalibration | null;
  selectedAdvancedTarget: AdvancedTarget | null;
  activePreset: QuickPanelPreset;
  screenshot: PickedImage | null;
  calibrationRect: PanelRect | null;
  advancedDraft: AdvancedCalibrationDraft | null;
  advancedButtonsDraft: AdvancedButtonsDraft | null;
  image: PickedImage | null;
  transform: ImageTransform;
  exports: GeneratedExport[];
  isExporting: boolean;
  isProcessingImage: boolean;
  errorKey: string | null;
  error: string | null;
}

export function createEmptyTransform(): ImageTransform {
  return { x: 0, y: 0, scale: 1 };
}

export function createResetWorkState() {
  return {
    image: null,
    transform: createEmptyTransform(),
    exports: [] as GeneratedExport[],
    isProcessingImage: false,
    errorKey: null,
  };
}

export function getPresetForMode(
  mode: CustomizationMode,
  defaultCalibration: DefaultCalibration | null,
  advancedCalibration: AdvancedCalibration | null,
  advancedButtonsCalibration: AdvancedButtonsCalibration | null,
  advancedTarget: AdvancedTarget | null,
) {
  if (mode === "advanced" && advancedTarget === "controls" && advancedCalibration) {
    return createAdvancedPreset(advancedCalibration);
  }
  if (mode === "advanced" && advancedTarget === "buttons" && advancedButtonsCalibration) {
    return createButtonsPreset(advancedButtonsCalibration);
  }
  if (mode === "default" && defaultCalibration) {
    return getCalibratedPreset(defaultCalibration.rect);
  }
  return s25PlusOneUi85Preset;
}

export function createInitialQuickPanelStateData(): QuickPanelStateData {
  const saved = loadCalibrations();
  return {
    step: "landing",
    selectedMode: null,
    lastExportedMode: loadLastExportedMode(),
    lastExportedAdvancedTarget: loadLastExportedAdvancedTarget(),
    defaultCalibration: saved.default,
    advancedCalibration: saved.advancedControls,
    advancedButtonsCalibration: saved.advancedButtons,
    selectedAdvancedTarget: null,
    activePreset: s25PlusOneUi85Preset,
    screenshot: null,
    calibrationRect: null,
    advancedDraft: null,
    advancedButtonsDraft: null,
    image: null,
    transform: createEmptyTransform(),
    exports: [],
    isExporting: false,
    isProcessingImage: false,
    errorKey: null,
    error: null,
  };
}
