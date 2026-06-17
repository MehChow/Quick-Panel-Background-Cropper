import { createAdvancedPreset } from "../calibration/advanced/advanced-geometry";
import { getCalibratedPreset } from "../calibration/shared/calibration-preset";
import { clampTransform, getFitTransform } from "../model/image-placement";
import { translate } from "../model/i18n";
import type {
  AdvancedCalibration,
  CustomizationMode,
  DefaultCalibration,
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "../model/types";
import {
  createResetWorkState,
  getPresetForMode,
  type QuickPanelStateData,
} from "./quick-panel-defaults";

type QuickPanelStatePatch = Partial<QuickPanelStateData>;

export function getLandingState(): QuickPanelStatePatch {
  return { step: "landing", selectedMode: null, screenshot: null, advancedDraft: null, ...createResetWorkState(), error: null };
}

export function getModeSelectionState(): QuickPanelStatePatch {
  return { step: "selectMode", selectedMode: null, screenshot: null, advancedDraft: null, ...createResetWorkState(), error: null };
}

export function getModeState(
  mode: CustomizationMode,
  defaultCalibration: DefaultCalibration | null,
  advancedCalibration: AdvancedCalibration | null,
): QuickPanelStatePatch {
  const hasCalibration = mode === "default" ? Boolean(defaultCalibration) : Boolean(advancedCalibration);
  return {
    selectedMode: mode,
    activePreset: getPresetForMode(mode, defaultCalibration, advancedCalibration),
    step: hasCalibration ? "imageSelection" : mode === "default" ? "calibration" : "advancedCalibration",
    screenshot: null,
    calibrationRect: mode === "default" ? defaultCalibration?.rect ?? null : null,
    advancedDraft: null,
    ...createResetWorkState(),
    error: null,
  };
}

export function getDefaultCalibrationState(
  defaultCalibration: DefaultCalibration | null,
): QuickPanelStatePatch {
  return {
    selectedMode: "default",
    step: "calibration",
    screenshot: null,
    calibrationRect: defaultCalibration?.rect ?? null,
    ...createResetWorkState(),
    error: null,
  };
}

export function getAdvancedCalibrationState(
  advancedCalibration: AdvancedCalibration | null,
): QuickPanelStatePatch {
  return {
    selectedMode: "advanced",
    step: "advancedCalibration",
    advancedDraft: {
      screenshot: null,
      outerRect: advancedCalibration?.outerRect ?? null,
      panels: advancedCalibration?.panels ?? null,
    },
    ...createResetWorkState(),
    error: null,
  };
}

export function getAcceptCalibrationResult(rect: PanelRect | null) {
  if (!rect) {
    return { didAccept: false, state: { error: translate("errors.importScreenshotFirst") } satisfies QuickPanelStatePatch };
  }
  const defaultCalibration = { rect };
  return {
    didAccept: true,
    defaultCalibration,
    state: {
      defaultCalibration,
      activePreset: getCalibratedPreset(rect),
      step: "imageSelection",
      screenshot: null,
      calibrationRect: rect,
      ...createResetWorkState(),
      error: null,
    } satisfies QuickPanelStatePatch,
  };
}

export function getAcceptAdvancedCalibrationResult(calibration: AdvancedCalibration) {
  return {
    activePreset: createAdvancedPreset(calibration),
    advancedCalibration: calibration,
    advancedDraft: null,
    step: "imageSelection",
    ...createResetWorkState(),
    error: null,
  } satisfies QuickPanelStatePatch;
}

export function getStartCustomizingResult(isCalibrated: boolean) {
  return isCalibrated
    ? { didStart: true, state: { step: "imageSelection", ...createResetWorkState(), error: null } satisfies QuickPanelStatePatch }
    : { didStart: false, state: { step: "calibration", error: translate("errors.mustCalibrate") } satisfies QuickPanelStatePatch };
}

export function getImageState(image: PickedImage, activePreset: QuickPanelPreset): QuickPanelStatePatch {
  return { image, transform: getFitTransform(image, activePreset), exports: [], step: "adjustBackground", error: null };
}

export function getTransformState(transform: ImageTransform, image: PickedImage | null, activePreset: QuickPanelPreset): QuickPanelStatePatch {
  return { transform: image ? clampTransform(transform, image, activePreset) : transform };
}

export function getResetFitState(image: PickedImage | null, activePreset: QuickPanelPreset): QuickPanelStatePatch | null {
  return image ? { transform: getFitTransform(image, activePreset), error: null } : null;
}

export function getStartExportState(): QuickPanelStatePatch {
  return { isExporting: true, error: null, exports: [] };
}

export function getFinishExportState(exports: GeneratedExport[]): QuickPanelStatePatch {
  return { isExporting: false, exports, step: "exported" };
}

export function getFailExportState(message: string): QuickPanelStatePatch {
  return { isExporting: false, error: message };
}
