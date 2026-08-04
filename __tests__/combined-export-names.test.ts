import { createCombinedPanelFileNames } from "@/features/quick-panel/model/combined-export-names";
import {
  createButtonFileNameSlugs,
  createButtonFileNames,
} from "@/features/quick-panel/model/button-export-names";

describe("combined export names", () => {
  it("prefixes Controls and Buttons with one contiguous sequence", () => {
    expect(createCombinedPanelFileNames(
      ["buttonBox", "brightness"],
      ["Wi-Fi", "Wi-Fi", "My Scene"],
    )).toEqual([
      "01-control-button-box.png",
      "02-control-brightness.png",
      "03-button-wi-fi.png",
      "04-button-wi-fi-2.png",
      "05-button-my-scene.png",
    ]);
  });

  it("falls back to button for punctuation-only labels and renumbers after disabled Controls", () => {
    expect(createCombinedPanelFileNames([], ["!!!"])).toEqual([
      "01-button-button.png",
    ]);
    expect(createCombinedPanelFileNames(["buttonBox", "volume"], ["Wi-Fi"])).toEqual([
      "01-control-button-box.png",
      "02-control-volume.png",
      "03-button-wi-fi.png",
    ]);
  });

  it("exposes duplicate-safe slugs without changing the existing filename API", () => {
    expect(createButtonFileNameSlugs(["Wi-Fi", "Wi-Fi", "Custom Label!"])).toEqual([
      "wi-fi",
      "wi-fi-2",
      "custom-label",
    ]);
    expect(createButtonFileNames(["Wi-Fi", "Wi-Fi", "Custom Label!"])).toEqual([
      "01-wi-fi.png",
      "02-wi-fi-2.png",
      "03-custom-label.png",
    ]);
  });
});
