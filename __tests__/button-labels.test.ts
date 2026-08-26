import {
  createButtonFileNameSlugs,
  createButtonFileNames,
} from "@/features/quick-panel/model/button-export-names";
import {
  buttonLabelCatalog,
  customButtonIconChoices,
  getButtonDisplayLabel,
  getButtonIconName,
  isCustomButtonIconId,
  pinnedButtonLabelIds,
  searchButtonLabels,
} from "@/features/quick-panel/model/button-labels";
import lucideGlyphMap from "@react-native-vector-icons/lucide/glyphmaps/Lucide.json";
import en from "../i18next/locales/en";
import zh from "../i18next/locales/zh";

interface ButtonLabelTranslations {
  [id: string]: string;
}

function createTranslator(labels: ButtonLabelTranslations) {
  return (key: string) => labels[key.replace("buttonLabels.", "")] ?? key;
}

describe("button labels", () => {
  it("assigns a stable icon to every built-in label", () => {
    for (const item of buttonLabelCatalog) {
      expect(item.iconName).toBeTruthy();
      expect(getButtonIconName(item.label, null)).toBe(item.iconName);
    }
  });

  it("offers only the reviewed custom icon choices", () => {
    const customIconIds = customButtonIconChoices.map((choice) => choice.id);
    expect(customIconIds).toEqual([
      "zap",
      "star",
      "sparkles",
      "circle",
      "music",
      "gamepad-2",
      "globe",
      "sliders-horizontal",
      "heart",
      "bell",
      "bookmark",
      "briefcase-business",
      "calendar-days",
      "car",
      "cloud",
      "coffee",
      "gift",
      "key-round",
      "lightbulb",
      "palette",
      "rocket",
      "shield",
      "shopping-bag",
      "timer",
    ]);
    expect(new Set(customIconIds).size).toBe(24);
    const builtInIconNames = new Set<string>(
      buttonLabelCatalog.map((item) => item.iconName),
    );
    for (const choice of customButtonIconChoices) {
      expect(isCustomButtonIconId(choice.id)).toBe(true);
      expect(choice.id in lucideGlyphMap).toBe(true);
    }
    for (const iconId of customIconIds.slice(8)) {
      expect(builtInIconNames.has(iconId)).toBe(false);
    }
  });

  it("uses built-in icons regardless of a supplied custom icon", () => {
    expect(getButtonIconName("Wi-Fi", "star")).toBe("wifi");
  });

  it("accepts preset glyphs for custom Button labels", () => {
    for (const item of buttonLabelCatalog) {
      expect(isCustomButtonIconId(item.iconName)).toBe(true);
      expect(item.iconName in lucideGlyphMap).toBe(true);
    }
    expect(getButtonIconName("快速分享", "share-2")).toBe("share-2");
    expect(isCustomButtonIconId("not-a-lucide-button-icon")).toBe(false);
  });

  it("requires an icon for custom labels", () => {
    expect(() => getButtonIconName("My scene", null)).toThrow(
      "Custom Button My scene has no icon",
    );
    expect(getButtonIconName("My scene", "zap")).toBe("zap");
  });

  it("rejects invalid custom icon identifiers", () => {
    expect(isCustomButtonIconId("zap")).toBe(true);
    expect(isCustomButtonIconId("wifi")).toBe(true);
    expect(isCustomButtonIconId(undefined)).toBe(false);
  });

  it("keeps pinned labels first when search is empty", () => {
    expect(buttonLabelCatalog).toHaveLength(30);
    expect(
      searchButtonLabels("")
        .slice(0, pinnedButtonLabelIds.length)
        .map((item) => item.id),
    ).toEqual(pinnedButtonLabelIds);
  });

  it("searches labels with trimmed case-insensitive substrings", () => {
    expect(searchButtonLabels("  rotate ").map((item) => item.label)).toContain(
      "Auto-Rotate",
    );
    expect(searchButtonLabels("DATA").map((item) => item.label)).toContain(
      "Mobile Data",
    );
  });

  it("provides the reviewed English and Chinese button translations", () => {
    const enLabels = Reflect.get(
      en.translation,
      "buttonLabels",
    ) as ButtonLabelTranslations;
    const zhLabels = Reflect.get(
      zh.translation,
      "buttonLabels",
    ) as ButtonLabelTranslations;

    const translatedLabels = {
      bluetooth: "藍牙",
      "mobile-data": "流動數據",
      "flight-mode": "飛行模式",
      "mobile-hotspot": "流動熱點",
      location: "位置",
      "quick-share": "快速共享",
      "auto-rotate": "自動旋轉",
      "eye-comfort-shield": "護眼模式",
      "extra-dim": "額外調暗",
      "do-not-disturb": "請勿打擾",
      "live-caption": "即時字幕",
      flashlight: "手電筒",
      "power-saving": "省電模式",
      "screen-recorder": "螢幕錄影",
      "take-screenshot": "擷取螢幕截圖",
      "qr-code-scanner": "掃描 QR 碼",
      "performance-profile": "效能設定檔",
      "wireless-powershare": "無線電源共享",
      "camera-access": "相機存取",
      "microphone-access": "話筒存取",
      "secure-folder": "安全資料夾",
      modes: "模式",
      "link-to-windows": "連結至 Windows",
      "wireless-dex": "無線 DeX",
    };

    for (const item of buttonLabelCatalog) {
      expect(enLabels[item.id]).toBe(item.label);
      expect(item.translationKey).toBe(`buttonLabels.${item.id}`);
    }

    expect(zhLabels).toMatchObject(translatedLabels);
  });

  it("localizes built-in labels and preserves custom labels", () => {
    const zhLabels = Reflect.get(
      zh.translation,
      "buttonLabels",
    ) as ButtonLabelTranslations;
    const translateZh = createTranslator(zhLabels);

    expect(getButtonDisplayLabel("Bluetooth", translateZh)).toBe("藍牙");
    expect(getButtonDisplayLabel("My custom tile", translateZh)).toBe(
      "My custom tile",
    );
  });

  it("searches canonical and localized labels", () => {
    const zhLabels = Reflect.get(
      zh.translation,
      "buttonLabels",
    ) as ButtonLabelTranslations;
    const translateZh = createTranslator(zhLabels);

    expect(
      searchButtonLabels("Bluetooth", translateZh).map((item) => item.label),
    ).toContain("Bluetooth");
    expect(
      searchButtonLabels("藍牙", translateZh).map((item) => item.label),
    ).toContain("Bluetooth");
  });

  it("creates ordered slugged file names with duplicate suffixes", () => {
    expect(createButtonFileNames(["Wi-Fi", "Wi-Fi", "Custom Label!"])).toEqual([
      "01-wi-fi.png",
      "02-wi-fi-2.png",
      "03-custom-label.png",
    ]);
  });

  it("creates reusable duplicate-safe filename slugs", () => {
    expect(createButtonFileNameSlugs(["Wi-Fi", "Wi-Fi", "!!!"])).toEqual([
      "wi-fi",
      "wi-fi-2",
      "button",
    ]);
  });
});
