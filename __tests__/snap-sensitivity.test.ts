import {
  defaultSnapSensitivity,
  getSnapSensitivityFromSliderValue,
  getSnapSensitivityMultiplier,
  getSnapSensitivitySliderValue,
  normalizeSnapSensitivity,
  snapSensitivityValues,
} from "@/features/quick-panel/model/snap-sensitivity";

describe("snap sensitivity", () => {
  it("defines exactly three ordered positions with Balanced in the middle", () => {
    expect(snapSensitivityValues).toEqual(["low", "balanced", "strong"]);
    expect(defaultSnapSensitivity).toBe("balanced");
    expect(getSnapSensitivitySliderValue("low")).toBe(0);
    expect(getSnapSensitivitySliderValue("balanced")).toBe(1);
    expect(getSnapSensitivitySliderValue("strong")).toBe(2);
  });

  it("maps slider input to the nearest fixed position", () => {
    expect(getSnapSensitivityFromSliderValue(0.1)).toBe("low");
    expect(getSnapSensitivityFromSliderValue(0.8)).toBe("balanced");
    expect(getSnapSensitivityFromSliderValue(1.9)).toBe("strong");
  });

  it("uses the approved multipliers", () => {
    expect(getSnapSensitivityMultiplier("low")).toBe(0.5);
    expect(getSnapSensitivityMultiplier("balanced")).toBe(1);
    expect(getSnapSensitivityMultiplier("strong")).toBe(1.5);
  });

  it.each([undefined, null, "", "off", 1, {}])(
    "normalizes invalid value %p to Balanced",
    (value) => {
      expect(normalizeSnapSensitivity(value)).toBe("balanced");
    },
  );
});
