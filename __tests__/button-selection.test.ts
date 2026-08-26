import { createButtonItems } from "@/features/quick-panel/calibration/advanced/button-selection";

const outerRect = {
  x: 10,
  y: 20,
  width: 210,
  height: 110,
  radius: 0,
};

describe("createButtonItems", () => {
  it("preserves reviewed order and custom icons", () => {
    expect(createButtonItems([
      { label: "Wi-Fi", customIconId: null },
      { label: "快速分享", customIconId: "share-2" },
    ], outerRect)).toMatchObject([
      { id: "button-1", label: "Wi-Fi", customIconId: null },
      { id: "button-2", label: "快速分享", customIconId: "share-2" },
    ]);
  });

  it("keeps the existing two-column geometry", () => {
    const buttons = createButtonItems([
      { label: "Wi-Fi", customIconId: null },
      { label: "Bluetooth", customIconId: null },
    ], outerRect);

    expect(buttons.map((button) => button.rect)).toEqual([
      { x: 18, y: 28, width: 93, height: 94, radius: 0 },
      { x: 119, y: 28, width: 93, height: 94, radius: 0 },
    ]);
  });
});
