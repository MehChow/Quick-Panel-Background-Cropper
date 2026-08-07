import {
  createAdvancedCombinedDraft,
  getCombinedCalibrationFromDraft,
  getCombinedPanelItems,
  getCombinedPanelRects,
  scaleCombinedDraftToOuter,
  initializeCombinedControlPanels,
} from "@/features/quick-panel/calibration/advanced/combined/combined-calibration-state";
import type {
  AdvancedCombinedCalibration,
  AdvancedCombinedDraft,
  PanelRect,
} from "@/features/quick-panel/model/types";

const screenshot = { uri: "file:///panel.png", width: 200, height: 400 };
const outerRect: PanelRect = { x: 0, y: 0, width: 200, height: 400, radius: 0 };

const controlPanels = {
  buttonBox: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
  brightness: { x: 50, y: 0, width: 40, height: 40, radius: 0 },
  volume: { x: 100, y: 0, width: 40, height: 40, radius: 0 },
  mediaPlayer: { x: 150, y: 0, width: 40, height: 40, radius: 0 },
};

const button = {
  id: "button-1" as const,
  label: "Wi-Fi",
  customIconId: null,
  rect: { x: 0, y: 100, width: 40, height: 40, radius: 0 },
};

const validDraft: AdvancedCombinedDraft = {
  screenshot,
  outerRect,
  enabledControls: ["buttonBox"],
  controlPanels,
  buttons: [button],
};

describe("combined calibration state", () => {
  it("creates a first-use draft with all Controls selected and no boxes", () => {
    expect(createAdvancedCombinedDraft(screenshot, outerRect, null)).toMatchObject({
      screenshot,
      outerRect,
      enabledControls: ["buttonBox", "brightness", "volume", "mediaPlayer"],
      controlPanels: null,
      buttons: [],
    });
  });

  it("scales a saved outer area and both panel families to a new screenshot", () => {
    const saved: AdvancedCombinedCalibration = {
      screenshotWidth: 100,
      screenshotHeight: 200,
      grid: { columns: 4, rows: 6 },
      outerRect: { x: 0, y: 0, width: 100, height: 200, radius: 0 },
      enabledControls: ["buttonBox"],
      controlPanels: {
        buttonBox: { x: 10, y: 20, width: 30, height: 40, radius: 7 },
        brightness: { x: 0, y: 0, width: 1, height: 1, radius: 0 },
        volume: { x: 0, y: 0, width: 1, height: 1, radius: 0 },
        mediaPlayer: { x: 0, y: 0, width: 1, height: 1, radius: 0 },
      },
      buttons: [{ ...button, rect: { x: 40, y: 80, width: 20, height: 30, radius: 0 } }],
    };

    const draft = createAdvancedCombinedDraft(screenshot, outerRect, saved);

    expect(draft.outerRect).toEqual(outerRect);
    expect(draft.controlPanels?.buttonBox).toEqual({
      x: 20,
      y: 40,
      width: 60,
      height: 80,
      radius: 7,
    });
    expect(draft.buttons[0].rect).toEqual({
      x: 80,
      y: 160,
      width: 40,
      height: 60,
      radius: 0,
    });
  });

  it("rescales initialized panels when the combined outer area changes", () => {
    const draft = scaleCombinedDraftToOuter(validDraft, {
      x: 20,
      y: 40,
      width: 100,
      height: 200,
      radius: 0,
    });

    expect(draft.controlPanels?.buttonBox).toEqual({
      x: 20,
      y: 40,
      width: 20,
      height: 20,
      radius: 0,
    });
    expect(draft.buttons[0].rect).toEqual({
      x: 20,
      y: 90,
      width: 20,
      height: 20,
      radius: 0,
    });
  });

  it("initializes Control geometry and exposes ordered mixed panel data", () => {
    const draft = initializeCombinedControlPanels({
      ...createAdvancedCombinedDraft(screenshot, outerRect, null),
      enabledControls: ["buttonBox", "brightness"],
      buttons: [button],
    });

    expect(draft.controlPanels).not.toBeNull();
    expect(getCombinedPanelItems(draft).map((item) => item.id)).toEqual([
      "buttonBox",
      "brightness",
      "button-1",
    ]);
    expect(Object.keys(getCombinedPanelRects(draft) ?? {})).toEqual([
      "buttonBox",
      "brightness",
      "button-1",
    ]);
  });

  it("rejects incomplete or overlapping final geometry", () => {
    expect(getCombinedCalibrationFromDraft({ ...validDraft, enabledControls: [] }, {
      columns: 4,
      rows: 6,
    })).toBeNull();
    expect(getCombinedCalibrationFromDraft({ ...validDraft, buttons: [] }, {
      columns: 4,
      rows: 6,
    })).toBeNull();
    expect(getCombinedCalibrationFromDraft({
      ...validDraft,
      controlPanels: { ...controlPanels, buttonBox: { ...controlPanels.buttonBox, x: -1 } },
    }, { columns: 4, rows: 6 })).toBeNull();
    expect(getCombinedCalibrationFromDraft({
      ...validDraft,
      controlPanels: { ...controlPanels, buttonBox: { ...controlPanels.buttonBox, y: 100 } },
    }, { columns: 4, rows: 6 })).toBeNull();
    expect(getCombinedCalibrationFromDraft({
      ...validDraft,
      controlPanels: {
        ...controlPanels,
        brightness: { ...controlPanels.brightness, x: 10 },
      },
      enabledControls: ["buttonBox", "brightness"],
    }, { columns: 4, rows: 6 })).toBeNull();
    expect(getCombinedCalibrationFromDraft({
      ...validDraft,
      buttons: [
        button,
        {
          id: "button-2",
          label: "Bluetooth",
          customIconId: null,
          rect: { x: 10, y: 100, width: 40, height: 40, radius: 0 },
        },
      ],
    }, { columns: 4, rows: 6 })).toBeNull();
    expect(getCombinedCalibrationFromDraft({
      ...validDraft,
      controlPanels: {
        ...controlPanels,
        buttonBox: { ...controlPanels.buttonBox, y: 100 },
      },
    }, { columns: 4, rows: 6 })).toBeNull();
    expect(getCombinedCalibrationFromDraft({
      ...validDraft,
      controlPanels: { ...controlPanels, brightness: { ...controlPanels.brightness, x: 10 } },
      enabledControls: ["buttonBox"],
    }, { columns: 4, rows: 6 })).not.toBeNull();
  });

  it("keeps snap sensitivity out of saved Combined geometry", () => {
    const result = getCombinedCalibrationFromDraft(
      validDraft,
      { columns: 4, rows: 6 },
    );

    expect(result?.grid).toEqual({ columns: 4, rows: 6 });
    expect(result?.grid).not.toHaveProperty("snapSensitivity");
    expect(result).not.toHaveProperty("snapSensitivity");
  });
});
