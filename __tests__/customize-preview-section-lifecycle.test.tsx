import { CustomizePreviewSection } from "@/features/quick-panel/customize/components/CustomizePreviewSection";
import type { ButtonCustomizeControlState } from "@/features/quick-panel/customize/hooks/useButtonCustomizeControls";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock(
  "@/features/quick-panel/customize/components/QuickPanelPreview",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      QuickPanelPreview: (props: Record<string, unknown>) =>
        React.createElement(View, {
          ...props,
          testID: "interactive-customize-preview",
        }),
    };
  },
);
jest.mock(
  "@/features/quick-panel/customize/components/ButtonCustomizeControls",
  () => {
    const React = jest.requireActual("react");
    const { Pressable } = jest.requireActual("react-native");
    return {
      ButtonCustomizeControls: (props: {
        onOpenButtonIdentifierAppearance: () => void;
      }) =>
        React.createElement(
          Pressable,
          {
            onPress: props.onOpenButtonIdentifierAppearance,
            testID: "open-button-appearance",
          },
        ),
    };
  },
);
jest.mock(
  "@/features/quick-panel/customize/components/ButtonLabelAppearanceDialog",
  () => {
    const React = jest.requireActual("react");
    const { Pressable, View } = jest.requireActual("react-native");
    return {
      ButtonLabelAppearanceDialog: (props: { onCancel: () => void }) =>
        React.createElement(
          View,
          { testID: "button-appearance-dialog" },
          React.createElement(Pressable, {
            onPress: props.onCancel,
            testID: "cancel-button-appearance",
          }),
        ),
    };
  },
);

const preset: QuickPanelPreset = {
  id: "combined",
  label: "Combined",
  mode: "advanced",
  width: 300,
  height: 600,
  customizationArea: { x: 0, y: 0, width: 300, height: 600, radius: 0 },
  panels: {
    brightness: {
      id: "brightness",
      label: "Brightness",
      fileName: "01-control-brightness.png",
      family: "control",
      rect: { x: 0, y: 0, width: 300, height: 80, radius: 40 },
    },
    "button-1": {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "02-button-wi-fi.png",
      family: "button",
      rect: { x: 0, y: 100, width: 80, height: 80, radius: 40 },
      buttonIdentifier: {
        columnSpan: 1,
        iconName: "wifi",
        referenceCellSize: 80,
        rowSpan: 1,
      },
    },
  },
  visualOrder: ["brightness", "button-1"],
  goodLockOrder: ["brightness", "button-1"],
};

const image = { uri: "file:///image.png", width: 1200, height: 800 };
const transform = { x: 12, y: -8, scale: 1.1 };
const buttonControls = {
  buttonIdentifierBackgroundTheme: "light" as const,
  buttonIdentifierColor: "#FFFFFF",
  buttonIdentifierOpacity: 70,
  buttonPanelOpacity: 78,
  hasHorizontalButtons: true,
  hasVerticalButtons: false,
  horizontalIdentifierPosition: 50,
  commitButtonPanelOpacity: jest.fn(),
  commitHorizontalIdentifierPosition: jest.fn(),
  commitVerticalIdentifierPosition: jest.fn(),
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  setButtonIdentifierAppearance: jest.fn(),
  setButtonPanelOpacity: jest.fn(),
  setHorizontalIdentifierPosition: jest.fn(),
  setButtonIdentifierContentMode: jest.fn(),
  setVerticalIdentifierPosition: jest.fn(),
  buttonIdentifierContentMode: "both",
  verticalIdentifierPosition: 50,
} satisfies ButtonCustomizeControlState;

describe("CustomizePreviewSection appearance lifecycle", () => {
  it("mounts the heavy interactive preview only outside appearance editing", () => {
    const screen = render(
      <CustomizePreviewSection
        buttonControls={buttonControls}
        image={image}
        onAdjustingChange={jest.fn()}
        onTransformChange={jest.fn()}
        preset={preset}
        previewUri="file:///preview.png"
        transform={transform}
      />,
    );

    expect(screen.getByTestId("interactive-customize-preview").props).toMatchObject({
      image,
      preset,
      previewUri: "file:///preview.png",
      transform,
    });
    expect(screen.queryByTestId("button-appearance-dialog")).toBeNull();

    fireEvent.press(screen.getByTestId("open-button-appearance"));
    expect(screen.queryByTestId("interactive-customize-preview")).toBeNull();
    expect(screen.getByTestId("button-appearance-dialog")).toBeTruthy();

    fireEvent.press(screen.getByTestId("cancel-button-appearance"));
    expect(screen.queryByTestId("button-appearance-dialog")).toBeNull();
    expect(screen.getByTestId("interactive-customize-preview").props).toMatchObject({
      image,
      preset,
      previewUri: "file:///preview.png",
      transform,
    });
  });
});
