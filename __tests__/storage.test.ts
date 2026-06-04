describe("storage", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("falls back when the saved calibration payload is invalid", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set("quick-panel.is-calibrated", true);
    mmkvStore.__mmkvStore?.set("quick-panel.calibration-rect", "{bad json");

    const { loadCalibration } = require("@/features/quick-panel/store/storage");

    expect(loadCalibration()).toEqual({
      isCalibrated: false,
      rect: null,
    });
  });

  it("restores a valid saved calibration", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set("quick-panel.is-calibrated", true);
    mmkvStore.__mmkvStore?.set(
      "quick-panel.calibration-rect",
      JSON.stringify({
        height: 456,
        radius: 12,
        width: 123,
        x: 10,
        y: 20,
      }),
    );

    const { loadCalibration } = require("@/features/quick-panel/store/storage");

    expect(loadCalibration()).toEqual({
      isCalibrated: true,
      rect: {
        height: 456,
        radius: 12,
        width: 123,
        x: 10,
        y: 20,
      },
    });
  });

  it("persists calibration geometry", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    const { saveCalibration } = require("@/features/quick-panel/store/storage");

    saveCalibration({
      height: 456,
      radius: 12,
      width: 123,
      x: 10,
      y: 20,
    });

    expect(mmkvStore.__mmkvStore?.get("quick-panel.is-calibrated")).toBe(true);
    expect(mmkvStore.__mmkvStore?.get("quick-panel.calibration-rect")).toBe(
      JSON.stringify({
        height: 456,
        radius: 12,
        width: 123,
        x: 10,
        y: 20,
      }),
    );
  });
});
