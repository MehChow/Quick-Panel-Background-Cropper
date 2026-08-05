import {
  hasSeenHelp,
  acknowledgeReleaseAnnouncement,
  loadAcknowledgedReleaseAnnouncement,
  loadCalibrations,
  loadLastExportedAdvancedTarget,
  loadLastExportedMode,
  loadLastImageDiskCacheClearAt,
  loadButtonCustomizeSettings,
  loadCombinedButtonImageIntensity,
  saveCalibrations,
  saveCombinedButtonImageIntensity,
  saveLastImageDiskCacheClearAt,
  saveButtonCustomizeSettings,
  type ButtonCustomizeSettings,
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

const advancedControlPanels = {
  buttonBox: { x: 20, y: 40, width: 100, height: 120, radius: 0 },
  brightness: { x: 20, y: 180, width: 200, height: 80, radius: 0 },
  volume: { x: 240, y: 40, width: 60, height: 220, radius: 0 },
  mediaPlayer: { x: 20, y: 280, width: 280, height: 160, radius: 0 },
};

const currentCalibrations = {
  default: { rect },
  advancedControls: {
    screenshotWidth: 1080,
    screenshotHeight: 2340,
    grid: { columns: 5, rows: 6 },
    outerRect: rect,
    panels: advancedControlPanels,
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
        customIconId: null,
        rect: { x: 20, y: 40, width: 120, height: 120, radius: 0 },
      },
      {
        id: "button-2",
        label: "My scene",
        customIconId: "star",
        rect: { x: 150, y: 40, width: 120, height: 120, radius: 0 },
      },
    ],
  },
  advancedCombined: {
    screenshotWidth: 1080,
    screenshotHeight: 2340,
    grid: { columns: 4, rows: 6 },
    outerRect: rect,
    enabledControls: ["buttonBox", "brightness"],
    controlPanels: advancedControlPanels,
    buttons: [
      {
        id: "button-1",
        label: "Wi-Fi",
        customIconId: null,
        rect: { x: 20, y: 460, width: 120, height: 120, radius: 0 },
      },
    ],
  },
} satisfies SavedCalibrations;

