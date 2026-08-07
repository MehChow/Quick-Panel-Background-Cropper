import React from "react";
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

  it("aligns markers with the slider track and layers them above the bar", () => {
    render(
      <AdvancedSnapSensitivityControl
        value="balanced"
        onValueChange={jest.fn()}
      />,
    );

    const stops = screen.getByTestId("advanced-snap-sensitivity-stops");
    expect(stops.props.className).toContain("inset-x-0");
    expect(stops.props.className).not.toContain("inset-x-2");

    const trackChildren = React.Children.toArray(
      screen.getByTestId("advanced-snap-sensitivity-track").props.children,
    );
    expect(trackChildren[0]).toMatchObject({
      props: { testID: "advanced-snap-sensitivity-slider" },
    });
    expect(trackChildren[1]).toMatchObject({
      props: { testID: "advanced-snap-sensitivity-stops" },
    });
  });

  it.each([
    ["low", ["advanced-snap-sensitivity-stop-low"], [
      "advanced-snap-sensitivity-stop-balanced",
      "advanced-snap-sensitivity-stop-strong",
    ]],
    ["balanced", [
      "advanced-snap-sensitivity-stop-low",
      "advanced-snap-sensitivity-stop-balanced",
    ], ["advanced-snap-sensitivity-stop-strong"]],
    ["strong", [
      "advanced-snap-sensitivity-stop-low",
      "advanced-snap-sensitivity-stop-balanced",
      "advanced-snap-sensitivity-stop-strong",
    ], []],
  ] as const)("shows only future markers when %s is selected", (value, hiddenStops, visibleStops) => {
    render(
      <AdvancedSnapSensitivityControl
        value={value}
        onValueChange={jest.fn()}
      />,
    );

    hiddenStops.forEach((testID) => {
      expect(screen.getByTestId(testID).props.className).toContain("opacity-0");
    });
    visibleStops.forEach((testID) => {
      expect(screen.getByTestId(testID).props.className).not.toContain("opacity-0");
    });
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
