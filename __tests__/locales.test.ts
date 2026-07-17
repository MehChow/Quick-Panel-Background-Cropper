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

  it("defines target-aware Advanced helper copy in English and Chinese", () => {
    const english = enLocale.translation.advancedCalibration;
    const chinese = zhLocale.translation.advancedCalibration;

    expect(english.buttonSelectionSubtitle).toBeTruthy();
    expect(english.buttonGridSubtitle).toBeTruthy();
    expect(english.buttonConfirmSubtitle).toBeTruthy();
    expect(english.buttonGridSheetSubtitle).toBeTruthy();
    expect(english.buttonPanelHelpBody).toBeTruthy();
    expect(english.buttonPanelHelpGood).toBeTruthy();
    expect(english.buttonPanelHelpBad).toBeTruthy();
    expect(chinese.buttonSelectionSubtitle).toBeTruthy();
    expect(chinese.buttonGridSubtitle).toBeTruthy();
    expect(chinese.buttonConfirmSubtitle).toBeTruthy();
    expect(chinese.buttonGridSheetSubtitle).toBeTruthy();
    expect(chinese.buttonPanelHelpBody).toBeTruthy();
    expect(chinese.buttonPanelHelpGood).toBeTruthy();
    expect(chinese.buttonPanelHelpBad).toBeTruthy();
  });
});
