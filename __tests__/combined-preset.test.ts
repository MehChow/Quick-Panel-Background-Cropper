import { createCombinedPreset } from "@/features/quick-panel/calibration/advanced/combined/combined-preset";
import type { AdvancedCombinedCalibration } from "@/features/quick-panel/model/types";

const outerRect = { x: 10, y: 20, width: 400, height: 600, radius: 0 };

const calibration: AdvancedCombinedCalibration = {
  screenshotWidth: 1080,
  screenshotHeight: 2340,
  grid: { columns: 4, rows: 6 },
  outerRect,
  enabledControls: ["buttonBox", "brightness", "volume", "mediaPlayer"],
  controlPanels: {
    buttonBox: { x: 10, y: 20, width: 400, height: 80, radius: 0 },
    brightness: { x: 10, y: 120, width: 400, height: 50, radius: 0 },
    volume: { x: 10, y: 180, width: 400, height: 50, radius: 0 },
    mediaPlayer: { x: 10, y: 240, width: 400, height: 100, radius: 0 },
  },
  buttons: [
    {
      id: "button-1",
      label: "Wi-Fi",
      customIconId: null,
      rect: { x: 10, y: 350, width: 100, height: 100, radius: 0 },
    },
    {
      id: "button-2",
      label: "My scene",
      customIconId: "star",
      rect: { x: 120, y: 350, width: 100, height: 100, radius: 0 },
    },
  ],
};

describe("combined preset", () => {
  it("merges enabled Controls and selected Buttons into shared geometry and order", () => {
    const preset = createCombinedPreset(calibration);

    expect(preset.visualOrder).toEqual([
      "buttonBox",
      "brightness",
      "volume",
      "mediaPlayer",
      "button-1",
      "button-2",
    ]);
    expect(preset.goodLockOrder).toEqual([
      "buttonBox",
      "mediaPlayer",
      "brightness",
      "volume",
      "button-1",
      "button-2",
    ]);
    expect(preset.panels.buttonBox.family).toBe("control");
    expect(preset.panels["button-1"].family).toBe("button");
    expect(preset.panels["button-1"].buttonIdentifier?.referenceCellSize)
      .toBe(Math.min(outerRect.width / 4, outerRect.height / 6));
    expect(Object.keys(preset.panels)).toEqual([
      "buttonBox",
      "brightness",
      "volume",
      "mediaPlayer",
      "button-1",
      "button-2",
    ]);
    expect(preset.width).toBe(calibration.screenshotWidth);
    expect(preset.height).toBe(calibration.screenshotHeight);
    expect(preset.customizationArea).toEqual(outerRect);
  });

  it("omits disabled Controls while keeping Good Lock order contiguous", () => {
    const preset = createCombinedPreset({
      ...calibration,
      enabledControls: ["buttonBox", "brightness"],
    });

    expect(preset.visualOrder).toEqual(["buttonBox", "brightness", "button-1", "button-2"]);
    expect(preset.goodLockOrder).toEqual(["buttonBox", "brightness", "button-1", "button-2"]);
    expect(Object.keys(preset.panels)).toEqual([
      "buttonBox",
      "brightness",
      "button-1",
      "button-2",
    ]);
    expect(preset.panels.buttonBox.fileName).toBe("01-control-button-box.png");
    expect(preset.panels.brightness.fileName).toBe("02-control-brightness.png");
    expect(preset.panels["button-1"].fileName).toBe("03-button-wi-fi.png");
  });
});
