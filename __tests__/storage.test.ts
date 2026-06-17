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

  it("restores advanced calibration grid settings", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set(
      "quick-panel.calibrations-v2",
      JSON.stringify({
        version: 2,
        default: null,
        advanced: {
          screenshotWidth: 1080,
          screenshotHeight: 2340,
          grid: { columns: 6, rows: 7 },
          outerRect: {
            x: 10,
            y: 20,
            width: 300,
            height: 600,
            radius: 12,
          },
          panels: {
            buttonBox: { x: 20, y: 40, width: 100, height: 120, radius: 0 },
            brightness: { x: 20, y: 180, width: 200, height: 80, radius: 0 },
            volume: { x: 240, y: 40, width: 60, height: 220, radius: 0 },
            mediaPlayer: { x: 20, y: 280, width: 280, height: 160, radius: 0 },
          },
        },
      }),
    );

    const { loadCalibrations } = require("@/features/quick-panel/store/storage");

    expect(loadCalibrations().advanced?.grid).toEqual({
      columns: 6,
      rows: 7,
    });
  });

  it("persists advanced calibration grid settings", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    const { saveCalibrations } = require("@/features/quick-panel/store/storage");

    saveCalibrations({
      version: 2,
      default: null,
      advanced: {
        screenshotWidth: 1080,
        screenshotHeight: 2340,
        grid: { columns: 5, rows: 6 },
        outerRect: {
          x: 10,
          y: 20,
          width: 300,
          height: 600,
          radius: 12,
        },
        panels: {
          buttonBox: { x: 20, y: 40, width: 100, height: 120, radius: 0 },
          brightness: { x: 20, y: 180, width: 200, height: 80, radius: 0 },
          volume: { x: 240, y: 40, width: 60, height: 220, radius: 0 },
          mediaPlayer: { x: 20, y: 280, width: 280, height: 160, radius: 0 },
        },
      },
    });

    expect(mmkvStore.__mmkvStore?.get("quick-panel.calibrations-v2")).toBe(
      JSON.stringify({
        version: 2,
        default: null,
        advanced: {
          screenshotWidth: 1080,
          screenshotHeight: 2340,
          grid: { columns: 5, rows: 6 },
          outerRect: {
            x: 10,
            y: 20,
            width: 300,
            height: 600,
            radius: 12,
          },
          panels: {
            buttonBox: { x: 20, y: 40, width: 100, height: 120, radius: 0 },
            brightness: { x: 20, y: 180, width: 200, height: 80, radius: 0 },
            volume: { x: 240, y: 40, width: 60, height: 220, radius: 0 },
            mediaPlayer: { x: 20, y: 280, width: 280, height: 160, radius: 0 },
          },
        },
      }),
    );
  });
});
