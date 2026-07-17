import {
  getButtonExportBounds,
  getButtonGridSpan,
  getButtonIdentifierLayout,
  getButtonIdentifierOrientation,
  getConstrainedAxisOffset,
} from "@/features/quick-panel/model/button-identifier-layout";
import type { PanelDefinition } from "@/features/quick-panel/model/types";

const outerRect = { x: 0, y: 0, width: 400, height: 400, radius: 0 };
const grid = { columns: 4, rows: 4 };

function createIdentifier(columnSpan: number, rowSpan: number) {
  return { columnSpan, rowSpan, iconName: "wifi" as const };
}

describe("Button identifier layout", () => {
  it.each([
    [2, 1, "horizontal"],
    [1, 2, "vertical"],
    [1, 1, "square"],
    [2, 2, "square"],
  ] as const)("classifies %sx%s as %s", (columnSpan, rowSpan, expected) => {
    expect(getButtonIdentifierOrientation(
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
      "preview",
    );

    expect(layout).toMatchObject({
      alignment: "center",
      bounds: { x: 0, y: 0, width: 40, height: 40 },
      iconSize: 13.6,
      orientation: "square",
      showLabel: false,
    });
  });

  it("top-centers icon-only identifiers for vertical Buttons", () => {
    expect(getButtonIdentifierLayout(
      { x: 0, y: 0, width: 40, height: 120 },
      createIdentifier(1, 3),
      "preview",
    )).toMatchObject({
      alignment: "top-center",
      orientation: "vertical",
      showLabel: false,
    });
  });

  it.each([
    [2, 1, "horizontal"],
    [2, 2, "square"],
  ] as const)("left-centers icon and label for roomy %sx%s Buttons", (
    columnSpan,
    rowSpan,
    orientation,
  ) => {
    const layout = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 100, height: 50 },
      createIdentifier(columnSpan, rowSpan),
      "preview",
    );

    expect(layout).toMatchObject({
      alignment: "left-center",
      fontSize: 9,
      gap: 4,
      iconSize: 17,
      inset: 7,
      maxLabelWidth: 65,
      minimumFontScale: 0.7,
      orientation,
      showLabel: true,
    });
  });

  it("uses larger absolute sizing for exports", () => {
    const preview = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 40, height: 40 },
      createIdentifier(1, 1),
      "preview",
    );
    const exported = getButtonIdentifierLayout(
      { x: 0, y: 0, width: 1024, height: 1024 },
      createIdentifier(1, 1),
      "export",
    );

    expect(preview.iconSize).toBe(13.6);
    expect(exported.iconSize).toBe(96);
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
});
