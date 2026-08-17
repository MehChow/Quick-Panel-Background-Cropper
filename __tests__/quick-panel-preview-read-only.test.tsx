import { QuickPanelPreview } from "@/features/quick-panel/customize/components/QuickPanelPreview";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { act, fireEvent, render } from "@testing-library/react-native";

let mockGestureState: Record<string, unknown> | null = null;
const mockUseQuickPanelPreviewGestures = jest.fn(() => {
  if (!mockGestureState) {
    throw new Error("Read-only previews must not initialize gesture state.");
  }
  return mockGestureState;
});

jest.mock(
  "@/features/quick-panel/customize/hooks/useQuickPanelPreviewGestures",
  () => ({
    useQuickPanelPreviewGestures: () => mockUseQuickPanelPreviewGestures(),
  }),
);

jest.mock("react-native-gesture-handler", () => {
  const React = jest.requireActual("react");
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

jest.mock(
  "@/features/quick-panel/customize/components/QuickPanelPreviewStage",
  () => {
    const React = jest.requireActual("react");
    const { View } = jest.requireActual("react-native");
    return {
      QuickPanelPreviewStage: (
        props: Record<string, unknown> & {
          handleLayout: (event: unknown) => void;
        },
      ) =>
        React.createElement(View, {
          ...props,
          onLayout: props.handleLayout,
          testID: "mock-preview-stage",
        }),
    };
  },
);

const preset: QuickPanelPreset = {
  customizationArea: { height: 100, radius: 0, width: 100, x: 0, y: 0 },
  goodLockOrder: [],
  height: 100,
  id: "read-only-preview",
  label: "Read-only preview",
  mode: "advanced",
  panels: {},
  visualOrder: [],
  width: 100,
};
const transform = { scale: 0.5, x: -20, y: -30 };

describe("QuickPanelPreview layout state", () => {
  beforeEach(() => {
    mockGestureState = null;
    mockUseQuickPanelPreviewGestures.mockClear();
  });

  it("uses its measured layout directly without initializing gesture state", () => {
    const screen = render(
      <QuickPanelPreview
        buttonIdentifierBackgroundTheme="dark"
        buttonIdentifierColor="#FFFFFF"
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.78}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        image={{ height: 1000, uri: "file:///image.png", width: 1000 }}
        interactive={false}
        maxHeight={200}
        onAdjustingChange={jest.fn()}
        onTransformChange={jest.fn()}
        preset={preset}
        previewUri="file:///preview.png"
        buttonIdentifierContentMode="both"
        transform={transform}
      />,
    );

    const stage = screen.getByTestId("mock-preview-stage");
    act(() => {
      fireEvent(stage, "layout", {
        nativeEvent: { layout: { height: 200, width: 200, x: 0, y: 0 } },
      });
    });

    expect(screen.getByTestId("mock-preview-stage").props).toMatchObject({
      layoutScale: 2,
      previewScale: 2,
      transform,
    });
    expect(mockUseQuickPanelPreviewGestures).not.toHaveBeenCalled();
  });

  it("uses the measured layout scale instead of the gesture synchronization value", () => {
    mockGestureState = {
      gesture: {},
      handleLayout: jest.fn(),
      layoutScale: 2,
      sharedScale: { get: () => 1, set: jest.fn() },
      sharedTransform: {
        get: () => transform,
        set: jest.fn(),
      },
    };

    const screen = render(
      <QuickPanelPreview
        buttonIdentifierBackgroundTheme="dark"
        buttonIdentifierColor="#FFFFFF"
        buttonIdentifierOpacity={0.7}
        buttonPanelOpacity={0.78}
        identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
        image={{ height: 1000, uri: "file:///image.png", width: 1000 }}
        maxHeight={200}
        onAdjustingChange={jest.fn()}
        onTransformChange={jest.fn()}
        preset={preset}
        previewUri="file:///preview.png"
        buttonIdentifierContentMode="both"
        transform={transform}
      />,
    );

    expect(screen.getByTestId("mock-preview-stage").props.previewScale).toBe(2);
  });
});
