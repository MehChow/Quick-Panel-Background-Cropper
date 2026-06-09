import { getPreviewViewportSize } from "@/features/quick-panel/customize/preview-layout";

describe("quick panel preview layout", () => {
  it("keeps the full width when the natural preview height fits", () => {
    const previewSize = getPreviewViewportSize({
      containerWidth: 360,
      maxHeight: 420,
      panelUnion: { height: 300, radius: 0, width: 272, x: 0, y: 0 },
    });

    expect(previewSize.width).toBe(360);
    expect(previewSize.height).toBeCloseTo(397.05882352941177);
  });

  it("shrinks tall layouts to fit within the bounded viewport height", () => {
    const previewSize = getPreviewViewportSize({
      containerWidth: 360,
      maxHeight: 420,
      panelUnion: { height: 1200, radius: 0, width: 272, x: 0, y: 0 },
    });

    expect(previewSize.height).toBe(420);
    expect(previewSize.width).toBeCloseTo(95.2);
  });
});
