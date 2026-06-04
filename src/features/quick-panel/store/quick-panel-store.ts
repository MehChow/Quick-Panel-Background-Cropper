import { create } from "zustand";
import type {
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
} from "../model/types";
import {
  createInitialQuickPanelStateData,
  type QuickPanelStateData,
} from "./quick-panel-defaults";
import {
  getAcceptCalibrationResult,
  getCalibrationState,
  getFailExportState,
  getFinishExportState,
  getImageState,
  getLandingState,
  getResetFitState,
  getStartCustomizingResult,
  getStartExportState,
  getTransformState,
} from "./quick-panel-transitions";
import { saveCalibration } from "./storage";

export interface QuickPanelState extends QuickPanelStateData {
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

const initialState = createInitialQuickPanelStateData();

export const useQuickPanelStore = create<QuickPanelState>((set, get) => ({
  ...initialState,
  goToLanding: () => set(getLandingState()),
  goToCalibration: () =>
    set(getCalibrationState(get().isCalibrated, get().calibrationRect)),
  startCustomizing: () => {
    const result = getStartCustomizingResult(get().isCalibrated);
    set(result.state);
    return result.didStart;
  },
  setScreenshot: (screenshot, rect) =>
    set({
      screenshot,
      calibrationRect: rect,
      error: null,
    }),
  setCalibrationRect: (rect) => set({ calibrationRect: rect, error: null }),
  acceptCalibration: () => {
    const result = getAcceptCalibrationResult(get().calibrationRect);
    if (!result.didAccept) {
      set(result.state);
      return false;
    }

    saveCalibration(get().calibrationRect as PanelRect);
    set(result.state);
    return true;
  },
  setImage: (image) => set(getImageState(image, get().activePreset)),
  setTransform: (transform) =>
    set(getTransformState(transform, get().image, get().activePreset)),
  resetFit: () => {
    const nextState = getResetFitState(get().image, get().activePreset);
    if (nextState) {
      set(nextState);
    }
  },
  startExport: () => set(getStartExportState()),
  finishExport: (exports) => set(getFinishExportState(exports)),
  failExport: (message) => set(getFailExportState(message)),
}));
