import { QuickPanelPreviewStage } from "@/features/quick-panel/customize/components/QuickPanelPreviewStage";
import type { ImageTransform } from "@/features/quick-panel/model/types";
import { render, within } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";

jest.mock("expo-image", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");

  return {
    Image: (props: Record<string, unknown>) =>
      React.createElement(View, props),
  };
});

jest.mock(
  "@/features/quick-panel/customize/components/PanelOverlay",
  () => ({ PanelOverlay: () => null }),
);

jest.mock(
  "@/features/quick-panel/shared/AppGradientBackground",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      AppGradientBackground: () =>
        React.createElement(View, { testID: "app-gradient" }),
    };
  },
);

const transform = { scale: 1, x: 0, y: 0 };
const sharedScale = {
  get: () => 1,
  set: jest.fn(),
  value: 1,
} as unknown as SharedValue<number>;
const sharedTransform = {
  get: () => transform,
  set: jest.fn(),
  value: transform,
} as unknown as SharedValue<ImageTransform>;

const baseProps = {
  buttonIdentifierBackgroundTheme: "dark" as const,
  buttonIdentifierColor: "#FFFFFF",
  buttonIdentifierOpacity: 0.7,
  buttonPanelOpacity: 0.78,
  handleLayout: jest.fn(),
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  image: { height: 100, uri: "file:///image.png", width: 100 },
  layoutScale: 0.5,
  preset: {
    customizationArea: { height: 100, radius: 0, width: 100, x: 0, y: 0 },
    goodLockOrder: ["brightness" as const],
    height: 100,
    id: "test",
    label: "Test",
    mode: "advanced" as const,
    panels: {
      brightness: {
        family: "control" as const,
        fileName: "brightness.png",
        id: "brightness" as const,
        label: "Brightness",
        rect: { height: 40, radius: 0, width: 80, x: 30, y: 50 },
      },
    },
    visualOrder: ["brightness" as const],
    width: 100,
  },
  previewFrame: { height: 100, radius: 0, width: 100, x: 10, y: 20 },
  previewRatio: 1,
  previewScale: sharedScale,
  previewUri: "file:///preview.png",
  previewWidth: 100,
  showButtonIdentifiers: true,
  transform: sharedTransform,
};

describe("QuickPanelPreviewStage background", () => {
  it("clips the requested gradient to each panel frame", () => {
    const screen = render(<QuickPanelPreviewStage {...baseProps} />);
    expect(screen.queryByTestId("app-gradient")).toBeNull();

    screen.rerender(
      <QuickPanelPreviewStage
        {...baseProps}
        showAppGradientBackground
      />,
    );

    const backdrop = screen.getByTestId(
      "panel-gradient-backdrop-brightness",
    );
    expect(within(backdrop).getByTestId("app-gradient")).toBeTruthy();
    expect(backdrop.props.className).toContain("overflow-hidden");
    expect(StyleSheet.flatten(backdrop.props.style)).toMatchObject({
      borderRadius: 10,
      height: 20,
      left: 10,
      position: "absolute",
      top: 15,
      width: 40,
    });
  });

  it("keeps the gradient outside the preview content opacity", () => {
    const screen = render(
      <QuickPanelPreviewStage
        {...baseProps}
        showAppGradientBackground
      />,
    );

    expect(StyleSheet.flatten(
      screen.getByTestId("quick-panel-preview-stage").props.style,
    )).not.toHaveProperty("opacity");
    expect(StyleSheet.flatten(
      screen.getByTestId("quick-panel-preview-content").props.style,
    )).toMatchObject({ opacity: 0.9 });
  });
});
