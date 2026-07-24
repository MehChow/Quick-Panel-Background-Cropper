import { getResultPanelLayout } from "@/features/quick-panel/result/result-panel-layout";

describe("getResultPanelLayout", () => {
  it("preserves outer card margin on regular screens", () => {
    expect(
      getResultPanelLayout({
        availableHeight: 700,
        availableWidth: 460,
      }),
    ).toEqual({
      cardMaxWidth: 436,
      exportGridIndicatorInset: 11,
      exportGridViewportHeight: 440,
      gridMaxWidth: 388,
      isCompact: true,
    });
  });

  it("shrinks the preview grid to fit shorter content areas", () => {
    expect(
      getResultPanelLayout({
        availableHeight: 430,
        availableWidth: 520,
      }),
    ).toEqual({
      cardMaxWidth: 322,
      exportGridIndicatorInset: 8,
      exportGridViewportHeight: 333,
      gridMaxWidth: 274,
      isCompact: true,
    });
  });

  it("shrinks the preview grid on normal phones when the content box is tighter", () => {
    expect(
      getResultPanelLayout({
        availableHeight: 520,
        availableWidth: 360,
      }),
    ).toEqual({
      cardMaxWidth: 336,
      exportGridIndicatorInset: 8,
      exportGridViewportHeight: 346,
      gridMaxWidth: 288,
      isCompact: true,
    });
  });

  it("provides a viewport height for four exported images", () => {
    expect(
      getResultPanelLayout({
        availableHeight: 700,
        availableWidth: 460,
      }).exportGridViewportHeight,
    ).toBe(440);
  });
});
