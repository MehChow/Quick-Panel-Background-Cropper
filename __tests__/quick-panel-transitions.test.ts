import {
  getAcceptCalibrationResult,
  getAcceptedCalibrationState,
  getCalibrationModeState,
  getFailExportState,
  getFinishExportState,
  getStartCustomizingResult,
  getStartExportState,
} from "@/features/quick-panel/store/quick-panel-transitions";
import { canSaveCustomCalibration } from "@/features/quick-panel/calibration/hooks/useCustomCalibrationFlow";
import { getPresetFromCalibrationProfile } from "@/features/quick-panel/model/custom-preset";
import { customLayoutPresetId } from "@/features/quick-panel/model/quickstar-crop";

const emptySavedProfiles = {
  "custom-panels": null,
  "default-union": null,
} as const;
const defaultProfile = {
  mode: "default-union",
  rect: { x: 12, y: 24, width: 200, height: 300, radius: 0 },
  version: 1,
} as const;
const customProfile = {
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
} as const;

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
    const result = getAcceptCalibrationResult(null, emptySavedProfiles);

    expect(result.didAccept).toBe(false);
    expect(result.state).toMatchObject({
      error: "Import a Quick Panel screenshot first.",
    });
  });

  it("requires recalibration when the selected mode differs from the saved profile", () => {
    expect(
      getCalibrationModeState("custom-panels", {
        "custom-panels": null,
        "default-union": defaultProfile,
      }),
    ).toMatchObject({
      calibrationMode: "custom-panels",
      calibrationRect: null,
      isCalibrated: false,
    });
  });

  it("restores the selected custom mode from its saved slot", () => {
    const result = getCalibrationModeState("custom-panels", {
      "custom-panels": customProfile,
      "default-union": defaultProfile,
    });

    expect(result).toMatchObject({
      calibrationMode: "custom-panels",
      calibrationProfile: customProfile,
      calibrationRect: null,
      isCalibrated: true,
      presetId: customLayoutPresetId,
    });
    expect(result.customCalibrationDraft).toEqual(customProfile);
  });

  it("stores accepted calibration in only the active mode slot", () => {
    expect(
      getAcceptedCalibrationState(
        {
          "custom-panels": customProfile,
          "default-union": null,
        },
        defaultProfile,
      ),
    ).toMatchObject({
      calibrationMode: "default-union",
      calibrationProfile: defaultProfile,
      isCalibrated: true,
      savedCalibrationProfiles: {
        "custom-panels": customProfile,
        "default-union": defaultProfile,
      },
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
    const preset = getPresetFromCalibrationProfile(customProfile);

    expect(preset.visualOrder).toEqual(["buttonBox", "brightness"]);
    expect(preset.goodLockOrder).toEqual(["buttonBox", "brightness"]);
    expect(preset.label).toBe("Custom Quick Panel layout");
  });

  it("rejects custom calibration when every panel is hidden", () => {
    expect(
      canSaveCustomCalibration({
        mode: "custom-panels",
        panels: {
          brightness: { id: "brightness", rect: null, status: "hidden" },
          buttonBox: { id: "buttonBox", rect: null, status: "hidden" },
          mediaPlayer: { id: "mediaPlayer", rect: null, status: "hidden" },
          volume: { id: "volume", rect: null, status: "hidden" },
        },
        version: 1,
      }),
    ).toBe(false);
  });
});
