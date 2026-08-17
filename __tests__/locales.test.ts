import { enLocale, zhLocale } from "../i18next/resources";

describe("release announcement locale strings", () => {
  it("defines the v1.3.3 updates in English and Traditional Chinese", () => {
    expect(enLocale.translation.releaseAnnouncement.v1_3_3).toEqual({
      title: "v1.3.3 Updates 🌟\n",
      body: "• New: Snap strength slider.\n• Enhancement: Snapping is now easier and more accurate.",
      gotIt: "Got it",
      mediaAccessibilityLabel: "Snap strength slider and improved snapping",
    });
    expect(zhLocale.translation.releaseAnnouncement.v1_3_3).toEqual({
      title: "v1.3.3 更新內容 🌟\n",
      body: "• 新功能：吸附強度滑桿。\n• 優化：吸附更容易、更準確。",
      gotIt: "知道了",
      mediaAccessibilityLabel: "吸附強度滑桿及更容易、更準確的吸附功能",
    });
  });
});

describe("customize locale strings", () => {
  it("defines Customize image-placement help in English and Chinese", () => {
    const english = enLocale.translation.customize;
    const chinese = zhLocale.translation.customize;
    expect(english.imagePlacementBoundaryHelp).toBe(
      "If you can’t move the image up or down enough, the area you want to display may not have enough space around it. Try zooming in, then try again.",
    );
    expect(chinese.imagePlacementBoundaryHelp).toBe(
      "如果圖片無法充分上下移動，可能是你想顯示的區域周圍沒有足夠空間。請嘗試放大圖片後再試一次。",
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
    expect(enLocale.translation.customize.buttonIdentifierContentTitle).toBe(
      "Show labels",
    );
    expect(enLocale.translation.customize.buttonIdentifierContentBoth).toBe(
      "Both",
    );
    expect(enLocale.translation.customize.buttonIdentifierContentIcon).toBe(
      "Icon",
    );
    expect(enLocale.translation.customize.buttonIdentifierContentNone).toBe(
      "None",
    );
    expect(enLocale.translation.customize.buttonIdentifierContentBothAccessibility)
      .toBe("Show icon and text");
    expect(enLocale.translation.customize.buttonIdentifierContentIconAccessibility)
      .toBe("Show icon only");
    expect(enLocale.translation.customize.buttonIdentifierContentNoneAccessibility)
      .toBe("Hide icon and text");
    expect(enLocale.translation.customize.buttonIdentifierOpacity).toBe(
      "Label intensity",
    );
    expect(enLocale.translation.customize.horizontalIdentifierPosition).toBe(
      "Horizontal label position",
    );
    expect(enLocale.translation.customize.verticalIdentifierPosition).toBe(
      "Vertical label position",
    );
    expect(enLocale.translation.customize.buttonAdjustmentImageTab).toBe(
      "Image",
    );
    expect(
      enLocale.translation.customize.buttonIdentifierAppearance,
    ).toBeTruthy();
    expect(
      enLocale.translation.customize.chooseButtonIdentifierColor,
    ).toBeTruthy();
    expect(enLocale.translation.customize.buttonIdentifierIntensity).toBe(
      "Intensity",
    );
    expect(enLocale.translation.customize.buttonIdentifierBackgroundLight).toBe(
      "Light",
    );
    expect(enLocale.translation.customize.buttonIdentifierBackgroundDark).toBe(
      "Dark",
    );
    expect(
      enLocale.translation.customize.buttonIdentifierBackgroundThemeChoice,
    ).toBeTruthy();
    expect(enLocale.translation.customize.buttonAdjustmentHorizontalTab).toBe(
      "Horiz.",
    );
    expect(enLocale.translation.customize.buttonAdjustmentVerticalTab).toBe(
      "Vert.",
    );
    expect(enLocale.translation.customize.buttonIdentifiersOn).toBe("On");
    expect(enLocale.translation.customize.buttonIdentifiersOff).toBe("Off");
    expect(zhLocale.translation.customize.buttonIdentifierContentTitle).toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifierContentBoth).toBe("全部");
    expect(zhLocale.translation.customize.buttonIdentifierContentIcon).toBe("圖示");
    expect(zhLocale.translation.customize.buttonIdentifierContentNone).toBe("無");
    expect(zhLocale.translation.customize.buttonIdentifierContentBothAccessibility)
      .toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifierContentIconAccessibility)
      .toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifierContentNoneAccessibility)
      .toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifierOpacity).toBeTruthy();
    expect(
      zhLocale.translation.customize.horizontalIdentifierPosition,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.verticalIdentifierPosition,
    ).toBeTruthy();
    expect(zhLocale.translation.customize.buttonAdjustmentImageTab).toBe(
      "圖片",
    );
    expect(
      zhLocale.translation.customize.buttonIdentifierAppearance,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.chooseButtonIdentifierColor,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.buttonIdentifierIntensity,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.buttonIdentifierBackgroundLight,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.buttonIdentifierBackgroundDark,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.buttonIdentifierBackgroundThemeChoice,
    ).toBeTruthy();
    expect(zhLocale.translation.customize.buttonAdjustmentHorizontalTab).toBe(
      "水平",
    );
    expect(zhLocale.translation.customize.buttonAdjustmentVerticalTab).toBe(
      "垂直",
    );
    expect(zhLocale.translation.customize.buttonIdentifiersOn).toBeTruthy();
    expect(zhLocale.translation.customize.buttonIdentifiersOff).toBeTruthy();
  });

  it("defines focused Button appearance inspector copy in both locales", () => {
    expect(enLocale.translation.customize.buttonAppearancePosition).toBe(
      "{{label}} · {{current}} of {{total}}",
    );
    expect(enLocale.translation.customize.buttonAppearancePreview).toBe(
      "{{label}} appearance preview",
    );
    expect(enLocale.translation.customize.buttonAppearanceOverallPreview).toBe(
      "Preview full layout",
    );
    expect(
      enLocale.translation.customize.buttonAppearanceOverallPreviewHint,
    ).toBeTruthy();
    expect(
      enLocale.translation.customize.buttonAppearanceOverallPreviewClose,
    ).toBe("Close full layout preview");
    expect(enLocale.translation.customize.buttonAppearancePrevious).toBe(
      "Previous Button",
    );
    expect(enLocale.translation.customize.buttonAppearanceNext).toBe(
      "Next Button",
    );
    expect(enLocale.translation.customize.buttonAppearanceUnavailable).toBe(
      "Button preview unavailable.",
    );
    expect(zhLocale.translation.customize.buttonAppearancePosition).toBe(
      "{{label}} · 第 {{current}} / {{total}} 個",
    );
    expect(zhLocale.translation.customize.buttonAppearancePreview).toBe(
      "{{label}} 外觀預覽",
    );
    expect(zhLocale.translation.customize.buttonAppearanceOverallPreview).toBe(
      "預覽完整版面",
    );
    expect(
      zhLocale.translation.customize.buttonAppearanceOverallPreviewHint,
    ).toBeTruthy();
    expect(
      zhLocale.translation.customize.buttonAppearanceOverallPreviewClose,
    ).toBe("關閉完整版面預覽");
    expect(zhLocale.translation.customize.buttonAppearancePrevious).toBe(
      "上一個按鈕",
    );
    expect(zhLocale.translation.customize.buttonAppearanceNext).toBe(
      "下一個按鈕",
    );
    expect(zhLocale.translation.customize.buttonAppearanceUnavailable).toBe(
      "無法顯示按鈕預覽。",
    );
    expect("buttonAppearanceBefore" in enLocale.translation.customize).toBe(
      false,
    );
    expect("buttonAppearanceNew" in enLocale.translation.customize).toBe(false);
    expect("buttonAppearanceBefore" in zhLocale.translation.customize).toBe(
      false,
    );
    expect("buttonAppearanceNew" in zhLocale.translation.customize).toBe(false);
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
    expect(english.snapStrengthTitle).toBe("Snap strength");
    expect(english.snapStrengthLow).toBe("Low");
    expect(english.snapStrengthBalanced).toBe("Balanced");
    expect(english.snapStrengthStrong).toBe("Strong");
    expect(chinese.buttonSelectionSubtitle).toBeTruthy();
    expect(chinese.buttonGridSubtitle).toBeTruthy();
    expect(chinese.buttonConfirmSubtitle).toBeTruthy();
    expect(chinese.buttonGridSheetSubtitle).toBeTruthy();
    expect(chinese.buttonPanelHelpBody).toBeTruthy();
    expect(chinese.buttonPanelHelpGood).toBeTruthy();
    expect(chinese.buttonPanelHelpBad).toBeTruthy();
    expect(chinese.snapStrengthTitle).toBe("吸附強度");
    expect(chinese.snapStrengthLow).toBe("低");
    expect(chinese.snapStrengthBalanced).toBe("平衡");
    expect(chinese.snapStrengthStrong).toBe("強");
    expect(english.customIconDialogTitle).toBeTruthy();
    expect(english.customIconDialogBody).toBeTruthy();
    expect(english.customIconStar).toBe("Star");
    expect(english.customIconZap).toBe("Zap");
    expect(english.customIconSparkles).toBe("Sparkles");
    expect(english.customIconCircle).toBe("Circle");
    expect(english.customIconMusic).toBe("Music");
    expect(english.customIconGamepad).toBe("Gamepad");
    expect(english.customIconGlobe).toBe("Globe");
    expect(english.customIconSliders).toBe("Sliders");
    expect(chinese.customIconDialogTitle).toBeTruthy();
    expect(chinese.customIconDialogBody).toBeTruthy();
    expect(chinese.customIconStar).toBeTruthy();
    expect(chinese.customIconZap).toBeTruthy();
    expect(chinese.customIconSparkles).toBeTruthy();
    expect(chinese.customIconCircle).toBeTruthy();
    expect(chinese.customIconMusic).toBeTruthy();
    expect(chinese.customIconGamepad).toBeTruthy();
    expect(chinese.customIconGlobe).toBeTruthy();
    expect(chinese.customIconSliders).toBeTruthy();
  });
});

