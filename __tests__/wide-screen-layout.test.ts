import { getWideScreenLayout } from "@/features/quick-panel/shared/wide-screen-layout";

describe("getWideScreenLayout", () => {
  it("keeps normal portrait phones in the regular layout", () => {
    expect(getWideScreenLayout(412, 915).isWideScreen).toBe(false);
  });

  it("treats foldable fullscreen portrait as a wide handset", () => {
    const layout = getWideScreenLayout(884, 981);

    expect(layout.isWideScreen).toBe(true);
    expect(layout.selectCardMaxWidth).toBeGreaterThan(0);
    expect(layout.footerMaxWidth).toBeGreaterThan(0);
  });

  it("keeps a short phone portrait out of wide mode", () => {
    expect(getWideScreenLayout(412, 780).isWideScreen).toBe(false);
  });
});
