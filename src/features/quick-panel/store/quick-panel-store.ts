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
  ControlPanelRects,
  CustomizationMode,
  GeneratedExport,
  ImageTransform,
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
  getAcceptAdvancedButtonsCalibrationResult,
  getAcceptCalibrationResult,
  getAdvancedButtonsCalibrationState,
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
  saveCalibration,
  saveCalibrations,
  saveLastExportedAdvancedTarget,
  saveLastExportedMode,
} from "./storage";
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
  setAdvancedPanels: (panels: ControlPanelRects) => void;
  setAdvancedButtons: (buttons: ButtonCalibrationItem[]) => void;
  setAdvancedButtonPanels: (panels: PanelRects) => void;
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
      : false;
    set(getModeState(mode, state.defaultCalibration, state.advancedCalibration, state.advancedButtonsCalibration, null));
    return hasCalibration;
  },
  selectAdvancedTarget: (target) => {
    const state = get();
    const hasCalibration = target === "controls"
      ? Boolean(state.advancedCalibration)
      : Boolean(state.advancedButtonsCalibration);
    set(getModeState("advanced", state.defaultCalibration, state.advancedCalibration, state.advancedButtonsCalibration, target));
    return hasCalibration;
  },
  goToCalibration: () => set(getDefaultCalibrationState(get().defaultCalibration)),
  goToAdvancedCalibration: () => {
    const state = get();
    set(state.selectedAdvancedTarget === "buttons"
      ? getAdvancedButtonsCalibrationState(state.advancedButtonsCalibration)
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
    saveCalibration(result.defaultCalibration.rect);
    saveCalibrations({
      version: 3,
      default: result.defaultCalibration,
      advancedControls: state.advancedCalibration,
      advancedButtons: state.advancedButtonsCalibration,
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
  setAdvancedPanels: (panels) => set((state) => ({
    advancedDraft: state.advancedDraft ? { ...state.advancedDraft, panels } : null,
    error: null,
  })),
  setAdvancedButtons: (buttons) => set((state) => ({
    advancedButtonsDraft: state.advancedButtonsDraft
      ? { ...state.advancedButtonsDraft, buttons }
      : null,
    error: buttons.length > 0 ? null : translate("errors.selectAdvancedPanel"),
  })),
  setAdvancedButtonPanels: (panels) => set((state) => ({
    advancedButtonsDraft: state.advancedButtonsDraft
      ? {
          ...state.advancedButtonsDraft,
          buttons: state.advancedButtonsDraft.buttons.map((button) => ({
            ...button,
            rect: panels[button.id] ?? button.rect,
          })),
        }
      : null,
    error: null,
  })),
  acceptAdvancedCalibration: (grid) => {
    const state = get();
    if (state.selectedAdvancedTarget === "buttons") {
      const calibration = getButtonsCalibrationFromDraft(state.advancedButtonsDraft, grid);
      if (!calibration) {
        set({ error: translate("errors.invalidAdvancedPanels") });
        return false;
      }
      saveCalibrations({
        version: 3,
        default: state.defaultCalibration,
        advancedControls: state.advancedCalibration,
        advancedButtons: calibration,
      });
      set(getAcceptAdvancedButtonsCalibrationResult(calibration));
      return true;
    }
    const calibration = getCalibrationFromDraft(state.advancedDraft, grid);
    if (!calibration) {
      set({ error: translate("errors.invalidAdvancedPanels") });
      return false;
    }
    saveCalibrations({
      version: 3,
      default: state.defaultCalibration,
      advancedControls: calibration,
      advancedButtons: state.advancedButtonsCalibration,
    });
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
