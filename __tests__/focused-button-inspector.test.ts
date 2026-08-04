import {
  getCycledButtonIndex,
  getInspectableButtonPanels,
} from "@/features/quick-panel/customize/focused-button-inspector";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const preset = {
  id: "mixed",
  label: "Mixed",
  mode: "advanced",
  width: 300,
  height: 600,
  customizationArea: { x: 0, y: 0, width: 300, height: 600, radius: 0 },
  panels: {
    brightness: {
      id: "brightness",
      label: "Brightness",
      fileName: "01-control-brightness.png",
      family: "control",
      rect: { x: 0, y: 0, width: 300, height: 80, radius: 40 },
    },
    "button-2": {
      id: "button-2",
      label: "Bluetooth",
      fileName: "02-button-bluetooth.png",
      family: "button",
      rect: { x: 0, y: 100, width: 140, height: 70, radius: 35 },
      buttonIdentifier: {
        columnSpan: 2,
        iconName: "bluetooth",
        referenceCellSize: 70,
        rowSpan: 1,
      },
    },
    "button-1": {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "03-button-wi-fi.png",
      family: "button",
      rect: { x: 160, y: 100, width: 70, height: 70, radius: 35 },
      buttonIdentifier: {
        columnSpan: 1,
        iconName: "wifi",
        referenceCellSize: 70,
        rowSpan: 1,
      },
    },
    "button-3": {
      id: "button-3",
      label: "Broken",
      fileName: "04-button-broken.png",
      family: "button",
      rect: { x: 0, y: 200, width: 70, height: 70, radius: 35 },
    },
  },
  visualOrder: ["brightness", "button-2", "button-1", "button-3"],
  goodLockOrder: ["brightness", "button-2", "button-1", "button-3"],
} satisfies QuickPanelPreset;

describe("focused Button inspector", () => {
  it("keeps only inspectable Buttons in visual order", () => {
    expect(getInspectableButtonPanels(preset).map((panel) => panel.id)).toEqual([
      "button-2",
      "button-1",
    ]);
  });

  it("cycles in both directions and handles an empty list", () => {
    expect(getCycledButtonIndex(0, 2, 1)).toBe(1);
    expect(getCycledButtonIndex(1, 2, 1)).toBe(0);
    expect(getCycledButtonIndex(0, 2, -1)).toBe(1);
    expect(getCycledButtonIndex(5, 0, 1)).toBe(0);
  });
});
