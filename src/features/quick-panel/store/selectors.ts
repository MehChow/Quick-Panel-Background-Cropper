import type { QuickPanelState } from "./quick-panel-store";

export const quickPanelSelectors = {
  landingScreen: (state: QuickPanelState) => ({
    goToModeSelection: state.goToModeSelection,
  }),
  modeSelectionScreen: (state: QuickPanelState) => ({
    selectMode: state.selectMode,
  }),
  calibrationScreen: (state: QuickPanelState) => ({
    screenshot: state.screenshot,
    calibrationRect: state.calibrationRect,
    error: state.error,
    setScreenshot: state.setScreenshot,
    setCalibrationRect: state.setCalibrationRect,
    acceptCalibration: state.acceptCalibration,
  }),
  advancedCalibrationScreen: (state: QuickPanelState) => ({
    advancedDraft: state.advancedDraft,
    error: state.error,
    setAdvancedScreenshot: state.setAdvancedScreenshot,
    setAdvancedOuterRect: state.setAdvancedOuterRect,
    confirmAdvancedOuterRect: state.confirmAdvancedOuterRect,
    setAdvancedPanels: state.setAdvancedPanels,
    acceptAdvancedCalibration: state.acceptAdvancedCalibration,
  }),
  customizeScreen: (state: QuickPanelState) => ({
    selectedMode: state.selectedMode,
    activePreset: state.activePreset,
    image: state.image,
    transform: state.transform,
    setTransform: state.setTransform,
    exports: state.exports,
    isExporting: state.isExporting,
    error: state.error,
    goToCalibration: state.goToCalibration,
    goToAdvancedCalibration: state.goToAdvancedCalibration,
  }),
  customizeActions: (state: QuickPanelState) => ({
    activePreset: state.activePreset,
    image: state.image,
    setImage: state.setImage,
    resetFit: state.resetFit,
    startExport: state.startExport,
    finishExport: state.finishExport,
    failExport: state.failExport,
  }),
  resultScreen: (state: QuickPanelState) => ({
    exports: state.exports,
    goToLanding: state.goToLanding,
  }),
};
