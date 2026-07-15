import {
  clampButtonAreaPreviewRect,
  fitButtonAreaPreview,
} from "@/features/quick-panel/calibration/advanced/button-area-preview-geometry";

describe("button area preview geometry", () => {
  it("clamps the confirmed area to the screenshot bounds", () => {
    expect(
      clampButtonAreaPreviewRect(
        { x: -20, y: 60, width: 150, height: 50, radius: 12 },
        { uri: "file:///quick-panel.png", width: 100, height: 80 },
      ),
    ).toEqual({ x: 0, y: 60, width: 100, height: 20, radius: 0 });
  });

  it("fits a wide crop inside both preview limits without changing its aspect ratio", () => {
    expect(
      fitButtonAreaPreview(
        { x: 0, y: 0, width: 200, height: 100, radius: 0 },
        268,
        120,
      ),
    ).toEqual({ height: 120, scale: 1.2, width: 240 });
  });

  it("returns an empty layout when the crop has no visible area", () => {
    expect(
      fitButtonAreaPreview(
        { x: 100, y: 80, width: 0, height: 0, radius: 0 },
        268,
        120,
      ),
    ).toEqual({ height: 0, scale: 0, width: 0 });
  });
});
