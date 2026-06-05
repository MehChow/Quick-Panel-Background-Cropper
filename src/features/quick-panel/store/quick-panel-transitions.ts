import { clampTransform, getFitTransform } from "../model/image-placement";
import {
  cloneCustomPanelsCalibrationProfile,
  createDefaultUnionCalibrationProfile,
  createEmptyCustomPanelsCalibrationProfile,
  getCalibrationProfileForMode,
  panelIds,
  upsertSavedCalibrationProfile,
  type CalibrationMode,
  type CalibrationProfile,
  type SavedCalibrationProfiles,
} from "../model/calibration-profile";
import { translate } from "../model/i18n";
import { getPresetFromCalibrationProfile } from "../model/custom-preset";
import { s25PlusOneUi85Preset } from "../model/preset";
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
  savedProfiles: SavedCalibrationProfiles,
): QuickPanelStatePatch {
  const modeState = getSelectedModeState(mode, savedProfiles);

  return {
    step: "calibration",
    ...modeState,
    calibrationMode: mode,
    screenshot: null,
    customCalibrationStep: panelIds[0],
    isCustomCalibrationReview: false,
    ...createResetWorkState(),
    error: null,
  };
}

export function getCalibrationModeState(
  mode: CalibrationMode,
  savedProfiles: SavedCalibrationProfiles,
): QuickPanelStatePatch {
  const modeState = getSelectedModeState(mode, savedProfiles);

  return {
    ...modeState,
    calibrationMode: mode,
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

export function getAcceptCalibrationResult(
  rect: PanelRect | null,
  savedProfiles: SavedCalibrationProfiles,
) {
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
    state: getAcceptedCalibrationState(savedProfiles, calibrationProfile),
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
  savedProfiles: SavedCalibrationProfiles,
  calibrationProfile: CalibrationProfile,
): QuickPanelStatePatch {
  const nextSavedProfiles = upsertSavedCalibrationProfile(
    savedProfiles,
    calibrationProfile,
  );
  const modeState = getSelectedModeState(calibrationProfile.mode, nextSavedProfiles);

  return {
    ...modeState,
    calibrationMode: calibrationProfile.mode,
    savedCalibrationProfiles: nextSavedProfiles,
    customCalibrationStep: panelIds[0],
    isCustomCalibrationReview: false,
    step: "landing",
    screenshot: null,
    ...createResetWorkState(),
    error: null,
  };
}

function getSelectedModeState(
  mode: CalibrationMode,
  savedProfiles: SavedCalibrationProfiles,
) {
  const calibrationProfile = getCalibrationProfileForMode(mode, savedProfiles);
  const activePreset = calibrationProfile
    ? getPresetFromCalibrationProfile(calibrationProfile)
    : s25PlusOneUi85Preset;

  return {
    activePreset,
    calibrationProfile,
    calibrationRect:
      mode === "default-union" && calibrationProfile?.mode === "default-union"
        ? calibrationProfile.rect
        : null,
    customCalibrationDraft:
      mode === "custom-panels" && calibrationProfile?.mode === "custom-panels"
        ? cloneCustomPanelsCalibrationProfile(calibrationProfile)
        : createEmptyCustomPanelsCalibrationProfile(),
    isCalibrated: calibrationProfile !== null,
    presetId: activePreset.id,
  } satisfies QuickPanelStatePatch;
}
