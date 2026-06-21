import { create } from "zustand";
import {
  getInitialAdvancedPanels,
  scalePanelsToOuter,
} from "../calibration/advanced/advanced-geometry";
import type {
  AdvancedSnapGrid,
  CustomizationMode,
  GeneratedExport,
  ImageTransform,
  PanelId,
  PanelRect,
  PanelRects,
  PickedImage,
} from "../model/types";
import { translate } from "../model/i18n";
import {
  createInitialQuickPanelStateData,
  type QuickPanelStateData,
} from "./quick-panel-defaults";
import {
  getAcceptAdvancedCalibrationResult,
  getAcceptCalibrationResult,
  getAdvancedCalibrationState,
  getDefaultCalibrationState,
  getFailExportState,
  getFinishExportState,
  getImageState,
  getFinishImageProcessingState,
  getFailImageProcessingState,
  getLandingState,
  getModeSelectionState,
  getModeState,
  getResetFitState,
  getStartImageProcessingState,
  getStartExportState,
  getTransformState,
} from "./quick-panel-transitions";
import { saveCalibration, saveCalibrations } from "./storage";
import { createAdvancedDraft, getCalibrationFromDraft } from "./advanced-calibration-state";

export interface QuickPanelState extends QuickPanelStateData {
  goToLanding: () => void;
  goToModeSelection: () => void;
  selectMode: (mode: CustomizationMode) => boolean;
  goToCalibration: () => void;
  goToAdvancedCalibration: () => void;
  setScreenshot: (screenshot: PickedImage, rect: PanelRect) => void;
  setCalibrationRect: (rect: PanelRect) => void;
  acceptCalibration: () => boolean;
  setAdvancedScreenshot: (screenshot: PickedImage, suggestedOuter: PanelRect) => void;
  setAdvancedOuterRect: (rect: PanelRect) => void;
  confirmAdvancedOuterRect: () => void;
  setAdvancedEnabledPanels: (enabledPanels: PanelId[]) => void;
  setAdvancedPanels: (panels: PanelRects) => void;
  acceptAdvancedCalibration: (grid: AdvancedSnapGrid) => boolean;
  startImageProcessing: () => void;
  finishImageProcessing: (image: PickedImage, noticeKey: string | null) => void;
  failImageProcessing: (message: string | null, errorKey: string | null) => void;
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
  goToModeSelection: () => set(getModeSelectionState()),
  selectMode: (mode) => {
    const state = get();
    const hasCalibration = mode === "default"
      ? Boolean(state.defaultCalibration)
      : Boolean(state.advancedCalibration);
    set(getModeState(mode, state.defaultCalibration, state.advancedCalibration));
    return hasCalibration;
  },
  goToCalibration: () => set(getDefaultCalibrationState(get().defaultCalibration)),
  goToAdvancedCalibration: () => set(getAdvancedCalibrationState(get().advancedCalibration)),
  setScreenshot: (screenshot, rect) => set({ screenshot, calibrationRect: rect, error: null }),
  setCalibrationRect: (rect) => set({ calibrationRect: rect, error: null }),
  acceptCalibration: () => {
    const result = getAcceptCalibrationResult(get().calibrationRect);
    if (!result.didAccept || !result.defaultCalibration) {
      set(result.state);
      return false;
    }
    const state = get();
    saveCalibration(result.defaultCalibration.rect);
    saveCalibrations({ version: 2, default: result.defaultCalibration, advanced: state.advancedCalibration });
    set(result.state);
    return true;
  },
  setAdvancedScreenshot: (screenshot, suggestedOuter) => set((state) => ({
    advancedDraft: createAdvancedDraft(screenshot, suggestedOuter, state.advancedCalibration),
    error: null,
  })),
  setAdvancedOuterRect: (outerRect) => set((state) => {
    const draft = state.advancedDraft;
    return {
      advancedDraft: draft ? {
        ...draft,
        outerRect,
        panels: draft.outerRect && draft.panels
          ? scalePanelsToOuter(draft.panels, draft.outerRect, outerRect)
          : draft.panels,
      } : null,
      error: null,
    };
  }),
  confirmAdvancedOuterRect: () => set((state) => {
    const draft = state.advancedDraft;
    if (!draft?.outerRect) {
      return { error: translate("errors.confirmOuterFirst") };
    }
    return {
      advancedDraft: {
        ...draft,
        panels: draft.panels ?? getInitialAdvancedPanels(draft.outerRect),
      },
      error: null,
    };
  }),
  setAdvancedEnabledPanels: (enabledPanels) => set((state) => ({
    advancedDraft: state.advancedDraft
      ? { ...state.advancedDraft, enabledPanels }
      : null,
    error: enabledPanels.length > 0 ? null : translate("errors.selectAdvancedPanel"),
  })),
  setAdvancedPanels: (panels) => set((state) => ({
    advancedDraft: state.advancedDraft ? { ...state.advancedDraft, panels } : null,
    error: null,
  })),
  acceptAdvancedCalibration: (grid) => {
    const state = get();
    const calibration = getCalibrationFromDraft(state.advancedDraft, grid);
    if (!calibration) {
      set({ error: translate("errors.invalidAdvancedPanels") });
      return false;
    }
    saveCalibrations({ version: 2, default: state.defaultCalibration, advanced: calibration });
    set(getAcceptAdvancedCalibrationResult(calibration));
    return true;
  },
  startImageProcessing: () => set(getStartImageProcessingState()),
  finishImageProcessing: (image, noticeKey) =>
    set(getFinishImageProcessingState(image, get().activePreset, noticeKey)),
  failImageProcessing: (message, errorKey) =>
    set(getFailImageProcessingState(message, errorKey)),
  setImage: (image) => set(getImageState(image, get().activePreset)),
  setTransform: (transform) => set(getTransformState(transform, get().image, get().activePreset)),
  resetFit: () => {
    const nextState = getResetFitState(get().image, get().activePreset);
    if (nextState) set(nextState);
  },
  startExport: () => set(getStartExportState()),
  finishExport: (exports) => set(getFinishExportState(exports)),
  failExport: (message) => set(getFailExportState(message)),
}));
