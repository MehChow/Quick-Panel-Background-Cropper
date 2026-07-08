import { createButtonFileNames } from "@/features/quick-panel/model/button-export-names";
import {
  buttonLabelCatalog,
  pinnedButtonLabelIds,
  searchButtonLabels,
} from "@/features/quick-panel/model/button-labels";

describe("button labels", () => {
  it("keeps pinned labels first when search is empty", () => {
    expect(buttonLabelCatalog.length).toBeGreaterThanOrEqual(45);
    expect(searchButtonLabels("").slice(0, pinnedButtonLabelIds.length).map((item) => item.id)).toEqual(
      pinnedButtonLabelIds,
    );
  });

  it("searches labels with trimmed case-insensitive substrings", () => {
    expect(searchButtonLabels("  rotate ").map((item) => item.label)).toContain("Auto rotate");
    expect(searchButtonLabels("DATA").map((item) => item.label)).toContain("Mobile data");
  });

  it("creates ordered slugged file names with duplicate suffixes", () => {
    expect(createButtonFileNames(["Wi-Fi", "Wi-Fi", "Custom Label!"])).toEqual([
      "01-wi-fi.png",
      "02-wi-fi-2.png",
      "03-custom-label.png",
    ]);
  });
});
