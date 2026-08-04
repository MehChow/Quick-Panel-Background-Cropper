import {
  ButtonCustomizeControls,
  getButtonIdentifierColorButtonStyle,
} from "@/features/quick-panel/customize/components/ButtonCustomizeControls";
import { act, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

jest.mock("@/components/ani-ui/slider", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return { Slider: (props: Record<string, unknown>) => React.createElement(View, props) };
});
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: { color?: string }) =>
      values?.color ? `${key} ${values.color}` : key,
  }),
}));
jest.mock("@react-native-vector-icons/lucide", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return { Lucide: (props: Record<string, unknown>) => React.createElement(Text, props) };
});

const baseProps = {
  buttonIdentifierBackgroundTheme: "dark" as const,
  buttonIdentifierColor: "#1A2B3C",
  buttonPanelOpacity: 78,
  hasHorizontalButtons: true,
  hasVerticalButtons: true,
  horizontalIdentifierPosition: 50,
  onButtonPanelOpacityChange: jest.fn(),
  onButtonPanelOpacityCommit: jest.fn(),
  onHorizontalIdentifierPositionChange: jest.fn(),
  onHorizontalIdentifierPositionCommit: jest.fn(),
  onOpenButtonIdentifierAppearance: jest.fn(),
  onShowButtonIdentifiersChange: jest.fn(),
  onVerticalIdentifierPositionChange: jest.fn(),
  onVerticalIdentifierPositionCommit: jest.fn(),
  showButtonIdentifiers: true,
  verticalIdentifierPosition: 50,
};

describe("ButtonCustomizeControls", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows Image and available position tabs without Labels", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    expect(
      screen.getByTestId("button-adjustment-image-tab").props.accessibilityState,
    ).toEqual({ disabled: false, selected: true });
    expect(
      screen.getByTestId("button-adjustment-image-tab").props.className,
    ).toContain("bg-black");
    expect(
      screen.getByText("customize.buttonAdjustmentImageTab").props.className,
    ).toContain("text-white");
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
    expect(screen.getByTestId("button-adjustment-horizontal-tab")).toBeTruthy();
    expect(screen.getByTestId("button-adjustment-vertical-tab")).toBeTruthy();
    expect(screen.queryByTestId("button-adjustment-identifier-tab")).toBeNull();

    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
    expect(
      screen.getByTestId("button-adjustment-image-tab").props.className,
    ).not.toContain("bg-black");
  });

  it("opens appearance from a committed-color swatch", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);
    const trigger = screen.getByTestId("button-identifier-color-trigger");
    expect(trigger.props.accessibilityLabel).toContain("#1A2B3C");
    expect(trigger.props.className).toContain("h-11");
    expect(StyleSheet.flatten(trigger.props.style)).toMatchObject({
      backgroundColor: "#1A2B3C",
    });
    expect(screen.getByTestId("button-identifier-color-icon").props.color)
      .toBe("#666666");
    fireEvent.press(trigger);
    expect(baseProps.onOpenButtonIdentifierAppearance).toHaveBeenCalledTimes(1);
  });

  it("dims and disables the swatch while labels are hidden", () => {
    const screen = render(
      <ButtonCustomizeControls {...baseProps} showButtonIdentifiers={false} />,
    );
    const trigger = screen.getByTestId("button-identifier-color-trigger");
    expect(trigger.props.accessibilityState).toEqual({ disabled: true });
    expect(getButtonIdentifierColorButtonStyle(false, true)).toEqual({ opacity: 0.45 });
    fireEvent.press(trigger);
    expect(baseProps.onOpenButtonIdentifierAppearance).not.toHaveBeenCalled();
  });

  it("returns to Image when labels are hidden", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);
    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
    screen.rerender(
      <ButtonCustomizeControls {...baseProps} showButtonIdentifiers={false} />,
    );
    expect(screen.getByTestId("button-adjustment-image-tab").props.accessibilityState)
      .toMatchObject({ selected: true });
  });

  it("routes each slider completion to its matching persistence callback", () => {
    const screen = render(<ButtonCustomizeControls {...baseProps} />);

    act(() =>
      screen
        .getByTestId("button-panel-opacity-slider")
        .props.onSlidingComplete(64),
    );
    expect(baseProps.onButtonPanelOpacityCommit).toHaveBeenCalledWith(64);

    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
    act(() =>
      screen
        .getByTestId("horizontal-identifier-position-slider")
        .props.onSlidingComplete(24),
    );
    expect(baseProps.onHorizontalIdentifierPositionCommit).toHaveBeenCalledWith(24);

    fireEvent.press(screen.getByTestId("button-adjustment-vertical-tab"));
    act(() =>
      screen
        .getByTestId("vertical-identifier-position-slider")
        .props.onSlidingComplete(76),
    );
    expect(baseProps.onVerticalIdentifierPositionCommit).toHaveBeenCalledWith(76);
  });
});
