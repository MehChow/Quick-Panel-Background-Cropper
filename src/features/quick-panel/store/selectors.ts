import type { QuickPanelState } from "./quick-panel-store";

export const quickPanelSelectors = {
  landingScreen: (state: QuickPanelState) => ({
    isCalibrated: state.isCalibrated,
    goToCalibration: state.goToCalibration,
    startCustomizing: state.startCustomizing,
  }),
  calibrationScreen: (state: QuickPanelState) => ({
    screenshot: state.screenshot,
    calibrationRect: state.calibrationRect,
    error: state.error,
    setScreenshot: state.setScreenshot,
    setCalibrationRect: state.setCalibrationRect,
    acceptCalibration: state.acceptCalibration,
  }),
  customizeScreen: (state: QuickPanelState) => ({
    activePreset: state.activePreset,
    image: state.image,
    transform: state.transform,
    setTransform: state.setTransform,
    exports: state.exports,
    isExporting: state.isExporting,
    error: state.error,
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
};
