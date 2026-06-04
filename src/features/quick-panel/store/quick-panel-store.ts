import { create } from "zustand";
import type {
  CalibrationMode,
  CalibrationProfile,
  CustomPanelsCalibrationProfile,
} from "../model/calibration-profile";
import type {
  GeneratedExport,
  ImageTransform,
  PanelId,
  PanelRect,
  PickedImage,
} from "../model/types";
import {
  createInitialQuickPanelStateData,
  type QuickPanelStateData,
} from "./quick-panel-defaults";
import {
  getAcceptCalibrationResult,
  getAcceptedCalibrationState,
  getCalibrationModeState,
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
import { saveCalibrationProfile } from "./storage";

export interface QuickPanelState extends QuickPanelStateData {
  goToLanding: () => void;
  goToCalibration: () => void;
  setCalibrationMode: (mode: CalibrationMode) => void;
  startCustomizing: () => boolean;
  setScreenshot: (screenshot: PickedImage, rect: PanelRect) => void;
  setCalibrationRect: (rect: PanelRect) => void;
  acceptCalibration: () => boolean;
  acceptCalibrationProfile: (profile: CalibrationProfile) => void;
  setCustomCalibrationDraft: (draft: CustomPanelsCalibrationProfile) => void;
  setCustomCalibrationStep: (step: PanelId) => void;
  setCustomCalibrationReview: (isReview: boolean) => void;
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
    set(getCalibrationState(get().calibrationMode, get().calibrationProfile)),
  setCalibrationMode: (mode) =>
    set(getCalibrationModeState(mode, get().calibrationProfile)),
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

    saveCalibrationProfile(result.state.calibrationProfile as CalibrationProfile);
    set(result.state);
    return true;
  },
  acceptCalibrationProfile: (profile) => {
    saveCalibrationProfile(profile);
    set(getAcceptedCalibrationState(profile));
  },
  setCustomCalibrationDraft: (draft) =>
    set({
      customCalibrationDraft: draft,
      error: null,
    }),
  setCustomCalibrationStep: (step) =>
    set({
      customCalibrationStep: step,
      error: null,
    }),
  setCustomCalibrationReview: (isReview) =>
    set({
      isCustomCalibrationReview: isReview,
      error: null,
    }),
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
