import {
  getAdvancedPanelMoveResult,
  getAdvancedPanelResizeResult,
} from "@/features/quick-panel/calibration/advanced/advanced-panel-gesture";

const outerRect = { x: 0, y: 0, width: 300, height: 400, radius: 0 };
const startRect = { x: 50, y: 60, width: 80, height: 100, radius: 0 };

describe("advanced panel gesture geometry", () => {
  it("converts screen movement to calibration coordinates", () => {
    expect(
      getAdvancedPanelMoveResult({
        dx: 20,
        dy: 10,
        grid: { columns: 1, rows: 1 },
        outerRect,
        scale: 0.5,
        startRect,
      }).rect,
    ).toMatchObject({ x: 90, y: 80 });
  });

  it("resizes from the committed start rectangle", () => {
    expect(
      getAdvancedPanelResizeResult({
        dx: 15,
        dy: 20,
        grid: { columns: 1, rows: 1 },
        outerRect,
        position: "bottomRight",
        scale: 1,
        startRect,
      }).rect,
    ).toMatchObject({ width: 95, height: 120 });
  });

  it("applies resize scale before constraining the rectangle", () => {
    expect(
      getAdvancedPanelResizeResult({
        dx: -20,
        dy: -10,
        grid: { columns: 1, rows: 1 },
        outerRect,
        position: "topLeft",
        scale: 0.5,
        startRect,
      }).rect,
    ).toMatchObject({ x: 0, y: 40, width: 130, height: 120 });
  });

  it("snaps movement and keeps the result inside the outer rectangle", () => {
    const snapped = getAdvancedPanelMoveResult({
      dx: 47,
      dy: 0,
      grid: { columns: 3, rows: 4 },
      outerRect,
      scale: 1,
      startRect,
    });
    const clamped = getAdvancedPanelMoveResult({
      dx: 400,
      dy: 500,
      grid: { columns: 1, rows: 1 },
      outerRect,
      scale: 1,
      startRect,
    });

    expect(snapped.rect.x).toBe(94);
    expect(snapped.snapKey).toContain("left:x:94.00");
    expect(clamped.rect).toMatchObject({ x: 220, y: 300 });
  });
});
