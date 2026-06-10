import {
  cloneCustomPanelsCalibrationProfile,
  createEmptyCustomPanelsCalibrationProfile,
  hasCalibrationForMode,
  panelIds,
} from "../model/calibration-profile";
import { createEmptyCustomCalibrationSession } from "../calibration/custom-calibration-session";
import type {
  CalibrationMode,
  CalibrationProfile,
  CustomPanelsCalibrationProfile,
  SavedCalibrationProfiles,
} from "../model/calibration-profile";
import { getPresetFromCalibrationProfile } from "../model/custom-preset";
import { s25PlusOneUi85Preset } from "../model/preset";
import type {
  CustomCalibrationSession,
  GeneratedExport,
  ImageTransform,
  PanelId,
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
  savedCalibrationProfiles: SavedCalibrationProfiles;
  customCalibrationDraft: CustomPanelsCalibrationProfile;
  customCalibrationStep: PanelId;
  isCustomCalibrationReview: boolean;
  customCalibrationSession: CustomCalibrationSession;
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
  let calibration = loadCalibrationSnapshot();
  let activePreset = s25PlusOneUi85Preset;

  if (calibration.profile) {
    try {
      activePreset = getPresetFromCalibrationProfile(calibration.profile);
    } catch {
      calibration = { ...calibration, isCalibrated: false, profile: null, rect: null };
    }
  }
  const customCalibrationDraft =
    calibration.profile?.mode === "custom-panels"
      ? cloneCustomPanelsCalibrationProfile(calibration.profile)
      : createEmptyCustomPanelsCalibrationProfile();

  return {
    step: "landing",
    isCalibrated: hasCalibrationForMode(calibration.mode, calibration.profile),
    calibrationMode: calibration.mode,
    calibrationProfile: calibration.profile,
    savedCalibrationProfiles: calibration.savedProfiles,
    customCalibrationDraft,
    customCalibrationStep: panelIds[0],
    isCustomCalibrationReview: false,
    customCalibrationSession: createEmptyCustomCalibrationSession(),
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
