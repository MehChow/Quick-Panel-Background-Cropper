import { clampTransform, getFitTransform } from "../model/image-placement";
import {
  cloneCustomPanelsCalibrationProfile,
  createDefaultUnionCalibrationProfile,
  createEmptyCustomPanelsCalibrationProfile,
  hasCalibrationForMode,
  panelIds,
  type CalibrationMode,
  type CalibrationProfile,
} from "../model/calibration-profile";
import { translate } from "../model/i18n";
import { getPresetFromCalibrationProfile } from "../model/custom-preset";
import type {
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "../model/types";
import {
  createResetWorkState,
  type QuickPanelStateData,
} from "./quick-panel-defaults";

type QuickPanelStatePatch = Partial<QuickPanelStateData>;

export function getLandingState(): QuickPanelStatePatch {
  return {
    step: "landing",
    screenshot: null,
    ...createResetWorkState(),
    error: null,
  };
}

export function getCalibrationState(
  mode: CalibrationMode,
  profile: CalibrationProfile | null,
): QuickPanelStatePatch {
  const isCalibrated = hasCalibrationForMode(mode, profile);
  const customCalibrationDraft =
    mode === "custom-panels" && profile?.mode === "custom-panels"
      ? cloneCustomPanelsCalibrationProfile(profile)
      : createEmptyCustomPanelsCalibrationProfile();

  return {
    step: "calibration",
    isCalibrated,
    calibrationMode: mode,
    screenshot: null,
    calibrationRect:
      mode === "default-union" && profile?.mode === "default-union"
        ? profile.rect
        : null,
    customCalibrationDraft,
    customCalibrationStep: panelIds[0],
    isCustomCalibrationReview: false,
    ...createResetWorkState(),
    error: null,
  };
}

export function getCalibrationModeState(
  mode: CalibrationMode,
  profile: CalibrationProfile | null,
): QuickPanelStatePatch {
  return {
    calibrationMode: mode,
    isCalibrated: hasCalibrationForMode(mode, profile),
    calibrationRect:
      mode === "default-union" && profile?.mode === "default-union"
        ? profile.rect
        : null,
    error: null,
  };
}

export function getStartCustomizingResult(isCalibrated: boolean) {
  if (!isCalibrated) {
    return {
      didStart: false,
      state: {
        step: "calibration",
        error: translate("errors.mustCalibrate"),
      } satisfies QuickPanelStatePatch,
    };
  }

  return {
    didStart: true,
    state: {
      step: "imageSelection",
      ...createResetWorkState(),
      error: null,
    } satisfies QuickPanelStatePatch,
  };
}

export function getAcceptCalibrationResult(rect: PanelRect | null) {
  if (!rect) {
    return {
      didAccept: false,
      state: {
        error: translate("errors.importScreenshotFirst"),
      } satisfies QuickPanelStatePatch,
    };
  }

  const calibrationProfile = createDefaultUnionCalibrationProfile(rect);
  return {
    didAccept: true,
    state: getAcceptedCalibrationState(calibrationProfile),
  };
}

export function getImageState(
  image: PickedImage,
  activePreset: QuickPanelPreset,
): QuickPanelStatePatch {
  return {
    image,
    transform: getFitTransform(image, activePreset),
    exports: [],
    step: "adjustBackground",
    error: null,
  };
}

export function getTransformState(
  transform: ImageTransform,
  image: PickedImage | null,
  activePreset: QuickPanelPreset,
): QuickPanelStatePatch {
  return {
    transform: image
      ? clampTransform(transform, image, activePreset)
      : transform,
  };
}

export function getResetFitState(
  image: PickedImage | null,
  activePreset: QuickPanelPreset,
): QuickPanelStatePatch | null {
  if (!image) {
    return null;
  }

  return {
    transform: getFitTransform(image, activePreset),
    error: null,
  };
}

export function getStartExportState(): QuickPanelStatePatch {
  return { isExporting: true, error: null, exports: [] };
}

export function getFinishExportState(
  exports: GeneratedExport[],
): QuickPanelStatePatch {
  return { isExporting: false, exports, step: "exported" };
}

export function getFailExportState(message: string): QuickPanelStatePatch {
  return { isExporting: false, error: message };
}

export function getAcceptedCalibrationState(
  calibrationProfile: CalibrationProfile,
): QuickPanelStatePatch {
  const activePreset = getPresetFromCalibrationProfile(calibrationProfile);

  return {
    calibrationMode: calibrationProfile.mode,
    calibrationProfile,
    customCalibrationDraft:
      calibrationProfile.mode === "custom-panels"
        ? cloneCustomPanelsCalibrationProfile(calibrationProfile)
        : createEmptyCustomPanelsCalibrationProfile(),
    customCalibrationStep: panelIds[0],
    isCustomCalibrationReview: false,
    activePreset,
    presetId: activePreset.id,
    step: "landing",
    isCalibrated: true,
    screenshot: null,
    calibrationRect:
      calibrationProfile.mode === "default-union" ? calibrationProfile.rect : null,
    ...createResetWorkState(),
    error: null,
  };
}
