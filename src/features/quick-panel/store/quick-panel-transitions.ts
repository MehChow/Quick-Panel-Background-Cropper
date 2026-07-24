import { createAdvancedPreset } from "../calibration/advanced/advanced-geometry";
import { createButtonsPreset } from "../calibration/advanced/buttons-geometry";
import { getCalibratedPreset } from "../calibration/shared/calibration-preset";
import { clampTransform, getFitTransform } from "../model/image-placement";
import { translate } from "../model/i18n";
import type {
  AdvancedCalibration,
  AdvancedButtonsCalibration,
  AdvancedTarget,
  CustomizationMode,
  DefaultCalibration,
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
} from "../model/types";
import { panelIds } from "../model/panel-ids";
import {
  createResetWorkState,
  getPresetForMode,
  type QuickPanelStateData,
} from "./quick-panel-defaults";

type QuickPanelStatePatch = Partial<QuickPanelStateData>;

export function getLandingState(): QuickPanelStatePatch {
  return { step: "landing", selectedMode: null, selectedAdvancedTarget: null, screenshot: null, advancedDraft: null, advancedButtonsDraft: null, ...createResetWorkState(), error: null };
}

export function getModeSelectionState(): QuickPanelStatePatch {
  return { step: "selectMode", selectedMode: null, selectedAdvancedTarget: null, screenshot: null, advancedDraft: null, advancedButtonsDraft: null, ...createResetWorkState(), error: null };
}

export function getModeState(
  mode: CustomizationMode,
  defaultCalibration: DefaultCalibration | null,
  advancedCalibration: AdvancedCalibration | null,
  advancedButtonsCalibration: AdvancedButtonsCalibration | null,
  advancedTarget: AdvancedTarget | null,
): QuickPanelStatePatch {
  const hasCalibration = mode === "default"
    ? Boolean(defaultCalibration)
    : advancedTarget === "buttons"
      ? Boolean(advancedButtonsCalibration)
      : Boolean(advancedCalibration);
  return {
    selectedMode: mode,
    selectedAdvancedTarget: mode === "advanced" ? advancedTarget : null,
    activePreset: getPresetForMode(mode, defaultCalibration, advancedCalibration, advancedButtonsCalibration, advancedTarget),
    step: mode === "advanced" && !advancedTarget
      ? "advancedTargetSelection"
      : hasCalibration ? "imageSelection" : mode === "default" ? "calibration" : "advancedCalibration",
    screenshot: null,
    calibrationRect: mode === "default" ? defaultCalibration?.rect ?? null : null,
    advancedDraft: null,
    advancedButtonsDraft: null,
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
  advancedTarget: AdvancedTarget = "controls",
): QuickPanelStatePatch {
  return {
    selectedMode: "advanced",
    selectedAdvancedTarget: advancedTarget,
    step: "advancedCalibration",
    advancedDraft: {
      screenshot: null,
      outerRect: advancedCalibration?.outerRect ?? null,
      enabledPanels: advancedCalibration?.enabledPanels ?? panelIds,
      panels: advancedCalibration?.panels ?? null,
    },
    advancedButtonsDraft: null,
    ...createResetWorkState(),
    error: null,
  };
}

export function getAdvancedButtonsCalibrationState(
  advancedButtonsCalibration: AdvancedButtonsCalibration | null,
): QuickPanelStatePatch {
  return {
    selectedMode: "advanced",
    selectedAdvancedTarget: "buttons",
    step: "advancedCalibration",
    advancedDraft: null,
    advancedButtonsDraft: {
      screenshot: null,
      outerRect: advancedButtonsCalibration?.outerRect ?? null,
      buttons: advancedButtonsCalibration?.buttons ?? [],
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

export function getAcceptAdvancedButtonsCalibrationResult(calibration: AdvancedButtonsCalibration) {
  return {
    activePreset: createButtonsPreset(calibration),
    advancedButtonsCalibration: calibration,
    advancedButtonsDraft: null,
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

export function getStartImageProcessingState(): QuickPanelStatePatch {
  return { error: null, errorKey: null, isProcessingImage: true };
}

export function getFinishImageProcessingState(
  image: PickedImage,
  activePreset: QuickPanelPreset,
): QuickPanelStatePatch {
  return {
    ...getImageState(image, activePreset),
    errorKey: null,
    isProcessingImage: false,
  };
}

export function getFailImageProcessingState(
  message: string | null,
  errorKey: string | null,
): QuickPanelStatePatch {
  return { error: message, errorKey, isProcessingImage: false };
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
