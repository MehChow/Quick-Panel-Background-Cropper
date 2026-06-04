import {
  getAcceptCalibrationResult,
  getFailExportState,
  getFinishExportState,
  getStartCustomizingResult,
  getStartExportState,
} from "@/features/quick-panel/store/quick-panel-transitions";

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
});
