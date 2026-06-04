import { clampTransform, getFitTransform } from "../model/image-placement";
import { createDefaultUnionCalibrationProfile } from "../model/calibration-profile";
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
  isCalibrated: boolean,
  calibrationRect: PanelRect | null,
): QuickPanelStatePatch {
  return {
    step: "calibration",
    screenshot: null,
    calibrationRect: isCalibrated ? calibrationRect : null,
    ...createResetWorkState(),
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
  const activePreset = getPresetFromCalibrationProfile(calibrationProfile);
  return {
    didAccept: true,
    state: {
      calibrationMode: calibrationProfile.mode,
      calibrationProfile,
      activePreset,
      presetId: activePreset.id,
      step: "landing",
      isCalibrated: true,
      screenshot: null,
      calibrationRect: rect,
      ...createResetWorkState(),
      error: null,
    } satisfies QuickPanelStatePatch,
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
