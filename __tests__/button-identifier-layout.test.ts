import {
  getButtonExportBounds,
  getButtonGridSpan,
  getButtonIdentifierLayout,
  getButtonIdentifierLayoutKind,
  getConstrainedAxisOffset,
} from "@/features/quick-panel/model/button-identifier-layout";
import { getExportSquareRect } from "@/features/quick-panel/model/panel-geometry";
import type { PanelDefinition, PanelRect } from "@/features/quick-panel/model/types";

const outerRect = { x: 0, y: 0, width: 400, height: 400, radius: 0 };
const grid = { columns: 4, rows: 4 };

function createIdentifier(columnSpan: number, rowSpan: number) {
  return {
    columnSpan,
    iconName: "wifi" as const,
    referenceCellSize: 50,
    rowSpan,
  };
}

function createPanel(
  rect: Pick<PanelRect, "width" | "height">,
  columnSpan: number,
  rowSpan: number,
): PanelDefinition {
  return {
    id: "button-1",
    label: "Wi-Fi",
    fileName: "01-wi-fi.png",
    family: "button",
    rect: { ...rect, x: 0, y: 0, radius: 0 },
    buttonIdentifier: {
      columnSpan,
      iconName: "wifi",
      referenceCellSize: 100,
      rowSpan,
    },
  };
}

describe("Button identifier layout", () => {
  it.each([
    [4, 1, "horizontal"],
    [1, 3, "vertical"],
    [1, 1, "single"],
    [2, 2, "corner"],
    [3, 2, "corner"],
    [2, 3, "corner"],
    [3, 3, "corner"],
  ] as const)("classifies %sx%s as %s", (columnSpan, rowSpan, expected) => {
    expect(getButtonIdentifierLayoutKind(
      createIdentifier(columnSpan, rowSpan),
    )).toBe(expected);
  });

  it.each([
    [0, 8],
    [0.5, 34],
    [1, 60],
  ])("maps %s to a constrained safe-axis offset", (position, expected) => {
    expect(getConstrainedAxisOffset({
      axisLength: 100,
      contentLength: 32,
      inset: 8,
      position,
    })).toBe(expected);
  });

  it("clamps travel to zero when content consumes the safe axis", () => {
    expect(getConstrainedAxisOffset({
      axisLength: 100,
      contentLength: 100,
      inset: 8,
      position: 1,
    })).toBe(8);
  });

  it("derives nearest clamped grid spans", () => {
    expect(getButtonGridSpan(
      { x: 0, y: 0, width: 190, height: 110, radius: 0 },
      outerRect,
      grid,
    )).toEqual({ columnSpan: 2, rowSpan: 1 });
    expect(getButtonGridSpan(
      { x: 0, y: 0, width: 900, height: 5, radius: 0 },
      outerRect,
      grid,
    )).toEqual({ columnSpan: 4, rowSpan: 1 });
  });

  it("centers icon-only identifiers for 1x1 Buttons", () => {
    const layout = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 40, height: 40 },
      createIdentifier(1, 1),
      40,
    );

    expect(layout).toMatchObject({
      bounds: { x: 0, y: 0, width: 40, height: 40 },
      iconSize: 13.6,
      kind: "single",
      showLabel: false,
    });
  });

  it("moves icon-only identifiers for one-column Buttons", () => {
    expect(getButtonIdentifierLayout(
      { x: 0, y: 0, width: 40, height: 120 },
      createIdentifier(1, 3),
      40,
    )).toMatchObject({
      kind: "vertical",
      showLabel: false,
    });
  });

  it("reserves the full circular icon width in horizontal Buttons", () => {
    expect(getButtonIdentifierLayout(
      { x: 0, y: 0, width: 100, height: 50 },
      createIdentifier(4, 1),
      50,
    )).toMatchObject({
      fontSize: 9,
      gap: 4,
      iconBackgroundSize: 29.75,
      iconSize: 17,
      inset: 7,
      kind: "horizontal",
      maxLabelWidth: 52.25,
      minimumFontScale: 0.7,
      showLabel: true,
    });
  });

  it("uses one rendered cell reference for every panel kind", () => {
    const horizontal = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 200, height: 50 },
      createIdentifier(4, 1),
      50,
    );
    const vertical = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 50, height: 150 },
      createIdentifier(1, 3),
      50,
    );
    const corner = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 150, height: 150 },
      createIdentifier(3, 3),
      50,
    );

    expect([horizontal.iconSize, vertical.iconSize, corner.iconSize]).toEqual([
      17, 17, 17,
    ]);
    expect([
      horizontal.iconBackgroundSize,
      vertical.iconBackgroundSize,
      corner.iconBackgroundSize,
    ]).toEqual([29.75, 29.75, 29.75]);
    expect(horizontal.fontSize).toBe(9);
    expect(corner.fontSize).toBe(9);
  });

  it.each([
    [{ x: 10, y: 20, width: 80, height: 40, radius: 0 }, { x: 0, y: 256, width: 1024, height: 512 }],
    [{ x: 10, y: 20, width: 40, height: 80, radius: 0 }, { x: 256, y: 0, width: 512, height: 1024 }],
  ])("maps the visible panel into its centered square export", (rect, expected) => {
    const panel: PanelDefinition = {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "01-wi-fi.png",
      family: "button",
      rect,
    };

    expect(getButtonExportBounds(panel, 1024)).toEqual(expected);
  });

  it.each([2, 3])(
    "keeps applied identifier size stable at PixelRatio %s",
    (pixelRatio) => {
      const side = 1024 / pixelRatio;
      const panels = [
        createPanel({ width: 400, height: 100 }, 4, 1),
        createPanel({ width: 100, height: 300 }, 1, 3),
        createPanel({ width: 300, height: 300 }, 3, 3),
      ];
      const appliedSizes = panels.map((panel) => {
        const square = getExportSquareRect(panel);
        const squareScale = side / square.width;
        const identifier = panel.buttonIdentifier!;
        const layout = getButtonIdentifierLayout(
          getButtonExportBounds(panel, side),
          identifier,
          identifier.referenceCellSize * squareScale,
        );
        return layout.iconSize * pixelRatio * square.width / 1024;
      });

      expect(appliedSizes[0]).toBeCloseTo(34);
      expect(appliedSizes[1]).toBeCloseTo(34);
      expect(appliedSizes[2]).toBeCloseTo(34);
    },
  );
});
