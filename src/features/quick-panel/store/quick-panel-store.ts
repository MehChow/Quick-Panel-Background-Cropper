import { create } from "zustand";
import {
  getInitialAdvancedPanels,
  scaleControlPanelsToOuter,
  scalePanelsToOuter,
} from "../calibration/advanced/advanced-geometry";
import type {
  AdvancedButtonsDraft,
  AdvancedSnapGrid,
  AdvancedTarget,
  ButtonCalibrationItem,
  ControlPanelId,
  CustomizationMode,
  GeneratedExport,
  ImageTransform,
  PanelRect,
  PickedImage,
} from "../model/types";
import { translate } from "../model/i18n";
import {
  createInitialQuickPanelStateData,
  type QuickPanelStateData,
} from "./quick-panel-defaults";
import {
  getAcceptAdvancedCalibrationResult,
  getAcceptAdvancedButtonsCalibrationResult,
  getAcceptAdvancedCombinedCalibrationResult,
  getAcceptCalibrationResult,
  getAdvancedButtonsCalibrationState,
  getAdvancedCombinedCalibrationState,
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
import {
  saveCalibrations,
  saveLastExportedAdvancedTarget,
  saveLastExportedMode,
} from "./storage";
import {
  createAdvancedCombinedDraft,
  getCombinedCalibrationFromDraft,
  initializeCombinedControlPanels,
  scaleCombinedDraftToOuter,
} from "../calibration/advanced/combined/combined-calibration-state";
import {
  createAdvancedButtonsDraft,
  createAdvancedDraft,
  getButtonsCalibrationFromDraft,
  getCalibrationFromDraft,
} from "./advanced-calibration-state";

export interface QuickPanelState extends QuickPanelStateData {
  goToLanding: () => void;
  goToModeSelection: () => void;
  selectMode: (mode: CustomizationMode) => boolean;
  selectAdvancedTarget: (target: AdvancedTarget) => boolean;
  goToCalibration: () => void;
  goToAdvancedCalibration: () => void;
  setError: (error: string | null) => void;
  setScreenshot: (screenshot: PickedImage, rect: PanelRect) => void;
  setCalibrationRect: (rect: PanelRect) => void;
  acceptCalibration: () => boolean;
  setAdvancedScreenshot: (screenshot: PickedImage, suggestedOuter: PanelRect) => void;
  setAdvancedOuterRect: (rect: PanelRect) => void;
  confirmAdvancedOuterRect: () => void;
  setAdvancedEnabledPanels: (enabledPanels: ControlPanelId[]) => void;
  setAdvancedPanel: (id: ControlPanelId, rect: PanelRect) => void;
  setAdvancedButtons: (buttons: ButtonCalibrationItem[]) => void;
  setAdvancedButtonPanel: (id: ButtonCalibrationItem["id"], rect: PanelRect) => void;
  acceptAdvancedCalibration: (grid: AdvancedSnapGrid) => boolean;
  setCombinedScreenshot: (screenshot: PickedImage, suggestedOuter: PanelRect) => void;
  setCombinedOuterRect: (rect: PanelRect) => void;
  confirmCombinedOuterRect: () => void;
  setCombinedEnabledControls: (ids: ControlPanelId[]) => void;
  setCombinedButtons: (buttons: ButtonCalibrationItem[]) => void;
  setCombinedPanel: (id: ControlPanelId | ButtonCalibrationItem["id"], rect: PanelRect) => void;
  acceptCombinedCalibration: (grid: AdvancedSnapGrid) => boolean;
  startImageProcessing: () => void;
  finishImageProcessing: (image: PickedImage) => void;
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
      : false;
    set(getModeState(mode, state.defaultCalibration, state.advancedCalibration, state.advancedButtonsCalibration, state.advancedCombinedCalibration, null));
    return hasCalibration;
  },
  selectAdvancedTarget: (target) => {
    const state = get();
    const hasCalibration = target === "controls"
      ? Boolean(state.advancedCalibration)
      : target === "buttons"
        ? Boolean(state.advancedButtonsCalibration)
        : Boolean(state.advancedCombinedCalibration);
    set(getModeState("advanced", state.defaultCalibration, state.advancedCalibration, state.advancedButtonsCalibration, state.advancedCombinedCalibration, target));
    return hasCalibration;
  },
  goToCalibration: () => set(getDefaultCalibrationState(get().defaultCalibration)),
  goToAdvancedCalibration: () => {
    const state = get();
    set(state.selectedAdvancedTarget === "buttons"
      ? getAdvancedButtonsCalibrationState(state.advancedButtonsCalibration)
      : state.selectedAdvancedTarget === "combined"
        ? getAdvancedCombinedCalibrationState(state.advancedCombinedCalibration)
        : getAdvancedCalibrationState(state.advancedCalibration, "controls"));
  },
  setError: (error) => set({ error }),
  setScreenshot: (screenshot, rect) => set({ screenshot, calibrationRect: rect, error: null }),
  setCalibrationRect: (rect) => set({ calibrationRect: rect, error: null }),
  acceptCalibration: () => {
    const result = getAcceptCalibrationResult(get().calibrationRect);
    if (!result.didAccept || !result.defaultCalibration) {
      set(result.state);
      return false;
    }
    const state = get();
    saveCalibrations({
      default: result.defaultCalibration,
      advancedControls: state.advancedCalibration,
      advancedButtons: state.advancedButtonsCalibration,
      advancedCombined: state.advancedCombinedCalibration,
    });
    set(result.state);
    return true;
  },
  setAdvancedScreenshot: (screenshot, suggestedOuter) => set((state) => state.selectedAdvancedTarget === "buttons"
    ? {
        advancedButtonsDraft: createAdvancedButtonsDraft(screenshot, suggestedOuter, state.advancedButtonsCalibration),
        error: null,
      }
    : {
        advancedDraft: createAdvancedDraft(screenshot, suggestedOuter, state.advancedCalibration),
        error: null,
      }),
  setAdvancedOuterRect: (outerRect) => set((state) => {
    if (state.selectedAdvancedTarget === "buttons") {
      const draft = state.advancedButtonsDraft;
      return {
        advancedButtonsDraft: draft ? {
          ...draft,
          outerRect,
          buttons: draft.outerRect
            ? scaleButtonRects(draft, draft.outerRect, outerRect)
            : draft.buttons,
        } : null,
        error: null,
      };
    }
    const draft = state.advancedDraft;
    return {
      advancedDraft: draft ? {
        ...draft,
        outerRect,
        panels: draft.outerRect && draft.panels
          ? scaleControlPanelsToOuter(draft.panels, draft.outerRect, outerRect)
          : draft.panels,
      } : null,
      error: null,
    };
  }),
  confirmAdvancedOuterRect: () => set((state) => {
    if (state.selectedAdvancedTarget === "buttons") {
      const draft = state.advancedButtonsDraft;
      return draft?.outerRect
        ? { error: null }
        : { error: translate("errors.confirmOuterFirst") };
    }
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
  setAdvancedPanel: (id, rect) => set((state) => ({
    advancedDraft: state.advancedDraft?.panels
      ? {
          ...state.advancedDraft,
          panels: { ...state.advancedDraft.panels, [id]: rect },
        }
      : state.advancedDraft,
    error: null,
  })),
  setAdvancedButtons: (buttons) => set((state) => ({
    advancedButtonsDraft: state.advancedButtonsDraft
      ? { ...state.advancedButtonsDraft, buttons }
      : null,
    error: buttons.length > 0 ? null : translate("errors.selectAdvancedButton"),
  })),
  setAdvancedButtonPanel: (id, rect) => set((state) => ({
    advancedButtonsDraft: state.advancedButtonsDraft
      ? {
          ...state.advancedButtonsDraft,
          buttons: state.advancedButtonsDraft.buttons.map((button) =>
            button.id === id ? { ...button, rect } : button,
          ),
        }
      : null,
    error: null,
  })),
  setCombinedScreenshot: (screenshot, suggestedOuter) => set((state) => ({
    advancedCombinedDraft: createAdvancedCombinedDraft(
      screenshot,
      suggestedOuter,
      state.advancedCombinedCalibration,
    ),
    error: null,
  })),
  setCombinedOuterRect: (outerRect) => set((state) => ({
    advancedCombinedDraft: state.advancedCombinedDraft
      ? scaleCombinedDraftToOuter(state.advancedCombinedDraft, outerRect)
      : null,
    error: null,
  })),
  confirmCombinedOuterRect: () => set((state) => {
    const draft = state.advancedCombinedDraft;
    if (!draft?.outerRect) {
      return { error: translate("errors.confirmOuterFirst") };
    }
    return {
      advancedCombinedDraft: initializeCombinedControlPanels(draft),
      error: null,
    };
  }),
  setCombinedEnabledControls: (ids) => set((state) => ({
    advancedCombinedDraft: state.advancedCombinedDraft
      ? { ...state.advancedCombinedDraft, enabledControls: ids }
      : null,
    error: ids.length > 0 ? null : translate("errors.selectCombinedControl"),
  })),
  setCombinedButtons: (buttons) => set((state) => ({
    advancedCombinedDraft: state.advancedCombinedDraft
      ? { ...state.advancedCombinedDraft, buttons }
      : null,
    error: buttons.length > 0 ? null : translate("errors.selectCombinedButton"),
  })),
  setCombinedPanel: (id, rect) => set((state) => {
    const draft = state.advancedCombinedDraft;
    if (!draft) {
      return state;
    }
    if (draft.enabledControls.includes(id as ControlPanelId) && draft.controlPanels) {
      return {
        advancedCombinedDraft: {
          ...draft,
          controlPanels: { ...draft.controlPanels, [id]: rect },
        },
        error: null,
      };
    }
    if (draft.buttons.some((button) => button.id === id)) {
      return {
        advancedCombinedDraft: {
          ...draft,
          buttons: draft.buttons.map((button) =>
            button.id === id ? { ...button, rect } : button,
          ),
        },
        error: null,
      };
    }
    return state;
  }),
  acceptAdvancedCalibration: (grid) => {
    const state = get();
    if (state.selectedAdvancedTarget === "buttons") {
      const calibration = getButtonsCalibrationFromDraft(
        state.advancedButtonsDraft,
        grid,
      );
      if (!calibration) {
        set({ error: translate("errors.invalidAdvancedPanels") });
        return false;
      }
      saveCalibrations({
        default: state.defaultCalibration,
        advancedControls: state.advancedCalibration,
        advancedButtons: calibration,
        advancedCombined: state.advancedCombinedCalibration,
      });
      set(getAcceptAdvancedButtonsCalibrationResult(calibration));
      return true;
    }
    const calibration = getCalibrationFromDraft(
      state.advancedDraft,
      grid,
    );
    if (!calibration) {
      set({ error: translate("errors.invalidAdvancedPanels") });
      return false;
    }
    saveCalibrations({
      default: state.defaultCalibration,
      advancedControls: calibration,
      advancedButtons: state.advancedButtonsCalibration,
      advancedCombined: state.advancedCombinedCalibration,
    });
    set(getAcceptAdvancedCalibrationResult(calibration));
    return true;
  },
  acceptCombinedCalibration: (grid) => {
    const state = get();
    const draft = state.advancedCombinedDraft;
    if (!draft || draft.enabledControls.length === 0) {
      set({ error: translate("errors.selectCombinedControl") });
      return false;
    }
    if (draft.buttons.length === 0) {
      set({ error: translate("errors.selectCombinedButton") });
      return false;
    }
    const calibration = getCombinedCalibrationFromDraft(draft, grid);
    if (!calibration) {
      set({ error: translate("errors.invalidCombinedPanels") });
      return false;
    }
    saveCalibrations({
      default: state.defaultCalibration,
      advancedControls: state.advancedCalibration,
      advancedButtons: state.advancedButtonsCalibration,
      advancedCombined: calibration,
    });
    set(getAcceptAdvancedCombinedCalibrationResult(calibration));
    return true;
  },
  startImageProcessing: () => set(getStartImageProcessingState()),
  finishImageProcessing: (image) =>
    set(getFinishImageProcessingState(image, get().activePreset)),
  failImageProcessing: (message, errorKey) =>
    set(getFailImageProcessingState(message, errorKey)),
  setImage: (image) => set(getImageState(image, get().activePreset)),
  setTransform: (transform) => set(getTransformState(transform, get().image, get().activePreset)),
  resetFit: () => {
    const nextState = getResetFitState(get().image, get().activePreset);
    if (nextState) set(nextState);
  },
  startExport: () => set(getStartExportState()),
  finishExport: (exports) => {
    const { selectedAdvancedTarget, selectedMode } = get();
    if (exports.length > 0 && selectedMode) {
      saveLastExportedMode(selectedMode);
      if (selectedMode === "advanced" && selectedAdvancedTarget) {
        saveLastExportedAdvancedTarget(selectedAdvancedTarget);
      }
    }
    set({
      ...getFinishExportState(exports),
      lastExportedAdvancedTarget:
        exports.length > 0 && selectedMode === "advanced"
          ? selectedAdvancedTarget
          : get().lastExportedAdvancedTarget,
      lastExportedMode: exports.length > 0 ? selectedMode : get().lastExportedMode,
    });
  },
  failExport: (message) => set(getFailExportState(message)),
}));

function scaleButtonRects(
  draft: AdvancedButtonsDraft,
  sourceOuter: PanelRect,
  targetOuter: PanelRect,
): ButtonCalibrationItem[] {
  const scaled = scalePanelsToOuter(
    Object.fromEntries(draft.buttons.map((button) => [button.id, button.rect])),
    sourceOuter,
    targetOuter,
  );
  return draft.buttons.map((button) => ({ ...button, rect: scaled[button.id] ?? button.rect }));
}