describe("combined Advanced locale strings", () => {
  it("defines the same combined-mode keys in both locales", () => {
    const paths = [
      ["mode", "advancedCombined"],
      ["mode", "advancedCombinedDescription"],
      ["advancedCalibration", "combinedOuterSubtitle"],
      ["advancedCalibration", "combinedControlSelectionSubtitle"],
      ["advancedCalibration", "combinedButtonSelectionSubtitle"],
      ["advancedCalibration", "combinedGridSubtitle"],
      ["advancedCalibration", "combinedConfirmSubtitle"],
      ["advancedCalibration", "combinedGridSheetSubtitle"],
      ["errors", "selectCombinedControl"],
      ["errors", "selectCombinedButton"],
      ["errors", "combinedPanelOverlap"],
      ["errors", "invalidCombinedPanels"],
      ["preset", "combinedLabel"],
    ] as const;

    for (const [section, key] of paths) {
      const englishSection = (
        enLocale.translation as unknown as Record<
          string,
          Record<string, string>
        >
      )[section];
      const chineseSection = (
        zhLocale.translation as unknown as Record<
          string,
          Record<string, string>
        >
      )[section];
      expect(englishSection[key]).toBeTruthy();
      expect(chineseSection[key]).toBeTruthy();
    }
  });
});
