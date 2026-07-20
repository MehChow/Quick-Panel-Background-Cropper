import { QuickPanelPreview } from "@/features/quick-panel/customize/components/QuickPanelPreview";
import { useQuickPanelPreviewGestures } from "@/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import { getImagePlacementBounds } from "@/features/quick-panel/model/panel-geometry";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

let mockSourceMounts = 0;
let mockSourceUnmounts = 0;
let mockPanelMounts = 0;
let mockPanelUnmounts = 0;

jest.mock("react-native-gesture-handler", () => {
  const React = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, { testID: "gesture-host" }, children),
  };
});

jest.mock(
  "@/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures",
  () => ({
    useQuickPanelPreviewGestures: jest.fn(() => ({
      gesture: {},
      handleLayout: jest.fn(),
      layoutScale: 1,
      sharedScale: { get: () => 1, set: jest.fn(), value: 1 },
      sharedTransform: {
        get: () => ({ scale: 1, x: 0, y: 0 }),
        set: jest.fn(),
        value: { scale: 1, x: 0, y: 0 },
      },
    })),
  }),
);

jest.mock(
  "@/features/quick-panel/customize/components/SourceImageContext",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      SourceImageContext: ({ visible }: { visible: boolean }) => {
        React.useEffect(() => {
          mockSourceMounts += 1;
          return () => {
            mockSourceUnmounts += 1;
          };
        }, []);
        return React.createElement(
          View,
          { testID: "source-image-context", visible },
          React.createElement(View, { testID: "expo-image" }),
        );
      },
    };
  },
);

jest.mock(
  "@/features/quick-panel/customize/components/PanelSlice",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      PanelSlice: () => {
        React.useEffect(() => {
          mockPanelMounts += 1;
          return () => {
            mockPanelUnmounts += 1;
          };
        }, []);
        return React.createElement(
          View,
          { testID: "panel-slice" },
          React.createElement(View, { testID: "expo-image" }),
        );
      },
    };
  },
);

const commonProps = {
  buttonIdentifierOpacity: 0.7,
  buttonPanelOpacity: 0.63,
  identifierPositions: { horizontal: 0.5, vertical: 0.5 },
  image: { height: 654, uri: "file:///image.png", width: 298 },
  onAdjustingChange: jest.fn(),
  preset: s25PlusOneUi85Preset,
  previewUri: "file:///preview.png",
  showButtonIdentifiers: true,
  transform: { scale: 1, x: 0, y: 0 },
};
const mockUseQuickPanelPreviewGestures = jest.mocked(
  useQuickPanelPreviewGestures,
);

describe("QuickPanelPreview source context", () => {
  beforeEach(() => {
    mockUseQuickPanelPreviewGestures.mockClear();
    mockSourceMounts = 0;
    mockSourceUnmounts = 0;
    mockPanelMounts = 0;
    mockPanelUnmounts = 0;
  });

  it("toggles only layer visibility while frame, layout, and mounts stay stable", () => {
    const onTransformChange = jest.fn();
    const screen = render(
      <QuickPanelPreview
        {...commonProps}
        onTransformChange={onTransformChange}
        showSourceImageContext
      />,
    );

    expect(screen.getByTestId("source-image-context")).toBeTruthy();
    const sourceFrame = mockUseQuickPanelPreviewGestures.mock.calls[0][0]
      .previewFrame;
    const sourceStageStyle = StyleSheet.flatten(
      screen.getByTestId("quick-panel-preview-stage").props.style,
    );
    expect(sourceFrame).toEqual(getImagePlacementBounds(s25PlusOneUi85Preset));
    expect(screen.getAllByTestId("expo-image")).toHaveLength(5);
    expect(mockSourceMounts).toBe(1);
    expect(mockPanelMounts).toBe(4);

    screen.rerender(
      <QuickPanelPreview
        {...commonProps}
        onTransformChange={onTransformChange}
        showSourceImageContext={false}
      />,
    );

    const cleanFrame = mockUseQuickPanelPreviewGestures.mock.calls[1][0]
      .previewFrame;
    const cleanStageStyle = StyleSheet.flatten(
      screen.getByTestId("quick-panel-preview-stage").props.style,
    );
    expect(cleanFrame).toEqual(sourceFrame);
    expect(cleanStageStyle).toMatchObject({
      aspectRatio: sourceStageStyle.aspectRatio,
      width: sourceStageStyle.width,
    });
    expect(screen.getByTestId("source-image-context").props.visible).toBe(false);
    expect(screen.getAllByTestId("expo-image")).toHaveLength(5);
    expect(mockSourceMounts).toBe(1);
    expect(mockSourceUnmounts).toBe(0);
    expect(mockPanelMounts).toBe(4);
    expect(mockPanelUnmounts).toBe(0);
    expect(onTransformChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId("source-image-context-controls")).toBeNull();
    expect(screen.queryByTestId("source-image-context-toggle")).toBeNull();

    screen.rerender(
      <QuickPanelPreview
        {...commonProps}
        onTransformChange={onTransformChange}
        showSourceImageContext
      />,
    );
    expect(screen.getAllByTestId("expo-image")).toHaveLength(5);
    expect(mockSourceMounts).toBe(1);
    expect(mockSourceUnmounts).toBe(0);
    expect(mockPanelMounts).toBe(4);
    expect(mockPanelUnmounts).toBe(0);
    expect(onTransformChange).not.toHaveBeenCalled();
  });
});
