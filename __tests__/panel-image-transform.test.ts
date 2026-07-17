import { getPanelImageTransform } from "@/features/quick-panel/customize/panel-image-transform";

describe("panel image transforms", () => {
  it("maps screenshot coordinates to panel-local preview transforms", () => {
    expect(
      getPanelImageTransform({
        panelX: 100,
        panelY: 200,
        previewScale: 0.25,
        transform: { x: 40, y: 120, scale: 1.5 },
      }),
    ).toEqual({
      scale: 0.375,
      translateX: -15,
      translateY: -20,
    });
  });

  it("keeps fit placement at the panel origin", () => {
    expect(
      getPanelImageTransform({
        panelX: 20,
        panelY: 30,
        previewScale: 0.5,
        transform: { x: 20, y: 30, scale: 2 },
      }),
    ).toEqual({ scale: 1, translateX: 0, translateY: 0 });
  });

  it.each([
    [{ x: 160, y: 100, scale: 1 }, { scale: 0.5, translateX: 30, translateY: 10 }],
    [{ x: 40, y: 20, scale: 3 }, { scale: 1.5, translateX: -30, translateY: -30 }],
  ])("maps pan and zoom placement %#", (transform, expected) => {
    expect(
      getPanelImageTransform({
        panelX: 100,
        panelY: 80,
        previewScale: 0.5,
        transform,
      }),
    ).toEqual(expected);
  });
});
