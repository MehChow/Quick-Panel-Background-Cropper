import { create } from "zustand";
import { getCalibratedPreset } from "../calibration/calibration";
import { translate } from "../model/i18n";
import { s25PlusOneUi85Preset } from "../model/preset";
import { clampTransform, getFitTransform } from "../model/transform";
import type {
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
  QuickPanelStep,
} from "../model/types";
import { loadCalibration, saveCalibration } from "./storage";

interface QuickPanelState {
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
  goToLanding: () => void;
  goToCalibration: () => void;
  startCustomizing: () => boolean;
  setScreenshot: (screenshot: PickedImage, rect: PanelRect) => void;
  setCalibrationRect: (rect: PanelRect) => void;
  acceptCalibration: () => boolean;
  setImage: (image: PickedImage) => void;
  setTransform: (transform: ImageTransform) => void;
  resetFit: () => void;
  startExport: () => void;
  finishExport: (exports: GeneratedExport[]) => void;
  failExport: (message: string) => void;
}

const emptyTransform: ImageTransform = { x: 0, y: 0, scale: 1 };
const savedCalibration = loadCalibration();
const savedPreset = savedCalibration.rect
  ? getCalibratedPreset(savedCalibration.rect)
  : s25PlusOneUi85Preset;
const resetWork = {
  image: null,
  transform: emptyTransform,
  exports: [],
};

export const useQuickPanelStore = create<QuickPanelState>((set, get) => ({
  step: "landing",
  isCalibrated: savedCalibration.isCalibrated,
  presetId: savedPreset.id,
  activePreset: savedPreset,
  screenshot: null,
  calibrationRect: savedCalibration.rect,
  image: null,
  transform: emptyTransform,
  exports: [],
  isExporting: false,
  error: null,
  goToLanding: () =>
    set({
      step: "landing",
      screenshot: null,
      ...resetWork,
      error: null,
    }),
  goToCalibration: () =>
    set({
      step: "calibration",
      screenshot: null,
      calibrationRect: get().isCalibrated ? get().calibrationRect : null,
      ...resetWork,
      error: null,
    }),
  startCustomizing: () => {
    if (!get().isCalibrated) {
      set({
        step: "calibration",
        error: translate("errors.mustCalibrate"),
      });
      return false;
    }

    set({
      step: "imageSelection",
      ...resetWork,
      error: null,
    });
    return true;
  },
  setScreenshot: (screenshot, rect) =>
    set({
      screenshot,
      calibrationRect: rect,
      error: null,
    }),
  setCalibrationRect: (rect) => set({ calibrationRect: rect, error: null }),
  acceptCalibration: () => {
    const rect = get().calibrationRect;
    if (!rect) {
      set({ error: translate("errors.importScreenshotFirst") });
      return false;
    }

    const activePreset = getCalibratedPreset(rect);
    saveCalibration(rect);
    set({
      activePreset,
      presetId: activePreset.id,
      step: "landing",
      isCalibrated: true,
      screenshot: null,
      calibrationRect: rect,
      ...resetWork,
      error: null,
    });
    return true;
  },
  setImage: (image) =>
    set({
      image,
      transform: getFitTransform(image, get().activePreset),
      exports: [],
      step: "adjustBackground",
      error: null,
    }),
  setTransform: (transform) => {
    const image = get().image;
    set({
      transform: image
        ? clampTransform(transform, image, get().activePreset)
        : transform,
    });
  },
  resetFit: () => {
    const image = get().image;
    if (image) {
      set({
        transform: getFitTransform(image, get().activePreset),
        error: null,
      });
    }
  },
  startExport: () => set({ isExporting: true, error: null, exports: [] }),
  finishExport: (exports) =>
    set({ isExporting: false, exports, step: "exported" }),
  failExport: (message) => set({ isExporting: false, error: message }),
}));
