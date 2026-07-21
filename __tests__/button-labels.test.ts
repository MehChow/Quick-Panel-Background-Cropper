import { createButtonFileNames } from "@/features/quick-panel/model/button-export-names";
import {
  buttonLabelCatalog,
  customButtonIconChoices,
  getButtonDisplayLabel,
  getButtonIconName,
  isCustomButtonIconId,
  pinnedButtonLabelIds,
  searchButtonLabels,
} from "@/features/quick-panel/model/button-labels";
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
    expect(customButtonIconChoices.map((choice) => choice.id)).toEqual([
      "star",
      "zap",
      "home",
      "app-window",
    ]);
  });

  it("uses built-in icons regardless of a supplied custom icon", () => {
    expect(getButtonIconName("Wi-Fi", "star")).toBe("wifi");
  });

  it("requires an icon for custom labels", () => {
    expect(() => getButtonIconName("My scene", null)).toThrow(
      "Custom Button My scene has no icon",
    );
    expect(getButtonIconName("My scene", "zap")).toBe("zap");
  });

  it("rejects invalid custom icon identifiers", () => {
    expect(isCustomButtonIconId("zap")).toBe(true);
    expect(isCustomButtonIconId("wifi")).toBe(false);
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
});
