import { createButtonFileNames } from "@/features/quick-panel/model/button-export-names";
import {
  buttonLabelCatalog,
  getButtonDisplayLabel,
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
  it("keeps pinned labels first when search is empty", () => {
    expect(buttonLabelCatalog).toHaveLength(60);
    expect(searchButtonLabels("").slice(0, pinnedButtonLabelIds.length).map((item) => item.id)).toEqual(
      pinnedButtonLabelIds,
    );
  });

  it("searches labels with trimmed case-insensitive substrings", () => {
    expect(searchButtonLabels("  rotate ").map((item) => item.label)).toContain("Auto rotate");
    expect(searchButtonLabels("DATA").map((item) => item.label)).toContain("Mobile data");
  });

  it("provides English and Chinese translations for every built-in label", () => {
    const enLabels = Reflect.get(en.translation, "buttonLabels") as ButtonLabelTranslations;
    const zhLabels = Reflect.get(zh.translation, "buttonLabels") as ButtonLabelTranslations;

    for (const item of buttonLabelCatalog) {
      expect(enLabels[item.id]).toBe(item.label);
      expect(zhLabels[item.id]).toBeTruthy();
      expect(item.translationKey).toBe(`buttonLabels.${item.id}`);
    }
  });

  it("localizes built-in labels and preserves custom labels", () => {
    const zhLabels = Reflect.get(zh.translation, "buttonLabels") as ButtonLabelTranslations;
    const translateZh = createTranslator(zhLabels);

    expect(getButtonDisplayLabel("Bluetooth", translateZh)).toBe("藍牙");
    expect(getButtonDisplayLabel("My custom tile", translateZh)).toBe("My custom tile");
  });

  it("searches canonical and localized labels", () => {
    const zhLabels = Reflect.get(zh.translation, "buttonLabels") as ButtonLabelTranslations;
    const translateZh = createTranslator(zhLabels);

    expect(searchButtonLabels("Bluetooth", translateZh).map((item) => item.label)).toContain("Bluetooth");
    expect(searchButtonLabels("藍牙", translateZh).map((item) => item.label)).toContain("Bluetooth");
  });

  it("creates ordered slugged file names with duplicate suffixes", () => {
    expect(createButtonFileNames(["Wi-Fi", "Wi-Fi", "Custom Label!"])).toEqual([
      "01-wi-fi.png",
      "02-wi-fi-2.png",
      "03-custom-label.png",
    ]);
  });
});
