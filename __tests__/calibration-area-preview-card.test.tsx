import { CalibrationAreaPreviewCard } from "@/features/quick-panel/calibration/advanced/components/CalibrationAreaPreviewCard";
import { render } from "@testing-library/react-native";
import type { ComponentProps } from "react";
import { createRef } from "react";
import { StyleSheet, View } from "react-native";

jest.mock("expo-image", () => {
  const { View: MockImage } = jest.requireActual("react-native");

  return {
    Image: (props: ComponentProps<typeof View>) => <MockImage {...props} />,
  };
});

describe("CalibrationAreaPreviewCard", () => {
  it("clips the full preview size without letting its frame change geometry", () => {
    const screen = render(
      <CalibrationAreaPreviewCard
        cardRef={createRef<View>()}
        crop={{
          height: 220,
          radius: 0,
          width: 1000,
          x: 40,
          y: 300,
        }}
        previewSize={{
          height: 61.6,
          scale: 0.28,
          width: 280,
        }}
        screenshot={{
          height: 2340,
          uri: "file:///quick-panel.png",
          width: 1080,
        }}
      />,
    );

    const wrapper = screen.getByTestId("calibration-area-preview-card");
    const clippingSurface = screen.getByTestId(
      "calibration-area-preview-clip",
    );
    const image = screen.getByTestId("calibration-area-preview-image");
    const frame = screen.getByTestId("calibration-area-preview-frame");

    expect(StyleSheet.flatten(wrapper.props.style)).toEqual({
      height: 61.6,
      width: 280,
    });
    expect(StyleSheet.flatten(clippingSurface.props.style)).toEqual({
      height: 61.6,
      width: 280,
    });
    expect(
      StyleSheet.flatten(clippingSurface.props.style).borderWidth,
    ).toBeUndefined();
    expect(clippingSurface.props.className).toContain("overflow-hidden");

    const imageStyle = StyleSheet.flatten(image.props.style);
    expect(imageStyle.height).toBeCloseTo(655.2);
    expect(imageStyle.left).toBeCloseTo(-11.2);
    expect(imageStyle.top).toBeCloseTo(-84);
    expect(imageStyle.width).toBeCloseTo(302.4);

    expect(frame.props.className).toContain("absolute inset-0");
    expect(frame.props.className).toContain("border-2");
    expect(frame.props.className).toContain("border-emerald-300");
    expect(frame.props.pointerEvents).toBe("none");
  });
});
