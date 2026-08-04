import {
  getAcceptAdvancedCombinedCalibrationResult,
  getAdvancedCombinedCalibrationState,
  getAcceptCalibrationResult,
  getFailExportState,
  getFinishExportState,
  getStartCustomizingResult,
  getStartExportState,
} from "@/features/quick-panel/store/quick-panel-transitions";
import type { AdvancedCombinedCalibration } from "@/features/quick-panel/model/types";

const combinedCalibration: AdvancedCombinedCalibration = {
  screenshotWidth: 200,
  screenshotHeight: 400,
  grid: { columns: 4, rows: 6 },
  outerRect: { x: 0, y: 0, width: 200, height: 400, radius: 0 },
  enabledControls: ["buttonBox"],
  controlPanels: {
    buttonBox: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
    brightness: { x: 0, y: 50, width: 40, height: 40, radius: 0 },
    volume: { x: 0, y: 100, width: 40, height: 40, radius: 0 },
    mediaPlayer: { x: 0, y: 150, width: 40, height: 40, radius: 0 },
  },
  buttons: [{
    id: "button-1",
    label: "Wi-Fi",
    customIconId: null,
    rect: { x: 50, y: 0, width: 40, height: 40, radius: 0 },
  }],
};

describe("quick-panel transitions", () => {
  it("requires calibration before customizing", () => {
    const result = getStartCustomizingResult(false);

    expect(result.didStart).toBe(false);
    expect(result.state).toMatchObject({
      error: "Calibrate your Quick Panel area before customizing.",
      step: "calibration",
    });
  });

  it("requires an imported screenshot before accepting calibration", () => {
    const result = getAcceptCalibrationResult(null);

    expect(result.didAccept).toBe(false);
    expect(result.state).toMatchObject({
      error: "Import a Quick Panel screenshot first.",
    });
  });

  it("tracks export lifecycle state changes", () => {
    expect(getStartExportState()).toEqual({
      error: null,
      exports: [],
      isExporting: true,
    });

    expect(
      getFinishExportState([
        {
          fileName: "01-button-box.png",
          id: "buttonBox",
          label: "Button box",
          previewUri: "file:///preview.png",
          uri: "file:///export.png",
        },
      ]),
    ).toEqual({
      exports: [
        {
          fileName: "01-button-box.png",
          id: "buttonBox",
          label: "Button box",
          previewUri: "file:///preview.png",
          uri: "file:///export.png",
        },
      ],
      isExporting: false,
      step: "exported",
    });

    expect(getFailExportState("Unable to export images.")).toEqual({
      error: "Unable to export images.",
      isExporting: false,
    });
  });

  it("selects the combined calibration target and preserves its saved geometry", () => {
    expect(getAdvancedCombinedCalibrationState(combinedCalibration)).toMatchObject({
      selectedMode: "advanced",
      selectedAdvancedTarget: "combined",
      step: "advancedCalibration",
      advancedCombinedDraft: {
        screenshot: null,
        outerRect: combinedCalibration.outerRect,
        enabledControls: combinedCalibration.enabledControls,
        controlPanels: combinedCalibration.controlPanels,
        buttons: combinedCalibration.buttons,
      },
    });
  });

  it("accepts a combined calibration into the image-selection flow", () => {
    expect(getAcceptAdvancedCombinedCalibrationResult(combinedCalibration)).toMatchObject({
      activePreset: { id: "one-ui-8-5-combined" },
      advancedCombinedCalibration: combinedCalibration,
      advancedCombinedDraft: null,
      step: "imageSelection",
    });
  });
});
