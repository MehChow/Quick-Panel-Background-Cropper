import { getCalibratedPreset } from "../calibration/calibration";
import { s25PlusOneUi85Preset } from "../model/preset";
import type {
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
  QuickPanelStep,
} from "../model/types";
import { loadCalibration } from "./storage";

export interface QuickPanelStateData {
  step: QuickPanelStep;
  isCalibrated: boolean;
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
  const savedCalibration = loadCalibration();
  const activePreset = savedCalibration.rect
    ? getCalibratedPreset(savedCalibration.rect)
    : s25PlusOneUi85Preset;

  return {
    step: "landing",
    isCalibrated: savedCalibration.isCalibrated,
    presetId: activePreset.id,
    activePreset,
    screenshot: null,
    calibrationRect: savedCalibration.rect,
    image: null,
    transform: createEmptyTransform(),
    exports: [],
    isExporting: false,
    error: null,
  };
}
