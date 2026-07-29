import { AnimatedButtonIdentifierVisuals } from "@/features/quick-panel/customize/components/AnimatedButtonIdentifierVisuals";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";

jest.mock("@react-native-vector-icons/lucide", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    Lucide: (props: Record<string, unknown>) =>
      React.createElement(Text, { ...props, testID: "mock-lucide" }),
  };
});

function CornerVisuals() {
  const circleColor = useSharedValue("#666666");
  const color = useSharedValue("#E3FFF6");
  const opacity = useSharedValue(0.7);
  return (
    <AnimatedButtonIdentifierVisuals
      appearance={{ circleColor, color, opacity }}
      identifier={{
        columnSpan: 3,
        iconName: "zap",
        referenceCellSize: 50,
        rowSpan: 3,
      }}
      label="Shazam"
      layout={{
        bounds: { height: 150, width: 150, x: 0, y: 0 },
        cornerLabelInset: 2,
        cornerPadding: 7,
        fontSize: 9,
        gap: 4,
        iconBackgroundSize: 29.75,
        iconSize: 17,
        inset: 7,
        kind: "corner",
        maxLabelWidth: 134,
        minimumFontScale: 0.7,
        showLabel: true,
      }}
    />
  );
}

describe("AnimatedButtonIdentifierVisuals", () => {
  it("renders independently supplied circle and glyph colors", () => {
    const screen = render(<CornerVisuals />);

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-icon-background").props.style,
    )).toMatchObject({ backgroundColor: "#666666" });
    expect(screen.getByTestId("mock-lucide").props.animatedProps).toMatchObject({
      color: "#E3FFF6",
    });
  });

  it("keeps the label on the animated background theme color", () => {
    const screen = render(<CornerVisuals />);

    expect(StyleSheet.flatten(screen.getByText("Shazam").props.style))
      .toMatchObject({ color: "#666666" });
  });

  it("keeps NxM labels fitted and anchored at the bottom-right", () => {
    const screen = render(<CornerVisuals />);
    const label = screen.getByText("Shazam");

    expect(label.props).toMatchObject({
      adjustsFontSizeToFit: true,
      allowFontScaling: false,
      ellipsizeMode: "tail",
      minimumFontScale: 0.7,
      numberOfLines: 1,
    });
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({
      alignSelf: "flex-end",
      marginBottom: 2,
      marginRight: 2,
      maxWidth: 134,
    });
  });
});
