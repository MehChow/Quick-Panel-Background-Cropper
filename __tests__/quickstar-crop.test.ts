import { getCustomPreviewLayout } from "@/features/quick-panel/model/quickstar-crop";

describe("quickstar crop", () => {
  it("uses a centered uniform cover scale for custom preview panels", () => {
    expect(
      getCustomPreviewLayout({
        fileName: "button-box.png",
        id: "buttonBox",
        label: "Button box",
        rect: {
          height: 100,
          radius: 12,
          width: 360,
          x: 20,
          y: 40,
        },
      }),
    ).toEqual({
      cropRect: {
        height: 90,
        radius: 12,
        width: 360,
        x: 20,
        y: 45,
      },
      offsetX: -20,
      offsetY: 0,
      scale: 100 / 90,
    });
  });
});
