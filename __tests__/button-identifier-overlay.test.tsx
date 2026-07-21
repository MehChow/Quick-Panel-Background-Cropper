import { ButtonIdentifierOverlay } from "@/features/quick-panel/customize/components/ButtonIdentifierOverlay";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
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

function renderOverlay(
  columnSpan: number,
  rowSpan: number,
  positions = { horizontal: 0.5, vertical: 0.5 },
  onPositionReady?: () => void,
) {
  return render(
    <ButtonIdentifierOverlay
      bounds={bounds}
      identifier={{ columnSpan, rowSpan, iconName: "wifi" }}
      label="Wi-Fi"
      onPositionReady={onPositionReady}
      opacity={0.7}
      positions={positions}
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
      screen.getByTestId("button-identifier-movable-content").props.style,
    )).toMatchObject({ alignItems: "center", left: 0, width: 100 });
    expect(screen.queryByTestId("button-identifier-label")).toBeNull();
  });

  it("left-centers a roomy icon with a fitted localized label", () => {
    const screen = renderOverlay(2, 1);
    const label = screen.getByTestId("button-identifier-label");

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-movable-content").props.style,
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

  it("keeps a horizontal identifier hidden until its content is measured", () => {
    const screen = renderOverlay(2, 1);
    const rootStyle = StyleSheet.flatten(
      screen.getByTestId("button-identifier-overlay").props.style,
    );

    expect(rootStyle.opacity).toBe(0);

    fireEvent(screen.getByTestId("button-identifier-movable-content"), "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-overlay").props.style,
    ).opacity).toBe(0.7);
  });

  it("applies opacity once measured while keeping icon and text white", () => {
    const screen = renderOverlay(2, 1);
    fireEvent(screen.getByTestId("button-identifier-movable-content"), "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });
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

  it("moves a measured horizontal icon-and-label group together", () => {
    const screen = renderOverlay(2, 1, { horizontal: 0.5, vertical: 0.5 });
    const content = screen.getByTestId("button-identifier-movable-content");

    fireEvent(content, "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });

    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ left: 30 });
    expect(screen.getByTestId("mock-lucide")).toBeTruthy();
    expect(screen.getByTestId("button-identifier-label")).toBeTruthy();
  });

  it("moves a vertical icon while preserving horizontal centering", () => {
    const screen = renderOverlay(1, 2, { horizontal: 0.5, vertical: 1 });

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-movable-content").props.style,
    )).toMatchObject({ alignItems: "center", left: 0, top: 26, width: 100 });
  });

  it.each([[1, 1], [2, 2]])(
    "ignores position values for square-like %sx%s Buttons",
    (columnSpan, rowSpan) => {
      const screen = renderOverlay(
        columnSpan,
        rowSpan,
        { horizontal: 1, vertical: 1 },
      );

      expect(screen.queryByTestId("button-identifier-movable-content")).toBeNull();
    },
  );

  it("reports horizontal readiness only after measured placement commits", async () => {
    const onPositionReady = jest.fn();
    const screen = renderOverlay(2, 1, undefined, onPositionReady);

    expect(onPositionReady).not.toHaveBeenCalled();
    fireEvent(screen.getByTestId("button-identifier-movable-content"), "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });
    await waitFor(() => expect(onPositionReady).toHaveBeenCalled());
  });
});
