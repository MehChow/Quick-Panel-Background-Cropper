import {
  hasSeenHelp,
  loadCalibrations,
  loadLastExportedAdvancedTarget,
  loadLastExportedMode,
  saveCalibrations,
  type SavedCalibrations,
} from "@/features/quick-panel/store/storage";

interface MmkvTestGlobal {
  __mmkvStore?: Map<string, boolean | string>;
}

const rect = {
  height: 600,
  radius: 12,
  width: 300,
  x: 10,
  y: 20,
};

const currentCalibrations = {
  default: { rect },
  advancedControls: {
    screenshotWidth: 1080,
    screenshotHeight: 2340,
    grid: { columns: 5, rows: 6 },
    outerRect: rect,
    panels: {
      buttonBox: { x: 20, y: 40, width: 100, height: 120, radius: 0 },
      brightness: { x: 20, y: 180, width: 200, height: 80, radius: 0 },
      volume: { x: 240, y: 40, width: 60, height: 220, radius: 0 },
      mediaPlayer: { x: 20, y: 280, width: 280, height: 160, radius: 0 },
    },
    enabledPanels: ["buttonBox", "brightness", "volume", "mediaPlayer"],
  },
  advancedButtons: {
    screenshotWidth: 1080,
    screenshotHeight: 2340,
    grid: { columns: 2, rows: 2 },
    outerRect: rect,
    buttons: [
      {
        id: "button-1",
        label: "Wi-Fi",
        rect: { x: 20, y: 40, width: 120, height: 120, radius: 0 },
      },
    ],
  },
} satisfies SavedCalibrations;

describe("storage", () => {
  it("ignores every old calibration format but preserves other preferences", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set("quick-panel.is-calibrated", true);
    mmkvStore?.set("quick-panel.calibration-rect", JSON.stringify(rect));
    mmkvStore?.set(
      "quick-panel.calibrations-v2",
      JSON.stringify({ version: 2, default: { rect }, advanced: null }),
    );
    mmkvStore?.set(
      "quick-panel.calibrations-v3",
      JSON.stringify({
        version: 3,
        ...currentCalibrations,
      }),
    );
    mmkvStore?.set("quick-panel.last-exported-mode", "advanced");
    mmkvStore?.set("quick-panel.last-exported-advanced-target", "buttons");
    mmkvStore?.set(
      "quick-panel.seen-help",
      JSON.stringify({ "calibration-outer": true }),
    );

    expect(loadCalibrations()).toEqual({
      default: null,
      advancedControls: null,
      advancedButtons: null,
    });
    expect(loadLastExportedMode()).toBe("advanced");
    expect(loadLastExportedAdvancedTarget()).toBe("buttons");
    expect(hasSeenHelp("calibration-outer")).toBe(true);
  });

  it("round-trips the current payload without a version discriminator", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    saveCalibrations(currentCalibrations);

    const serialized = mmkvStore?.get("quick-panel.calibrations");
    expect(typeof serialized).toBe("string");
    const parsed = JSON.parse(serialized as string) as Record<string, unknown>;
    expect(parsed).toEqual(currentCalibrations);
    expect(parsed).not.toHaveProperty("version");
    expect(parsed).not.toHaveProperty("schemaVersion");
    expect(parsed).not.toHaveProperty("geometryVersion");
    expect(mmkvStore?.has("quick-panel.calibrations-v3")).toBe(false);

    expect(loadCalibrations()).toEqual(currentCalibrations);
  });

  it("keeps valid branches and rejects invalid branches in the current payload", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set(
      "quick-panel.calibrations",
      JSON.stringify({
        default: { rect },
        advancedControls: {
          screenshotWidth: 1080,
          screenshotHeight: 2340,
          grid: { columns: 5, rows: 6 },
          outerRect: null,
          panels: null,
        },
        advancedButtons: {
          screenshotWidth: 1080,
          screenshotHeight: 2340,
          grid: { columns: 2, rows: 2 },
          outerRect: rect,
          buttons: [],
        },
      }),
    );

    expect(loadCalibrations()).toEqual({
      default: { rect },
      advancedControls: null,
      advancedButtons: null,
    });
  });

  it("returns an empty current payload when its JSON is malformed", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set("quick-panel.calibrations", "{bad json");

    expect(loadCalibrations()).toEqual({
      default: null,
      advancedControls: null,
      advancedButtons: null,
    });
  });
});
