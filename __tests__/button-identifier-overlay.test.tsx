import { ButtonIdentifierOverlay } from "@/features/quick-panel/customize/components/ButtonIdentifierOverlay";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

jest.mock("@react-native-vector-icons/lucide", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    Lucide: ({ name, ...props }: { name: string }) =>
      React.createElement(Text, { ...props, testID: "mock-lucide" }, name),
  };
});

const bounds = { x: 0, y: 0, width: 100, height: 50 };

function renderOverlay(columnSpan: number, rowSpan: number) {
  return render(
    <ButtonIdentifierOverlay
      bounds={bounds}
      identifier={{ columnSpan, rowSpan, iconName: "wifi" }}
      label="Wi-Fi"
      opacity={0.7}
      target="preview"
    />,
  );
}

describe("ButtonIdentifierOverlay", () => {
  it("centers a 1x1 icon and omits the label", () => {
    const screen = renderOverlay(1, 1);

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-content").props.style,
    )).toMatchObject({ alignItems: "center", justifyContent: "center" });
    expect(screen.queryByTestId("button-identifier-label")).toBeNull();
  });

  it("top-centers a vertical icon and omits the label", () => {
    const screen = renderOverlay(1, 2);

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-content").props.style,
    )).toMatchObject({ alignItems: "center", justifyContent: "flex-start" });
    expect(screen.queryByTestId("button-identifier-label")).toBeNull();
  });

  it("left-centers a roomy icon with a fitted localized label", () => {
    const screen = renderOverlay(2, 1);
    const label = screen.getByTestId("button-identifier-label");

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-content").props.style,
    )).toMatchObject({ alignItems: "center", flexDirection: "row" });
    expect(label.props.children).toBe("Wi-Fi");
    expect(label.props).toMatchObject({
      adjustsFontSizeToFit: true,
      allowFontScaling: false,
      ellipsizeMode: "tail",
      minimumFontScale: 0.7,
      numberOfLines: 1,
    });
  });

  it("applies opacity once while keeping icon and text white", () => {
    const screen = renderOverlay(2, 1);
    const rootStyle = StyleSheet.flatten(
      screen.getByTestId("button-identifier-overlay").props.style,
    );
    const labelStyle = StyleSheet.flatten(
      screen.getByTestId("button-identifier-label").props.style,
    );

    expect(rootStyle.opacity).toBe(0.7);
    expect(screen.getByTestId("mock-lucide").props.color).toBe("#FFFFFF");
    expect(labelStyle.color).toBe("#FFFFFF");
    expect(labelStyle.opacity).toBeUndefined();
  });
});
