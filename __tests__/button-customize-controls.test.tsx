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
  hasHorizontalButtons: true,
  hasVerticalButtons: true,
  horizontalIdentifierPosition: 50,
  onButtonIdentifierOpacityChange: jest.fn(),
  onButtonPanelOpacityChange: jest.fn(),
  onHorizontalIdentifierPositionChange: jest.fn(),
  onShowButtonIdentifiersChange: jest.fn(),
  onVerticalIdentifierPositionChange: jest.fn(),
  showButtonIdentifiers: true,
  verticalIdentifierPosition: 50,
};

describe("ButtonCustomizeControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts on image intensity with one active slider", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    expect(
      screen.getByTestId("button-adjustment-image-tab").props.accessibilityState,
    ).toEqual({ disabled: false, selected: true });
    expect(screen.getByTestId("button-panel-opacity-slider").props).toMatchObject({
      disabled: false,
      value: 78,
    });
    expect(screen.queryByTestId("button-identifier-opacity-slider")).toBeNull();
    expect(
      screen.queryByTestId("horizontal-identifier-position-slider"),
    ).toBeNull();
    expect(
      screen.queryByTestId("vertical-identifier-position-slider"),
    ).toBeNull();
  });

  it("routes the shared slider through each selected adjustment tab", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    fireEvent.press(screen.getByTestId("button-adjustment-identifier-tab"));
    expect(screen.getByTestId("button-identifier-opacity-slider").props).toMatchObject({
      disabled: false,
      onValueChange: baseProps.onButtonIdentifierOpacityChange,
      value: 70,
    });

    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
    expect(
      screen.getByTestId("horizontal-identifier-position-slider").props,
    ).toMatchObject({
      onValueChange: baseProps.onHorizontalIdentifierPositionChange,
      value: 50,
    });

    fireEvent.press(screen.getByTestId("button-adjustment-vertical-tab"));
    expect(
      screen.getByTestId("vertical-identifier-position-slider").props,
    ).toMatchObject({
      onValueChange: baseProps.onVerticalIdentifierPositionChange,
      value: 50,
    });
  });

  it("only renders position tabs for orientations in the preset", () => {
    const screen = render(
      <ButtonCustomizeControls {...baseProps} hasHorizontalButtons={false} />,
    );

    expect(screen.queryByTestId("button-adjustment-horizontal-tab")).toBeNull();
    expect(screen.getByTestId("button-adjustment-vertical-tab")).toBeTruthy();

    screen.rerender(
      <ButtonCustomizeControls {...baseProps} hasVerticalButtons={false} />,
    );
    expect(screen.getByTestId("button-adjustment-horizontal-tab")).toBeTruthy();
    expect(screen.queryByTestId("button-adjustment-vertical-tab")).toBeNull();
  });

  it("requests hiding identifiers from the switch", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    fireEvent.press(screen.getByRole("switch"));

    expect(baseProps.onShowButtonIdentifiersChange).toHaveBeenCalledWith(false);
  });

  it("returns to image when identifiers are hidden from a position tab", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);
    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));

    expect(
      screen.getByTestId("button-adjustment-horizontal-tab").props
        .accessibilityState,
    ).toEqual({ disabled: false, selected: true });

    screen.rerender(
      <ButtonCustomizeControls {...baseProps} showButtonIdentifiers={false} />,
    );

    expect(
      screen.getByTestId("button-adjustment-image-tab").props
        .accessibilityState,
    ).toMatchObject({ disabled: false, selected: true });
    expect(screen.getByTestId("button-panel-opacity-slider").props).toMatchObject({
      disabled: false,
      value: 78,
    });
    expect(
      screen.getByTestId("button-adjustment-identifier-tab").props
        .accessibilityState,
    ).toMatchObject({ disabled: true, selected: false });
    expect(
      screen.getByTestId("button-adjustment-horizontal-tab").props
        .accessibilityState,
    ).toMatchObject({ disabled: true, selected: false });
    expect(
      screen.getByTestId("button-adjustment-vertical-tab").props
        .accessibilityState,
    ).toMatchObject({ disabled: true, selected: false });
    expect(
      screen.queryByTestId("horizontal-identifier-position-slider"),
    ).toBeNull();

    screen.rerender(<ButtonCustomizeControls {...baseProps} />);
    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
    expect(
      screen.getByTestId("horizontal-identifier-position-slider").props.value,
    ).toBe(50);
  });
});
