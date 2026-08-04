import {
  getCombinedActivePanelError,
  getCombinedPanelOrder,
  getCombinedPhaseOrder,
  getNextCombinedPhase,
  getPreviousCombinedPhase,
  getVisibleCombinedPanelIds,
} from "@/features/quick-panel/calibration/advanced/combined/combined-steps";
import type { PanelRects } from "@/features/quick-panel/model/types";

const buttons = [
  { id: "button-1" as const, label: "Wi-Fi", customIconId: null, rect: { x: 0, y: 100, width: 40, height: 40, radius: 0 } },
  { id: "button-2" as const, label: "Bluetooth", customIconId: null, rect: { x: 50, y: 100, width: 40, height: 40, radius: 0 } },
];

const panelOrder = getCombinedPanelOrder(["buttonBox", "volume"], buttons);
const outerRect = { x: 0, y: 0, width: 200, height: 200, radius: 0 };
const panels: PanelRects = {
  buttonBox: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
  volume: { x: 50, y: 0, width: 40, height: 40, radius: 0 },
  "button-1": buttons[0].rect,
  "button-2": buttons[1].rect,
};

describe("combined calibration phases", () => {
  it("orders setup, Controls, Buttons, and confirmation phases", () => {
    expect(getCombinedPhaseOrder(["buttonBox", "volume"], buttons)).toEqual([
      "outer",
      "controlSelection",
      "buttonSelection",
      "grid",
      "buttonBox",
      "volume",
      "button-1",
      "button-2",
      "confirm",
    ]);
  });

  it("moves forward and backward through the deterministic phase order", () => {
    expect(getNextCombinedPhase("grid", panelOrder)).toBe("buttonBox");
    expect(getPreviousCombinedPhase("button-1", panelOrder)).toBe("volume");
  });

  it("shows completed panels plus the active panel only", () => {
    expect(getVisibleCombinedPanelIds("button-1", panelOrder)).toEqual([
      "buttonBox",
      "volume",
      "button-1",
    ]);
    expect(getVisibleCombinedPanelIds("volume", panelOrder)).toEqual([
      "buttonBox",
      "volume",
    ]);
    expect(getVisibleCombinedPanelIds("confirm", panelOrder)).toEqual(panelOrder);
  });

  it("ignores overlap with hidden future panels but rejects visible overlap", () => {
    expect(getCombinedActivePanelError("button-1", ["buttonBox", "volume", "button-1"], {
      ...panels,
      "button-1": { ...panels["button-1"], x: 0, y: 0 },
    }, outerRect)).toBe("overlap");
    expect(getCombinedActivePanelError("button-1", ["buttonBox", "volume", "button-1"], {
      ...panels,
      "button-1": { ...panels["button-1"], x: 150, y: 150 },
    }, outerRect)).toBeNull();
    expect(getCombinedActivePanelError("button-1", ["buttonBox", "volume", "button-1"], {
      ...panels,
      "button-1": { ...panels["button-1"], x: 180, y: 180 },
    }, outerRect)).toBe("invalid");
  });
});
