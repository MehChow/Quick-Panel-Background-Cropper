import { getHelpSheetMediaLayout } from "@/features/quick-panel/shared/help-sheet-media-layout";

describe("getHelpSheetMediaLayout", () => {
  it("caps thumbnail widths when help sheets have wider viewports", () => {
    expect(getHelpSheetMediaLayout(884, 981)).toEqual({
      gridExampleWidth: 180,
      maxHeight: 720,
      panelExampleWidth: 168,
      reviewExampleWidth: 220,
      tallExampleWidth: 140,
    });
  });

  it("keeps smaller fixed example widths on regular phones", () => {
    expect(getHelpSheetMediaLayout(412, 915)).toEqual({
      gridExampleWidth: 156,
      maxHeight: 720,
      panelExampleWidth: 150,
      reviewExampleWidth: 200,
      tallExampleWidth: 132,
    });
  });
});
