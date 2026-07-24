import { CustomButtonIconDialog } from "@/features/quick-panel/calibration/advanced/components/CustomButtonIconDialog";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      "advancedCalibration.customIconDialogTitle": "Choose an icon",
      "advancedCalibration.customIconDialogBody": "Choose an icon for My scene",
      "advancedCalibration.customIconStar": "Star",
      "advancedCalibration.customIconZap": "Zap",
      "advancedCalibration.customIconHome": "Home",
      "advancedCalibration.customIconAppWindow": "App Window",
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
});
