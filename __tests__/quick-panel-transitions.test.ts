import {
  getAcceptCalibrationResult,
  getCalibrationModeState,
  getFailExportState,
  getFinishExportState,
  getStartCustomizingResult,
  getStartExportState,
} from "@/features/quick-panel/store/quick-panel-transitions";
import { getPresetFromCalibrationProfile } from "@/features/quick-panel/model/custom-preset";

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

  it("requires recalibration when the selected mode differs from the saved profile", () => {
    expect(
      getCalibrationModeState("custom-panels", {
        mode: "default-union",
        rect: { x: 12, y: 24, width: 200, height: 300, radius: 0 },
        version: 1,
      }),
    ).toMatchObject({
      calibrationMode: "custom-panels",
      calibrationRect: null,
      isCalibrated: false,
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

  it("builds a filtered preset from present custom panels only", () => {
    const preset = getPresetFromCalibrationProfile({
      mode: "custom-panels",
      panels: {
        brightness: {
          id: "brightness",
          rect: { x: 10, y: 80, width: 200, height: 50, radius: 20 },
          status: "present",
        },
        buttonBox: {
          id: "buttonBox",
          rect: { x: 10, y: 10, width: 200, height: 60, radius: 20 },
          status: "present",
        },
        mediaPlayer: {
          id: "mediaPlayer",
          rect: null,
          status: "hidden",
        },
        volume: {
          id: "volume",
          rect: null,
          status: "hidden",
        },
      },
      version: 1,
    });

    expect(preset.visualOrder).toEqual(["buttonBox", "brightness"]);
    expect(preset.goodLockOrder).toEqual(["buttonBox", "brightness"]);
    expect(preset.label).toBe("Custom Quick Panel layout");
  });
});
