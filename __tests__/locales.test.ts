import { enLocale, zhLocale } from "../i18next/resources";

describe("customize locale strings", () => {
  it("defines optimization copy for English and Chinese", () => {
    expect(enLocale.translation.customize.optimizingImage).toBe(
      "Optimizing image...",
    );
    expect(enLocale.translation.customize.imageOptimized).toBe(
      "Selected image was optimized for smoother adjustment.",
    );
    expect(zhLocale.translation.customize.optimizingImage).toBe(
      "最佳化圖片中...",
    );
    expect(zhLocale.translation.customize.imageOptimized).toBe(
      "已優化所選圖片，拖曳調整會更順暢。",
    );
  });
});
