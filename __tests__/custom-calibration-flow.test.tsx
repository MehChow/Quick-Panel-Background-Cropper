import * as React from "react";
import { act, render, renderHook, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { CustomCalibrationCanvas } from "@/features/quick-panel/calibration/components/CustomCalibrationCanvas";
import { CustomCalibrationStepper } from "@/features/quick-panel/calibration/components/CustomCalibrationStepper";
import { useCalibrationScreen } from "@/features/quick-panel/calibration/hooks/useCalibrationScreen";
import { createSuggestedCustomCalibrationProfile } from "@/features/quick-panel/calibration/hooks/useCustomCalibrationFlow";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

const mockReact = React;
const mockText = Text;
const mockLaunchImageLibraryAsync = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    dismissTo: jest.fn(),
    navigate: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: (...args: unknown[]) =>
    mockLaunchImageLibraryAsync(...args),
}));

jest.mock("react-i18next", () => ({
  initReactI18next: {
    init: jest.fn(),
    type: "3rdParty",
  },
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("expo-image", () => ({
  Image: ({ source }: { source: number | { uri?: string } }) =>
    mockReact.createElement(
      mockText,
      null,
      typeof source === "number" ? "static-image" : source.uri,
    ),
}));

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

function resetQuickPanelStore() {
  useQuickPanelStore.setState(createInitialQuickPanelStateData());
}

describe("custom calibration flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuickPanelStore();
  });

  it("shows one-shot and two-shot entry actions in the stepper", () => {
    render(
      <CustomCalibrationStepper
        mode="entry"
        onSelectSourceMode={jest.fn()}
        sourceMode="single"
      />,
    );

    expect(
      screen.getByText("calibration.continueWithOneScreenshot"),
    ).toBeTruthy();
    expect(screen.getByText("calibration.addSecondScreenshot")).toBeTruthy();
  });

  it("renders both screenshots in the merged custom canvas", () => {
    render(
      <CustomCalibrationCanvas
        isHidden={false}
        onRectChange={jest.fn()}
        rect={null}
        session={{
          bottomCropTopY: 120,
          bottomOffsetY: 1860,
          bottomScreenshot,
          mergedHeight: 4140,
          sourceMode: "double",
          topScreenshot,
        }}
      />,
    );

    expect(screen.getByText("file:///top.png")).toBeTruthy();
    expect(screen.getByText("file:///bottom.png")).toBeTruthy();
  });

  it("confirms overlap alignment and reseeds the draft against merged height", () => {
    useQuickPanelStore.setState({
      calibrationMode: "custom-panels",
      customCalibrationDraft: createSuggestedCustomCalibrationProfile(
        topScreenshot,
      ),
      customCalibrationSession: {
        bottomCropTopY: 120,
        bottomOffsetY: 1860,
        bottomScreenshot,
        mergedHeight: null,
        sourceMode: "double",
        topScreenshot,
      },
    });

    const { result } = renderHook(() => useCalibrationScreen());

    act(() => {
      result.current.confirmCustomCalibrationAlignment();
    });

    expect(
      useQuickPanelStore.getState().customCalibrationSession.mergedHeight,
    ).toBe(4020);
    expect(
      useQuickPanelStore.getState().customCalibrationSession.bottomCropTopY,
    ).toBe(120);
    expect(useQuickPanelStore.getState().customCalibrationDraft).toEqual(
      createSuggestedCustomCalibrationProfile({
        ...topScreenshot,
        height: 4020,
      }),
    );
  });

  it("keeps the one-shot custom session unchanged when importing the top screenshot", async () => {
    useQuickPanelStore.setState({
      calibrationMode: "custom-panels",
    });

    mockLaunchImageLibraryAsync.mockResolvedValue({
      assets: [topScreenshot],
      canceled: false,
    });

    const { result } = renderHook(() => useCalibrationScreen());

    await act(async () => {
      await result.current.importScreenshot();
    });

    expect(useQuickPanelStore.getState().customCalibrationSession).toEqual({
      bottomCropTopY: null,
      bottomOffsetY: null,
      bottomScreenshot: null,
      mergedHeight: 2400,
      sourceMode: "single",
      topScreenshot,
    });
  });

  it("seeds a fixed automatic trim when the second screenshot is imported", async () => {
    useQuickPanelStore.setState({
      calibrationMode: "custom-panels",
      customCalibrationSession: {
        bottomCropTopY: null,
        bottomOffsetY: null,
        bottomScreenshot: null,
        mergedHeight: null,
        sourceMode: "double",
        topScreenshot,
      },
    });

    mockLaunchImageLibraryAsync.mockResolvedValue({
      assets: [bottomScreenshot],
      canceled: false,
    });

    const { result } = renderHook(() => useCalibrationScreen());

    await act(async () => {
      await result.current.importCustomBottomScreenshot();
    });

    expect(useQuickPanelStore.getState().customCalibrationSession).toEqual({
      bottomCropTopY: 480,
      bottomOffsetY: 2400,
      bottomScreenshot,
      mergedHeight: null,
      sourceMode: "double",
      topScreenshot,
    });
  });
});
