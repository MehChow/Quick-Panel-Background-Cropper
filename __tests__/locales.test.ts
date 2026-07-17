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

  it("defines Button identifier controls in English and Chinese", () => {
    expect(enLocale.translation.customize.showButtonIdentifiers).toBe(
      "Show Button identifiers",
    );
    expect(enLocale.translation.customize.buttonIdentifierOpacity).toBe(
      "Button identifier intensity",
    );
    expect(enLocale.translation.customize.horizontalIdentifierPosition).toBe(
      "Horizontal identifier position",
    );
    expect(enLocale.translation.customize.verticalIdentifierPosition).toBe(
      "Vertical identifier position",
    );
    expect(enLocale.translation.customize.buttonIdentifiersOn).toBe("On");
    expect(enLocale.translation.customize.buttonIdentifiersOff).toBe("Off");
    expect(zhLocale.translation.customize.showButtonIdentifiers).toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifierOpacity).toBeTruthy();
    expect(zhLocale.translation.customize.horizontalIdentifierPosition).toBeTruthy();
    expect(zhLocale.translation.customize.verticalIdentifierPosition).toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifiersOn).toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifiersOff).toBeTruthy();
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
    expect(english.customIconDialogTitle).toBeTruthy();
    expect(english.customIconDialogBody).toBeTruthy();
    expect(english.customIconStar).toBe("Star");
    expect(english.customIconZap).toBe("Zap");
    expect(english.customIconHome).toBe("Home");
    expect(english.customIconAppWindow).toBe("App Window");
    expect(chinese.customIconDialogTitle).toBeTruthy();
    expect(chinese.customIconDialogBody).toBeTruthy();
    expect(chinese.customIconStar).toBeTruthy();
    expect(chinese.customIconZap).toBeTruthy();
    expect(chinese.customIconHome).toBeTruthy();
    expect(chinese.customIconAppWindow).toBeTruthy();
  });
});
