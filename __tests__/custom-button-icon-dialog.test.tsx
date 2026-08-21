import { CustomButtonIconDialog } from "@/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog";
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

    fireEvent.press(screen.getByLabelText("Zap"));

    expect(onSelect).toHaveBeenCalledWith("zap");
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

  it("renders every accessible choice in a bounded scroll grid", () => {
    const onSelect = jest.fn();
    const screen = render(
      <CustomButtonIconDialog
        label="My scene"
        onClose={jest.fn()}
        onSelect={onSelect}
        open
      />,
    );

    for (const label of Object.values(iconLabels)) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }

    fireEvent.press(screen.getByLabelText("Timer"));

    expect(onSelect).toHaveBeenCalledWith("timer");
    expect(screen.getByTestId("custom-button-icon-grid").props.style).toEqual(
      expect.objectContaining({ maxHeight: expect.any(Number) }),
    );
  });
});
