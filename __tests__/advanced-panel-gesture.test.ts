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
        snapSensitivity: "balanced",
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
        snapSensitivity: "balanced",
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
        snapSensitivity: "balanced",
        startRect,
      }).rect,
    ).toMatchObject({ x: 0, y: 0, width: 130, height: 160 });
  });

  it("snaps movement and keeps the result inside the outer rectangle", () => {
    const snapped = getAdvancedPanelMoveResult({
      dx: 47,
      dy: 0,
      grid: { columns: 3, rows: 4 },
      outerRect,
      scale: 1,
      snapSensitivity: "balanced",
      startRect,
    });
    const clamped = getAdvancedPanelMoveResult({
      dx: 400,
      dy: 500,
      grid: { columns: 1, rows: 1 },
      outerRect,
      scale: 1,
      snapSensitivity: "balanced",
      startRect,
    });

    expect(snapped.rect.x).toBe(106);
    expect(snapped.snapKey).toContain("left:x:106.00");
    expect(clamped.rect).toMatchObject({ x: 220, y: 300 });
  });

  it("always snaps movement to the configured grid", () => {
    const result = getAdvancedPanelMoveResult({
      dx: 47,
      dy: 0,
      grid: { columns: 3, rows: 4 },
      outerRect,
      scale: 1,
      snapSensitivity: "balanced",
      startRect,
    });

    expect(result.rect.x).toBe(106);
    expect(result.snapKey).toContain("left:x:106.00");
  });

  it("changes movement capture distance without changing the target", () => {
    const input = {
      dx: 40,
      dy: 0,
      grid: { columns: 3, rows: 4 },
      outerRect,
      scale: 1,
      startRect,
    } as const;
    const low = getAdvancedPanelMoveResult({
      ...input,
      snapSensitivity: "low",
    });
    const balanced = getAdvancedPanelMoveResult({
      ...input,
      snapSensitivity: "balanced",
    });

    expect(low.rect.x).not.toBe(balanced.rect.x);
    expect(low.snapKey).toBeNull();
    expect(balanced.snapKey).toContain("left:x:106.00");
  });

  it("uses the same sensitivity for resizing", () => {
    const input = {
      dx: 49,
      dy: 0,
      grid: { columns: 3, rows: 4 },
      outerRect,
      position: "right" as const,
      scale: 1,
      startRect,
    };
    const low = getAdvancedPanelResizeResult({
      ...input,
      snapSensitivity: "low",
    });
    const balanced = getAdvancedPanelResizeResult({
      ...input,
      snapSensitivity: "balanced",
    });

    expect(low.rect.width).toBe(129);
    expect(low.snapKey).toBeNull();
    expect(balanced.rect.width).toBe(144);
    expect(balanced.snapKey).toContain("right:x:194.00");
  });

  it.each([39, 41])(
    "keeps the bottom edge above the row when raw bottom crosses it with dy %i",
    (dy) => {
      const result = getAdvancedPanelResizeResult({
        dx: 0,
        dy,
        grid: { columns: 3, rows: 4 },
        outerRect,
        position: "bottom",
        scale: 1,
        snapSensitivity: "balanced",
        startRect,
      });

      expect(result.rect.y + result.rect.height).toBe(194);
      expect(result.rect.height).toBe(134);
      expect(result.snapKey).toContain("bottom:y:194.00");
    },
  );

  it.each([69, 71])(
    "keeps the right edge left of the column when raw right crosses it with dx %i",
    (dx) => {
      const result = getAdvancedPanelResizeResult({
        dx,
        dy: 0,
        grid: { columns: 3, rows: 4 },
        outerRect,
        position: "right",
        scale: 1,
        snapSensitivity: "balanced",
        startRect,
      });

      expect(result.rect.x + result.rect.width).toBe(194);
      expect(result.rect.width).toBe(144);
      expect(result.snapKey).toContain("right:x:194.00");
    },
  );
});
