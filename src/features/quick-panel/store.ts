import { create } from "zustand";
import { getCalibratedPreset } from "./calibration";
import { s25PlusOneUi85Preset } from "./preset";
import { clampTransform, getFitTransform } from "./transform";
import type {
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
  QuickPanelPreset,
  QuickPanelStep,
} from "./types";

interface QuickPanelState {
  step: QuickPanelStep;
  presetId: string;
  activePreset: QuickPanelPreset;
  screenshot: PickedImage | null;
  calibrationRect: PanelRect | null;
  image: PickedImage | null;
  transform: ImageTransform;
  exports: GeneratedExport[];
  isExporting: boolean;
  error: string | null;
  setScreenshot: (screenshot: PickedImage, rect: PanelRect) => void;
  setCalibrationRect: (rect: PanelRect) => void;
  acceptCalibration: () => void;
  setImage: (image: PickedImage) => void;
  setTransform: (transform: ImageTransform) => void;
  resetFit: () => void;
  startExport: () => void;
  finishExport: (exports: GeneratedExport[]) => void;
  failExport: (message: string) => void;
}

const emptyTransform: ImageTransform = { x: 0, y: 0, scale: 1 };

export const useQuickPanelStore = create<QuickPanelState>((set, get) => ({
  step: "calibration",
  presetId: s25PlusOneUi85Preset.id,
  activePreset: s25PlusOneUi85Preset,
  screenshot: null,
  calibrationRect: null,
  image: null,
  transform: emptyTransform,
  exports: [],
  isExporting: false,
  error: null,
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
      set({ error: "Import a Quick Panel screenshot first." });
      return;
    }

    const activePreset = getCalibratedPreset(rect);
    set({
      activePreset,
      presetId: activePreset.id,
      step: "imageSelection",
      image: null,
      transform: emptyTransform,
      exports: [],
      error: null,
    });
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
  finishExport: (exports) => set({ isExporting: false, exports, step: "exported" }),
  failExport: (message) => set({ isExporting: false, error: message }),
}));
