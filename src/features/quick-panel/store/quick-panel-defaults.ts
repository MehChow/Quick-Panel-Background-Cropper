import type {
  CalibrationMode,
  CalibrationProfile,
} from "../model/calibration-profile";
import { getPresetFromCalibrationProfile } from "../model/custom-preset";
import { s25PlusOneUi85Preset } from "../model/preset";
import type {
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
  QuickPanelStep,
} from "../model/types";
import { loadCalibrationSnapshot } from "./storage";

export interface QuickPanelStateData {
  step: QuickPanelStep;
  isCalibrated: boolean;
  calibrationMode: CalibrationMode;
  calibrationProfile: CalibrationProfile | null;
  presetId: string;
  activePreset: QuickPanelPreset;
  screenshot: PickedImage | null;
  calibrationRect: PanelRect | null;
  image: PickedImage | null;
  transform: ImageTransform;
  exports: GeneratedExport[];
  isExporting: boolean;
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
  };
}

export function createInitialQuickPanelStateData(): QuickPanelStateData {
  const calibration = loadCalibrationSnapshot();
  const activePreset = calibration.profile
    ? getPresetFromCalibrationProfile(calibration.profile)
    : s25PlusOneUi85Preset;

  return {
    step: "landing",
    isCalibrated: calibration.isCalibrated,
    calibrationMode: calibration.mode,
    calibrationProfile: calibration.profile,
    presetId: activePreset.id,
    activePreset,
    screenshot: null,
    calibrationRect: calibration.rect,
    image: null,
    transform: createEmptyTransform(),
    exports: [],
    isExporting: false,
    error: null,
  };
}
