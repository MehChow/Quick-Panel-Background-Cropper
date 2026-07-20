import { CustomizeActions } from "@/features/quick-panel/customize/components/CustomizeActions";
import { fireEvent, render, within } from "@testing-library/react-native";

jest.mock("react-i18next", () => ({
  initReactI18next: { init: jest.fn(), type: "3rdParty" },
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@react-native-vector-icons/lucide", () => ({ Lucide: () => null }));

const commonProps = {
  canReset: true,
  isExporting: false,
  isProcessingImage: false,
  onExport: jest.fn(),
  onPick: jest.fn(),
  onReset: jest.fn(),
};

describe("CustomizeActions source context", () => {
  it("keeps image selection and the square eye toggle in the first footer row", () => {
    const onShowSourceImageContextChange = jest.fn();
    const screen = render(
      <CustomizeActions
        {...commonProps}
        onShowSourceImageContextChange={onShowSourceImageContextChange}
        showSourceImageContext
      />,
    );
    const firstRow = screen.getByTestId("customize-image-source-actions");
    const imageButton = within(firstRow).getByRole("button", {
      name: "customize.chooseAnotherImage",
    });
    const eyeButton = within(firstRow).getByLabelText(
      "customize.hideSourceImageContext",
    );

    expect(firstRow.props.className).toContain("flex-row gap-3");
    expect(imageButton.props.className).toContain("flex-1");
    expect(eyeButton.props.className).toContain("h-12 w-12");
    expect(eyeButton.props.accessibilityState).toEqual({ selected: true });

    fireEvent.press(eyeButton);
    expect(onShowSourceImageContextChange).toHaveBeenCalledWith(false);

    screen.rerender(
      <CustomizeActions
        {...commonProps}
        onShowSourceImageContextChange={onShowSourceImageContextChange}
        showSourceImageContext={false}
      />,
    );
    const showButton = screen.getByLabelText(
      "customize.showSourceImageContext",
    );
    expect(showButton.props.accessibilityState).toEqual({ selected: false });
    fireEvent.press(showButton);
    expect(onShowSourceImageContextChange).toHaveBeenLastCalledWith(true);
  });

  it.each([
    ["export", { isExporting: true, isProcessingImage: false }],
    ["image processing", { isExporting: false, isProcessingImage: true }],
  ])("disables both first-row actions during %s", (_label, busyProps) => {
    const screen = render(
      <CustomizeActions
        {...commonProps}
        {...busyProps}
        onShowSourceImageContextChange={jest.fn()}
        showSourceImageContext
      />,
    );
    const firstRow = screen.getByTestId("customize-image-source-actions");

    expect(
      within(firstRow).getByRole("button", {
        name:
          busyProps.isProcessingImage
            ? "customize.optimizingImage"
            : "customize.chooseAnotherImage",
      }).props.accessibilityState.disabled,
    ).toBe(true);
    expect(
      within(firstRow).getByLabelText("customize.hideSourceImageContext").props
        .accessibilityState.disabled,
    ).toBe(true);
  });
});
