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
  overlayBounds = bounds,
) {
  return render(
    <ButtonIdentifierOverlay
      bounds={overlayBounds}
      identifier={{
        columnSpan,
        rowSpan,
        iconName: "wifi",
        referenceCellSize: 50,
      }}
      label="Wi-Fi"
      onPositionReady={onPositionReady}
      opacity={0.7}
      positions={positions}
      referenceCellSize={50}
    />,
  );
}

describe("ButtonIdentifierOverlay", () => {
  it("centers a 1x1 icon and omits the label", () => {
    const screen = renderOverlay(1, 1);
    const iconBackground = screen.getByTestId("button-identifier-icon-background");
    const icon = screen.getByTestId("mock-lucide");

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-content").props.style,
    )).toMatchObject({ alignItems: "center", justifyContent: "center" });
    expect(StyleSheet.flatten(iconBackground.props.style)).toMatchObject({
      alignItems: "center",
      backgroundColor: "#666666",
      borderRadius: 29.75 / 2,
      height: 29.75,
      justifyContent: "center",
      width: 29.75,
    });
    expect(icon.props.size).toBe(17);
    expect(screen.queryByTestId("button-identifier-label")).toBeNull();
  });

  it("renders the dark icon style with a white circle and dark glyph", () => {
    const screen = render(
      <ButtonIdentifierOverlay
        bounds={bounds}
        identifier={{
          columnSpan: 1,
          rowSpan: 1,
          iconName: "wifi",
          referenceCellSize: 50,
        }}
        label="Wi-Fi"
        opacity={0.7}
        positions={{ horizontal: 0.5, vertical: 0.5 }}
        referenceCellSize={50}
        theme="dark"
      />,
    );
    const background = screen.getByTestId("button-identifier-icon-background");
    const icon = screen.getByTestId("mock-lucide");

    expect(StyleSheet.flatten(background.props.style)).toMatchObject({
      backgroundColor: "#FFFFFF",
    });
    expect(icon.props.color).toBe("#333333");
  });

  it("moves a one-column icon while preserving horizontal centering", () => {
    const screen = renderOverlay(1, 3, { horizontal: 0.5, vertical: 1 });
    const contentStyle = StyleSheet.flatten(
      screen.getByTestId("button-identifier-movable-content").props.style,
    );

    expect(contentStyle).toMatchObject({
      alignItems: "center",
      height: 29.75,
      left: 0,
      top: 13.25,
      width: 100,
    });
    expect(screen.queryByTestId("button-identifier-label")).toBeNull();
  });

  it("left-centers a one-row icon with a fitted localized label", () => {
    const screen = renderOverlay(4, 1);
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
    const screen = renderOverlay(4, 1);
    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-overlay").props.style,
    ).opacity).toBe(0);

    fireEvent(screen.getByTestId("button-identifier-movable-content"), "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });

    expect(StyleSheet.flatten(
      screen.getByTestId("button-identifier-overlay").props.style,
    ).opacity).toBe(0.7);
  });

  it("moves a measured horizontal icon-and-label group together", () => {
    const screen = renderOverlay(4, 1, { horizontal: 0.5, vertical: 0.5 });
    const content = screen.getByTestId("button-identifier-movable-content");

    fireEvent(content, "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });

    expect(StyleSheet.flatten(content.props.style)).toMatchObject({ left: 30 });
  });

  it.each([
    [4, 1, true, true],
    [1, 3, false, true],
    [1, 1, false, false],
    [2, 2, true, false],
    [2, 3, true, false],
    [3, 2, true, false],
    [3, 3, true, false],
  ] as const)(
    "%sx%s resolves label=%s movable=%s",
    (columnSpan, rowSpan, hasLabel, isMovable) => {
      const screen = renderOverlay(columnSpan, rowSpan);
      expect(Boolean(screen.queryByTestId("button-identifier-label"))).toBe(hasLabel);
      expect(Boolean(screen.queryByTestId(
        "button-identifier-movable-content",
      ))).toBe(isMovable);
    },
  );

  it("anchors a corner icon top-left and its label bottom-right", () => {
    const screen = renderOverlay(3, 3);
    const contentStyle = StyleSheet.flatten(
      screen.getByTestId("button-identifier-content").props.style,
    );
    const labelStyle = StyleSheet.flatten(
      screen.getByTestId("button-identifier-label").props.style,
    );

    expect(contentStyle).toMatchObject({
      alignItems: "flex-start",
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: 7,
      paddingVertical: 7,
    });
    expect(labelStyle).toMatchObject({
      alignSelf: "flex-end",
      marginBottom: 2,
      marginRight: 2,
      maxWidth: 84,
    });
  });

  it("keeps canonical icon and text metrics across panel sizes", () => {
    const horizontal = renderOverlay(4, 1);
    const horizontalIcon = horizontal.getByTestId("mock-lucide").props.size;
    const horizontalText = StyleSheet.flatten(
      horizontal.getByTestId("button-identifier-label").props.style,
    ).fontSize;
    horizontal.unmount();

    const vertical = renderOverlay(1, 3);
    expect(vertical.getByTestId("mock-lucide").props.size).toBe(horizontalIcon);
    vertical.unmount();

    const corner = renderOverlay(3, 3);
    expect(corner.getByTestId("mock-lucide").props.size).toBe(horizontalIcon);
    expect(StyleSheet.flatten(
      corner.getByTestId("button-identifier-label").props.style,
    ).fontSize).toBe(horizontalText);
  });

  it("reports horizontal readiness only after measured placement commits", async () => {
    const onPositionReady = jest.fn();
    const screen = renderOverlay(4, 1, undefined, onPositionReady);

    expect(onPositionReady).not.toHaveBeenCalled();
    fireEvent(screen.getByTestId("button-identifier-movable-content"), "layout", {
      nativeEvent: { layout: { height: 20, width: 40, x: 0, y: 0 } },
    });
    await waitFor(() => expect(onPositionReady).toHaveBeenCalled());
  });
});
