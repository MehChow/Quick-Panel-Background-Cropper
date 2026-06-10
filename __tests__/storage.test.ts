describe("storage", () => {
  const defaultProfile = {
    mode: "default-union",
    rect: {
      height: 456,
      radius: 12,
      width: 123,
      x: 10,
      y: 20,
    },
    version: 1,
  } as const;
  const customProfile = {
    mode: "custom-panels",
    panels: {
      brightness: {
        id: "brightness",
        rect: { height: 48, radius: 20, width: 220, x: 8, y: 92 },
        status: "present",
      },
      buttonBox: {
        id: "buttonBox",
        rect: { height: 60, radius: 20, width: 220, x: 8, y: 20 },
        status: "present",
      },
      mediaPlayer: { id: "mediaPlayer", rect: null, status: "hidden" },
      volume: { id: "volume", rect: null, status: "hidden" },
    },
    version: 1,
  } as const;

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
      savedProfiles: {
        "custom-panels": null,
        "default-union": null,
      },
    });
  });

  it("restores the selected mode from saved per-mode profiles", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set("quick-panel.calibration-mode", "custom-panels");
    mmkvStore.__mmkvStore?.set(
      "quick-panel.calibration-profiles",
      JSON.stringify({
        "custom-panels": customProfile,
        "default-union": defaultProfile,
      }),
    );

    const { loadCalibrationSnapshot } = require("@/features/quick-panel/store/storage");

    expect(loadCalibrationSnapshot()).toEqual({
      isCalibrated: true,
      mode: "custom-panels",
      profile: customProfile,
      rect: null,
      savedProfiles: {
        "custom-panels": customProfile,
        "default-union": defaultProfile,
      },
    });
  });

  it("falls back to legacy calibration when the new saved-profiles payload is unusable", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    mmkvStore.__mmkvStore?.set("quick-panel.calibration-profiles", "{}");
    mmkvStore.__mmkvStore?.set(
      "quick-panel.calibration-profile",
      JSON.stringify(defaultProfile),
    );

    const { loadCalibrationSnapshot } = require("@/features/quick-panel/store/storage");

    expect(loadCalibrationSnapshot()).toEqual({
      isCalibrated: true,
      mode: "default-union",
      profile: defaultProfile,
      rect: defaultProfile.rect,
      savedProfiles: {
        "custom-panels": null,
        "default-union": defaultProfile,
      },
    });
  });

  it("persists one saved profile per mode without overwriting the other slot", () => {
    const mmkvStore = globalThis as typeof globalThis & {
      __mmkvStore?: Map<string, boolean | string>;
    };
    const { loadCalibrationSnapshot, saveCalibrationProfile } = require(
      "@/features/quick-panel/store/storage",
    );

    saveCalibrationProfile(defaultProfile);
    saveCalibrationProfile(customProfile);

    expect(mmkvStore.__mmkvStore?.get("quick-panel.calibration-mode")).toBe(
      "custom-panels",
    );
    expect(
      JSON.parse(
        mmkvStore.__mmkvStore?.get("quick-panel.calibration-profiles") as string,
      ),
    ).toEqual({
      "custom-panels": customProfile,
      "default-union": defaultProfile,
    });
    expect(loadCalibrationSnapshot()).toEqual({
      isCalibrated: true,
      mode: "custom-panels",
      profile: customProfile,
      rect: null,
      savedProfiles: {
        "custom-panels": customProfile,
        "default-union": defaultProfile,
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
    expect(mmkvStore.__mmkvStore?.get("quick-panel.calibration-mode")).toBe(
      "default-union",
    );
    expect(
      JSON.parse(
        mmkvStore.__mmkvStore?.get("quick-panel.calibration-profiles") as string,
      ),
    ).toEqual({
      "custom-panels": null,
      "default-union": {
        mode: "default-union",
        rect: {
          height: 456,
          radius: 12,
          width: 123,
          x: 10,
          y: 20,
        },
        version: 1,
      },
    });
  });
});
