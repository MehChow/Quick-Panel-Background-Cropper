import { CustomButtonIconDialog } from "@/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog";
import {
  buttonLabelCatalog,
  customButtonIconChoices,
} from "@/features/quick-panel/model/button-labels";
import { fireEvent, render } from "@testing-library/react-native";

const iconLabels: Record<string, string> = {
  "advancedCalibration.customIconZap": "Zap",
  "advancedCalibration.customIconStar": "Star",
  "advancedCalibration.customIconSparkles": "Sparkles",
  "advancedCalibration.customIconCircle": "Circle",
  "advancedCalibration.customIconMusic": "Music",
  "advancedCalibration.customIconGamepad": "Gamepad",
  "advancedCalibration.customIconGlobe": "Globe",
  "advancedCalibration.customIconSliders": "Sliders",
  "advancedCalibration.customIconHeart": "Heart",
  "advancedCalibration.customIconBell": "Bell",
  "advancedCalibration.customIconBookmark": "Bookmark",
  "advancedCalibration.customIconBriefcase": "Briefcase",
  "advancedCalibration.customIconCalendar": "Calendar",
  "advancedCalibration.customIconCar": "Car",
  "advancedCalibration.customIconCloud": "Cloud",
  "advancedCalibration.customIconCoffee": "Coffee",
  "advancedCalibration.customIconGift": "Gift",
  "advancedCalibration.customIconKey": "Key",
  "advancedCalibration.customIconLightbulb": "Lightbulb",
  "advancedCalibration.customIconPalette": "Palette",
  "advancedCalibration.customIconRocket": "Rocket",
  "advancedCalibration.customIconShield": "Shield",
  "advancedCalibration.customIconShoppingBag": "Shopping Bag",
  "advancedCalibration.customIconTimer": "Timer",
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      "advancedCalibration.customIconPresetTab": "Preset buttons",
      "advancedCalibration.customIconOtherTab": "Other icons",
      "advancedCalibration.customIconDialogTitle": "Choose an icon",
      "advancedCalibration.customIconDialogBody": "Choose an icon for My scene",
      ...iconLabels,
      "common.cancel": "Cancel",
    })[key] ?? key,
  }),
}));

describe("CustomButtonIconDialog", () => {
  it("returns the selected accessible icon choice", () => {
    const onSelect = jest.fn();
    const screen = render(
      <CustomButtonIconDialog
        label="My scene"
        onClose={jest.fn()}
        onSelect={onSelect}
        open
      />,
    );

    expect(screen.getByText("Choose an icon").props.className).toContain(
      "text-white",
    );

    fireEvent.press(screen.getByLabelText("buttonLabels.wi-fi"));

    expect(onSelect).toHaveBeenCalledWith("wifi");
    expect(screen.queryByText("buttonLabels.wi-fi")).toBeNull();
  });

  it("closes without selecting when canceled", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const screen = render(
      <CustomButtonIconDialog
        label="My scene"
        onClose={onClose}
        onSelect={onSelect}
        open
      />,
    );

    fireEvent.press(screen.getByText("Cancel"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders both catalogs and resets to presets for a new label", () => {
    const onSelect = jest.fn();
    const rendered = render(
      <CustomButtonIconDialog
        label="My scene"
        onClose={jest.fn()}
        onSelect={onSelect}
        open
      />,
    );

    for (const item of buttonLabelCatalog) {
      expect(rendered.getByLabelText(item.translationKey)).toBeTruthy();
    }
    expect(
      rendered.queryByLabelText(customButtonIconChoices[0].translationKey),
    ).toBeNull();

    fireEvent.press(rendered.getByRole("tab", { name: "Other icons" }));

    for (const item of customButtonIconChoices) {
      expect(rendered.getByLabelText(iconLabels[item.translationKey])).toBeTruthy();
    }

    fireEvent.press(rendered.getByLabelText("Timer"));
    expect(onSelect).toHaveBeenCalledWith("timer");

    rendered.rerender(
      <CustomButtonIconDialog
        label="Another scene"
        onClose={jest.fn()}
        onSelect={onSelect}
        open
      />,
    );

    expect(rendered.getByLabelText("buttonLabels.wi-fi")).toBeTruthy();
    expect(rendered.queryByLabelText("Timer")).toBeNull();

    expect(rendered.getByTestId("preset-button-icon-grid").props.style).toEqual(
      expect.objectContaining({ maxHeight: expect.any(Number) }),
    );
  });

  it("keeps the final row tiles in equal-width grid slots", () => {
    const screen = render(
      <CustomButtonIconDialog
        label="My scene"
        onClose={jest.fn()}
        onSelect={jest.fn()}
        open
      />,
    );

    const tiles = screen
      .getAllByRole("button")
      .filter((tile) => tile.props.accessibilityLabel?.startsWith("buttonLabels."));

    expect(tiles).toHaveLength(30);
    expect(tiles.slice(-2).every((tile) => tile.props.className.includes("w-full")))
      .toBe(true);
  });
});
