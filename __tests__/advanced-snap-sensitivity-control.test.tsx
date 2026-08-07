import { AdvancedSnapSensitivityControl } from "@/features/quick-panel/calibration/advanced/components/AdvancedSnapSensitivityControl";
import { fireEvent, render, screen } from "@testing-library/react-native";

jest.mock("@/components/ani-ui/slider", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    Slider: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("AdvancedSnapSensitivityControl", () => {
  it("renders the three named stops with Balanced selected", () => {
    render(
      <AdvancedSnapSensitivityControl
        value="balanced"
        onValueChange={jest.fn()}
      />,
    );

    expect(screen.getByText("advancedCalibration.snapStrengthLow")).toBeTruthy();
    expect(screen.getByText("advancedCalibration.snapStrengthBalanced")).toBeTruthy();
    expect(screen.getByText("advancedCalibration.snapStrengthStrong")).toBeTruthy();
    expect(screen.getByTestId("advanced-snap-sensitivity-slider").props).toMatchObject({
      min: 0,
      max: 2,
      step: 1,
      value: 1,
    });
    expect(screen.getByTestId("advanced-snap-sensitivity-stop-low")).toBeTruthy();
    expect(screen.getByTestId("advanced-snap-sensitivity-stop-balanced")).toBeTruthy();
    expect(screen.getByTestId("advanced-snap-sensitivity-stop-strong")).toBeTruthy();
  });

  it.each([
    [0, "low"],
    [1, "balanced"],
    [2, "strong"],
  ] as const)("maps slider stop %s to %s", (sliderValue, expected) => {
    const onValueChange = jest.fn();
    render(
      <AdvancedSnapSensitivityControl
        value="balanced"
        onValueChange={onValueChange}
      />,
    );

    fireEvent(
      screen.getByTestId("advanced-snap-sensitivity-slider"),
      "valueChange",
      sliderValue,
    );
    expect(onValueChange).toHaveBeenCalledWith(expected);
  });
});
