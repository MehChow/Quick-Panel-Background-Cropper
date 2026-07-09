import { getCalibrationFromDraft } from "@/features/quick-panel/store/advanced-calibration-state";
import type {
  AdvancedCalibrationDraft,
  AdvancedSnapGrid,
  PanelRects,
} from "@/features/quick-panel/model/types";
import { visualOrder } from "@/features/quick-panel/model/preset";

const grid: AdvancedSnapGrid = { columns: 4, rows: 5 };

function createPanels(): PanelRects {
  return {
    mediaPlayer: {
      x: 0,
      y: 0,
      width: 180,
      height: 50,
      radius: 0,
    },
    buttonBox: {
      x: 60,
      y: 60,
      width: 180,
      height: 50,
      radius: 0,
    },
    brightness: {
      x: 0,
      y: 120,
      width: 180,
      height: 50,
      radius: 0,
    },
    volume: {
      x: 60,
      y: 180,
      width: 180,
      height: 50,
      radius: 0,
    },
  };
}

function createDraft(panels: PanelRects): AdvancedCalibrationDraft {
  return {
    screenshot: {
      uri: "file:///screenshot.png",
      width: 240,
      height: 240,
    },
    outerRect: {
      x: 0,
      y: 0,
      width: 240,
      height: 240,
      radius: 0,
    },
    enabledPanels: visualOrder,
    panels,
  };
}

describe("getCalibrationFromDraft", () => {
  it("accepts panels that only exceed the outer edge by floating point noise", () => {
    const panels = createPanels();
    panels.buttonBox.width = 180.0000004;
    panels.volume.width = 180.0000004;

    const result = getCalibrationFromDraft(createDraft(panels), grid);

    expect(result).not.toBeNull();
  });
});
