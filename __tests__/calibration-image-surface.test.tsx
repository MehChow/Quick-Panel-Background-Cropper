import { CalibrationImageSurface } from "@/features/quick-panel/calibration/shared/CalibrationImageSurface";
import { render, within } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

jest.mock("expo-image", () => {
  const { View: MockImage } = jest.requireActual("react-native");

  return {
    Image: (props: ComponentProps<typeof View>) => <MockImage {...props} />,
  };
});

describe("CalibrationImageSurface", () => {
  it("keeps image coordinates independent from decorative frames", () => {
    const renderOverlay = jest.fn(() => (
      <View testID="calibration-selection-overlay" />
    ));
    const screen = render(
      <CalibrationImageSurface
        canvasHeight={780}
        canvasWidth={360}
        renderOverlay={renderOverlay}
        scale={1 / 3}
        screenshot={{
          height: 2340,
          uri: "file:///quick-panel.png",
          width: 1080,
        }}
      />,
    );

    const wrapper = screen.getByTestId("calibration-image-wrapper");
    const coordinateSurface = screen.getByTestId(
      "calibration-coordinate-surface",
    );
    const image = screen.getByTestId("calibration-screenshot-image");
    const outerFrame = screen.getByTestId("calibration-outer-frame");
    const innerFrame = screen.getByTestId("calibration-inner-frame");

    expect(StyleSheet.flatten(wrapper.props.style)).toMatchObject({
      height: 780,
      width: 360,
    });
    expect(wrapper.props.className).toContain("rounded-[28px]");
    expect(wrapper.props.className).toContain("bg-black");
    expect(StyleSheet.flatten(wrapper.props.style).borderWidth).toBeUndefined();
    expect(StyleSheet.flatten(coordinateSurface.props.style)).toMatchObject({
      height: 780,
      width: 360,
    });
    expect(
      StyleSheet.flatten(coordinateSurface.props.style).borderWidth,
    ).toBeUndefined();
    expect(StyleSheet.flatten(image.props.style)).toEqual({
      height: "100%",
      width: "100%",
    });
    expect(renderOverlay).toHaveBeenCalledWith(1 / 3);
    expect(
      within(coordinateSurface).getByTestId("calibration-screenshot-image"),
    ).toBeTruthy();
    expect(
      within(coordinateSurface).getByTestId("calibration-selection-overlay"),
    ).toBeTruthy();

    expect(outerFrame.props.pointerEvents).toBe("none");
    expect(innerFrame.props.pointerEvents).toBe("none");
    expect(outerFrame.props.className).toContain("absolute inset-0");
    expect(innerFrame.props.className).toContain("absolute");
    expect(StyleSheet.flatten(outerFrame.props.style).borderWidth).toBe(1.5);
    expect(StyleSheet.flatten(innerFrame.props.style)).toMatchObject({
      borderWidth: 1,
      bottom: 1.5,
      left: 1.5,
      right: 1.5,
      top: 1.5,
    });
  });
});
