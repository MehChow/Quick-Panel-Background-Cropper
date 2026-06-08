import * as React from "react";
import { act, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { CustomCalibrationCanvas } from "@/features/quick-panel/calibration/components/CustomCalibrationCanvas";
import { CustomCalibrationOverlapAligner } from "@/features/quick-panel/calibration/components/CustomCalibrationOverlapAligner";

const mockReact = React;
const mockText = Text;
const panGestures: Array<{
  onBegin?: () => void;
  onFinalize?: () => void;
  onUpdate?: (event: { translationY: number }) => void;
}> = [];

jest.mock("react-i18next", () => ({
  initReactI18next: {
    init: jest.fn(),
    type: "3rdParty",
  },
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-native-reanimated", () => ({
  useSharedValue: <T,>(value: T) => ({ value }),
}));

jest.mock("expo-image", () => ({
  Image: ({
    source,
    style,
  }: {
    source: number | { uri?: string };
    style?: unknown;
  }) =>
    mockReact.createElement(
      mockText,
      {
        style,
        testID: typeof source === "number" ? "static-image" : source.uri,
      },
      typeof source === "number" ? "static-image" : source.uri,
    ),
}));

jest.mock("react-native-gesture-handler", () => {
  const createGesture = () => {
    const chain = {
      activeOffsetY: () => chain,
      hitSlop: () => chain,
      minDistance: () => chain,
      onBegin: (callback: () => void) => {
        chain.onBegin = callback;
        return chain;
      },
      onEnd: () => chain,
      onFinalize: (callback: () => void) => {
        chain.onFinalize = callback;
        return chain;
      },
      onUpdate: (callback: (event: { translationY: number }) => void) => {
        chain.onUpdate = callback;
        return chain;
      },
    };
    panGestures.push(chain);

    return chain;
  };

  return {
    Gesture: {
      Pan: createGesture,
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock(
  "@/features/quick-panel/calibration/hooks/useCalibrationMoveResponder",
  () => ({
    useCalibrationMoveResponder: () => ({
      panHandlers: {},
    }),
  }),
);

jest.mock(
  "@/features/quick-panel/calibration/components/CalibrationResizeHandle",
  () => ({
    CalibrationResizeHandle: () => null,
  }),
);

const topScreenshot = {
  fileName: "top.png",
  height: 2400,
  uri: "file:///top.png",
  width: 1080,
} as const;

const bottomScreenshot = {
  fileName: "bottom.png",
  height: 2280,
  uri: "file:///bottom.png",
  width: 1080,
} as const;

describe("custom calibration alignment ui", () => {
  beforeEach(() => {
    panGestures.length = 0;
  });

  it("renders trimmed lower content with seam-only alignment controls", () => {
    render(
      <CustomCalibrationOverlapAligner
        bottomCropTopY={120}
        bottomOffsetY={1860}
        bottomScreenshot={bottomScreenshot}
        onBottomOffsetYChange={jest.fn()}
        topScreenshot={topScreenshot}
      />,
    );

    expect(screen.getByText("calibration.dragToAlign")).toBeTruthy();
    expect(screen.queryByText("calibration.trimSecondHeader")).toBeNull();
    expect(screen.getByTestId("file:///bottom.png").props.style.opacity).toBe(
      0.55,
    );
    expect(screen.getByTestId("file:///bottom.png").props.style.top).toBe(-120);
    expect(panGestures).toHaveLength(1);
  });

  it("renders the merged calibration canvas from the trimmed lower screenshot", () => {
    render(
      <CustomCalibrationCanvas
        isHidden={false}
        onRectChange={jest.fn()}
        rect={null}
        session={{
          bottomCropTopY: 120,
          bottomOffsetY: 1860,
          bottomScreenshot,
          mergedHeight: 4020,
          sourceMode: "double",
          topScreenshot,
        }}
      />,
    );

    expect(screen.getByTestId("file:///bottom.png").props.style.top).toBe(-120);
  });

  it("keeps the upward seam drag update when the gesture finalizes", () => {
    const onBottomOffsetYChange = jest.fn();

    render(
      <CustomCalibrationOverlapAligner
        bottomCropTopY={120}
        bottomOffsetY={1860}
        bottomScreenshot={bottomScreenshot}
        onBottomOffsetYChange={onBottomOffsetYChange}
        topScreenshot={topScreenshot}
      />,
    );

    const seamGesture = panGestures[0];
    act(() => {
      seamGesture.onBegin?.();
      seamGesture.onUpdate?.({ translationY: -540 });
      seamGesture.onFinalize?.();
    });

    expect(onBottomOffsetYChange).toHaveBeenCalledTimes(1);
    expect(onBottomOffsetYChange).toHaveBeenCalledWith(1320);
  });
});
