import { ButtonCustomizeControls } from "@/features/quick-panel/customize/components/ButtonCustomizeControls";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("@/components/ani-ui/slider", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    Slider: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  buttonIdentifierOpacity: 70,
  buttonPanelOpacity: 78,
  onButtonIdentifierOpacityChange: jest.fn(),
  onButtonPanelOpacityChange: jest.fn(),
  onShowButtonIdentifiersChange: jest.fn(),
  showButtonIdentifiers: true,
};

describe("ButtonCustomizeControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps image intensity and enabled identifier intensity independent", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    expect(screen.getByTestId("button-panel-opacity-slider").props.value).toBe(78);
    expect(screen.getByTestId("button-identifier-opacity-slider").props).toMatchObject({
      disabled: false,
      value: 70,
    });
    expect(screen.getByRole("switch").props.accessibilityState).toEqual({
      checked: true,
    });
  });

  it("requests hiding identifiers from the switch", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    fireEvent.press(screen.getByRole("switch"));

    expect(baseProps.onShowButtonIdentifiersChange).toHaveBeenCalledWith(false);
  });

  it("keeps the identifier slider mounted, disabled, and dimmed while off", () => {
    const screen = render(
      <ButtonCustomizeControls {...baseProps} showButtonIdentifiers={false} />,
    );

    expect(screen.getByTestId("button-identifier-opacity-slider").props).toMatchObject({
      disabled: true,
      value: 70,
    });
    expect(
      screen.getByTestId("button-identifier-opacity-control").props.className,
    ).toContain("opacity-50");
  });
});
