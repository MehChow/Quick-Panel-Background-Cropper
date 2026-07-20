import {
  getCustomizePreviewFrame,
  getPreviewPanelRadius,
  getSourceContextDimPath,
  getSourceContextImageOpacity,
  getSourceContextPanelRects,
} from "@/features/quick-panel/customize/source-image-context-geometry";
import { getImagePlacementBounds } from "@/features/quick-panel/model/panel-geometry";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const buttonPreset: QuickPanelPreset = {
  ...s25PlusOneUi85Preset,
  id: "button-test",
  mode: "advanced",
  panels: {
    "button-1": {
      id: "button-1",
      family: "button",
      fileName: "button.png",
      label: "Wi-Fi",
      rect: { x: 14, y: 164, width: 120, height: 60, radius: 20 },
    },
  },
  visualOrder: ["button-1"],
  goodLockOrder: ["button-1"],
};

describe("source image context geometry", () => {
  it("always uses the authoritative placement frame", () => {
    expect(getCustomizePreviewFrame(s25PlusOneUi85Preset)).toEqual(
      getImagePlacementBounds(s25PlusOneUi85Preset),
    );
  });

  it("matches the rendered 32-point panel radius after scaling", () => {
    expect(
      getPreviewPanelRadius(
        { x: 0, y: 0, width: 100, height: 40, radius: 0 },
        1,
      ),
    ).toBe(20);
    expect(
      getPreviewPanelRadius(
        { x: 0, y: 0, width: 200, height: 100, radius: 0 },
        0.5,
      ),
    ).toBe(25);
  });

  it("builds logical rounded panel shapes and one even-odd path", () => {
    const panels = getSourceContextPanelRects(s25PlusOneUi85Preset, 0.5);
    expect(panels).toHaveLength(4);
    expect(panels[1]).toMatchObject({
      x: 14,
      y: 291,
      width: 272,
      height: 56,
      radius: 28,
    });

    const frame = getImagePlacementBounds(s25PlusOneUi85Preset);
    const path = getSourceContextDimPath(frame, panels);
    expect(path).toContain(`M ${frame.x} ${frame.y}`);
    expect(path).toContain("A 28 28 0 0 1");
    expect(path.match(/Z/g)).toHaveLength(5);
  });

  it("uses Controls or Button preview intensity", () => {
    expect(getSourceContextImageOpacity(s25PlusOneUi85Preset, 0.63)).toBe(0.5);
    expect(getSourceContextImageOpacity(buttonPreset, 0.63)).toBe(0.63);
  });
});
