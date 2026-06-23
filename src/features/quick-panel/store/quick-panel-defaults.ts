import { createAdvancedPreset } from "../calibration/advanced/advanced-geometry";
import { getCalibratedPreset } from "../calibration/shared/calibration-preset";
import { s25PlusOneUi85Preset } from "../model/preset";
import type {
  AdvancedCalibration,
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
import { loadCalibrations, loadLastExportedMode } from "./storage";

export interface QuickPanelStateData {
  step: QuickPanelStep;
  selectedMode: CustomizationMode | null;
  lastExportedMode: CustomizationMode | null;
  defaultCalibration: DefaultCalibration | null;
  advancedCalibration: AdvancedCalibration | null;
  activePreset: QuickPanelPreset;
  screenshot: PickedImage | null;
  calibrationRect: PanelRect | null;
  advancedDraft: AdvancedCalibrationDraft | null;
  image: PickedImage | null;
  transform: ImageTransform;
  exports: GeneratedExport[];
  isExporting: boolean;
  isProcessingImage: boolean;
  noticeKey: string | null;
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
    noticeKey: null,
    errorKey: null,
  };
}

export function getPresetForMode(
  mode: CustomizationMode,
  defaultCalibration: DefaultCalibration | null,
  advancedCalibration: AdvancedCalibration | null,
) {
  if (mode === "advanced" && advancedCalibration) {
    return createAdvancedPreset(advancedCalibration);
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
    defaultCalibration: saved.default,
    advancedCalibration: saved.advanced,
    activePreset: s25PlusOneUi85Preset,
    screenshot: null,
    calibrationRect: null,
    advancedDraft: null,
    image: null,
    transform: createEmptyTransform(),
    exports: [],
    isExporting: false,
    isProcessingImage: false,
    noticeKey: null,
    errorKey: null,
    error: null,
  };
}
