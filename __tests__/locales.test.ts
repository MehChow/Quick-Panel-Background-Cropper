import { enLocale, zhLocale } from "../i18next/resources";

describe("customize locale strings", () => {
  it("defines Customize image-placement help in English and Chinese", () => {
    const english = enLocale.translation.customize;
    const chinese = zhLocale.translation.customize;
    expect(english.imagePlacementBoundaryHelp).toBe(
      "The full placement area is the region the image must cover. Zoom in if you need more room to move the image within it.",
    );
    expect(chinese.imagePlacementBoundaryHelp).toBe(
      "完整放置範圍是圖片必須覆蓋的區域。如需在範圍內有更多移動空間，請放大圖片。",
    );
    for (const locale of [english, chinese]) {
      expect(locale.imagePlacementHelpButton).toBeTruthy();
      expect(locale.imagePlacementHelpTitle).toBeTruthy();
      expect(locale.imagePlacementHelpBody).toBeTruthy();
    }
  });

  it("defines optimization copy for English and Chinese", () => {
    expect(enLocale.translation.customize.optimizingImage).toBe(
      "Optimizing image...",
    );
    expect(zhLocale.translation.customize.optimizingImage).toBe(
      "最佳化圖片中...",
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
    expect(enLocale.translation.customize.buttonAdjustmentImageTab).toBe("Image");
    expect(enLocale.translation.customize.buttonAdjustmentIdentifierTab).toBe(
      "Identifier",
    );
    expect(enLocale.translation.customize.buttonAdjustmentHorizontalTab).toBe(
      "Horiz.",
    );
    expect(enLocale.translation.customize.buttonAdjustmentVerticalTab).toBe(
      "Vert.",
    );
    expect(enLocale.translation.customize.buttonIdentifiersOn).toBe("On");
    expect(enLocale.translation.customize.buttonIdentifiersOff).toBe("Off");
    expect(zhLocale.translation.customize.showButtonIdentifiers).toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifierOpacity).toBeTruthy();
    expect(zhLocale.translation.customize.horizontalIdentifierPosition).toBeTruthy();
    expect(zhLocale.translation.customize.verticalIdentifierPosition).toBeTruthy();
    expect(zhLocale.translation.customize.buttonAdjustmentImageTab).toBe("圖片");
    expect(zhLocale.translation.customize.buttonAdjustmentIdentifierTab).toBe(
      "識別標記",
    );
    expect(zhLocale.translation.customize.buttonAdjustmentHorizontalTab).toBe(
      "水平",
    );
    expect(zhLocale.translation.customize.buttonAdjustmentVerticalTab).toBe(
      "垂直",
    );
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
