import { getHelpSheetLayout } from "@/features/quick-panel/shared/help-sheet-layout";

describe("getHelpSheetLayout", () => {
  it("caps tall example widths on wide foldable screens", () => {
    expect(getHelpSheetLayout(884, 981)).toEqual({
      gridExampleWidth: 180,
      maxHeight: 720,
      panelExampleWidth: 168,
      reviewExampleWidth: 220,
      tallExampleWidth: 140,
    });
  });

  it("keeps smaller fixed example widths on regular phones", () => {
    expect(getHelpSheetLayout(412, 915)).toEqual({
      gridExampleWidth: 156,
      maxHeight: 720,
      panelExampleWidth: 150,
      reviewExampleWidth: 200,
      tallExampleWidth: 132,
    });
  });
});