describe("storage", () => {
  it.each([undefined, "bad", "-1", "Infinity", "NaN"])(
    "returns null for invalid image disk-cache timestamps: %s",
    (value) => {
      const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
        .__mmkvStore;
      if (value === undefined) {
        mmkvStore?.delete("quick-panel.last-image-disk-cache-clear-at");
      } else {
        mmkvStore?.set("quick-panel.last-image-disk-cache-clear-at", value);
      }

      expect(loadLastImageDiskCacheClearAt()).toBeNull();
    },
  );

  it("round-trips the independent image disk-cache timestamp", () => {
    saveLastImageDiskCacheClearAt(123456789);

    expect(loadLastImageDiskCacheClearAt()).toBe(123456789);
    expect(loadCalibrations()).toEqual({
      default: null,
      advancedControls: null,
      advancedButtons: null,
      advancedCombined: null,
    });
  });

  it("stores the acknowledged release announcement independently", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.delete("quick-panel.acknowledged-release-announcement");

    expect(loadAcknowledgedReleaseAnnouncement()).toBeNull();

    acknowledgeReleaseAnnouncement("v1.3.1-cache-optimization-announcement");

    expect(loadAcknowledgedReleaseAnnouncement()).toBe(
      "v1.3.1-cache-optimization-announcement",
    );
    expect(loadCalibrations()).toEqual({
      default: null,
      advancedControls: null,
      advancedButtons: null,
      advancedCombined: null,
    });
  });

  it("round-trips Buttons-only customization settings", () => {
    const settings: ButtonCustomizeSettings = {
      buttonIdentifierBackgroundTheme: "light",
      buttonIdentifierColor: "#1A2B3C",
      buttonIdentifierOpacity: 61,
      buttonPanelOpacity: 84,
      horizontalIdentifierPosition: 23,
      showButtonIdentifiers: false,
      verticalIdentifierPosition: 77,
    };

    saveButtonCustomizeSettings(settings);

    expect(loadButtonCustomizeSettings()).toEqual(settings);
  });

  it.each([
    [
      {
        buttonIdentifierBackgroundTheme: "light",
        buttonIdentifierColor: "#1a2b3c",
        buttonPanelOpacity: 84,
      },
      "#1A2B3C",
      "light",
      84,
    ],
    [
      {
        buttonIdentifierBackgroundTheme: "auto",
        buttonIdentifierColor: "bad",
        buttonPanelOpacity: 84,
      },
      "#FFFFFF",
      "dark",
      84,
    ],
    [
      {
        buttonIdentifierTheme: "light",
        buttonPanelOpacity: 84,
      },
      "#FFFFFF",
      "dark",
      84,
    ],
  ])("normalizes replacement appearance without migrating legacy theme", (
    saved,
    color,
    backgroundTheme,
    opacity,
  ) => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal).__mmkvStore;
    mmkvStore?.set("quick-panel.button-customize-settings", JSON.stringify(saved));
    expect(loadButtonCustomizeSettings()).toMatchObject({
      buttonIdentifierBackgroundTheme: backgroundTheme,
      buttonIdentifierColor: color,
      buttonPanelOpacity: opacity,
    });
  });

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
      advancedCombined: null,
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

  it("ignores retired snapping preferences without losing calibration data", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set(
      "quick-panel.calibrations",
      JSON.stringify({
        ...currentCalibrations,
        advancedControls: {
          ...currentCalibrations.advancedControls,
          isGridEnabled: false,
        },
        advancedButtons: {
          ...currentCalibrations.advancedButtons,
          isGridEnabled: true,
        },
      }),
    );

    const loaded = loadCalibrations();
    expect(loaded).toEqual(currentCalibrations);
    expect(loaded.advancedControls).not.toHaveProperty("isGridEnabled");
    expect(loaded.advancedButtons).not.toHaveProperty("isGridEnabled");

    saveCalibrations(loaded);
    const serialized = JSON.parse(
      mmkvStore?.get("quick-panel.calibrations") as string,
    ) as Record<string, Record<string, unknown>>;
    expect(serialized.advancedControls).not.toHaveProperty("isGridEnabled");
    expect(serialized.advancedButtons).not.toHaveProperty("isGridEnabled");
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
      advancedCombined: null,
    });
  });

  it("rejects a Buttons branch when custom icon metadata is missing", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set(
      "quick-panel.calibrations",
      JSON.stringify({
        default: { rect },
        advancedControls: currentCalibrations.advancedControls,
        advancedButtons: {
          ...currentCalibrations.advancedButtons,
          buttons: [
            {
              id: "button-1",
              label: "My scene",
              rect: { x: 20, y: 40, width: 120, height: 120, radius: 0 },
            },
          ],
        },
      }),
    );

    expect(loadCalibrations()).toEqual({
      default: { rect },
      advancedControls: currentCalibrations.advancedControls,
      advancedButtons: null,
      advancedCombined: null,
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
      advancedCombined: null,
    });
  });

  it("loads v1.2.0 calibrations with a null combined branch", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    const { advancedCombined: _advancedCombined, ...v12Calibrations } = currentCalibrations;
    mmkvStore?.set("quick-panel.calibrations", JSON.stringify(v12Calibrations));
    mmkvStore?.set("quick-panel.last-exported-advanced-target", "combined");

    expect(loadCalibrations()).toMatchObject({
      default: expect.anything(),
      advancedControls: expect.anything(),
      advancedButtons: expect.anything(),
      advancedCombined: null,
    });
    expect(loadLastExportedAdvancedTarget()).toBe("combined");
  });

  it.each([64, -1, 101, Number.NaN, "not-a-number"]) (
    "normalizes combined Button image intensity %p",
    (value) => {
      const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
        .__mmkvStore;
      mmkvStore?.set(
        "quick-panel.combined-button-image-intensity",
        String(value),
      );

      expect(loadCombinedButtonImageIntensity()).toBe(value === 64 ? 64 : 78);
    },
  );

  it("round-trips combined Button image intensity", () => {
    saveCombinedButtonImageIntensity(64);
    expect(loadCombinedButtonImageIntensity()).toBe(64);
  });

  it("rejects only an invalid combined branch", () => {
    const mmkvStore = (globalThis as typeof globalThis & MmkvTestGlobal)
      .__mmkvStore;
    mmkvStore?.set(
      "quick-panel.calibrations",
      JSON.stringify({
        ...currentCalibrations,
        advancedCombined: {
          ...currentCalibrations.advancedCombined,
          enabledControls: [],
        },
      }),
    );

    expect(loadCalibrations()).toEqual({
      default: currentCalibrations.default,
      advancedControls: currentCalibrations.advancedControls,
      advancedButtons: currentCalibrations.advancedButtons,
      advancedCombined: null,
    });
  });
});
