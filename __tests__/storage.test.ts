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

  it("migrates a legacy saved rect into a default-union calibration profile", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set("quick-panel.is-calibrated", true);
    mmkvStore.__mmkvStore?.set(
      "quick-panel.calibration-rect",
      JSON.stringify({
        height: 300,
        radius: 0,
        width: 200,
        x: 12,
        y: 34,
      }),
    );

    const { loadCalibrationProfile } = require("@/features/quick-panel/store/storage");

    expect(loadCalibrationProfile()).toEqual({
      mode: "default-union",
      rect: {
        height: 300,
        radius: 0,
        width: 200,
        x: 12,
        y: 34,
      },
      version: 1,
    });
  });

  it("ignores an invalid custom calibration profile with no visible panels", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set(
      "quick-panel.calibration-profile",
      JSON.stringify({
        mode: "custom-panels",
        panels: {
          brightness: { id: "brightness", rect: null, status: "hidden" },
          buttonBox: { id: "buttonBox", rect: null, status: "hidden" },
          mediaPlayer: { id: "mediaPlayer", rect: null, status: "hidden" },
          volume: { id: "volume", rect: null, status: "hidden" },
        },
        version: 1,
      }),
    );

    const { loadCalibrationSnapshot } = require("@/features/quick-panel/store/storage");

    expect(loadCalibrationSnapshot()).toEqual({
      isCalibrated: false,
      mode: "default-union",
      profile: null,
      rect: null,
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
    expect(mmkvStore.__mmkvStore?.get("quick-panel.calibration-profile")).toBe(
      JSON.stringify({
        mode: "default-union",
        rect: {
          height: 456,
          radius: 12,
          width: 123,
          x: 10,
          y: 20,
        },
        version: 1,
      }),
    );
  });
});
