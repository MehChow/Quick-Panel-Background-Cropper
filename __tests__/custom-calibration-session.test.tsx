import { act, renderHook } from "@testing-library/react-native";
import { useCalibrationScreen } from "@/features/quick-panel/calibration/hooks/useCalibrationScreen";
import {
  canUseAsSecondCustomScreenshot,
  clampBottomCropTopY,
  createEmptyCustomCalibrationSession,
  getAutomaticBottomCropTopY,
  getVisibleBottomScreenshotMetrics,
  getMergedCustomScreenshotMetrics,
} from "@/features/quick-panel/calibration/custom-calibration-session";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { getAcceptedCalibrationState, getCalibrationState } from "@/features/quick-panel/store/quick-panel-transitions";

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

describe("custom calibration session", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetQuickPanelStore();
  });

  it("accepts only same-width portrait images as the second screenshot", () => {
    expect(canUseAsSecondCustomScreenshot(topScreenshot, bottomScreenshot)).toBe(
      true,
    );
    expect(
      canUseAsSecondCustomScreenshot(topScreenshot, {
        ...bottomScreenshot,
        width: 900,
      }),
    ).toBe(false);
    expect(
      canUseAsSecondCustomScreenshot(topScreenshot, {
        ...bottomScreenshot,
        height: 900,
      }),
    ).toBe(false);
  });

  it("calculates merged screenshot metrics from the bottom offset", () => {
    expect(
      getMergedCustomScreenshotMetrics(
        topScreenshot,
        bottomScreenshot,
        1860,
        120,
      ),
    ).toEqual({
      height: 4020,
      width: 1080,
    });
  });

  it("clamps the second screenshot trim to a bounded top band", () => {
    expect(clampBottomCropTopY(-20, bottomScreenshot.height)).toBe(0);
    expect(clampBottomCropTopY(500, bottomScreenshot.height)).toBe(240);
  });

  it("derives the automatic second screenshot trim from width", () => {
    expect(getAutomaticBottomCropTopY(bottomScreenshot)).toBe(178);
    expect(
      getAutomaticBottomCropTopY({
        ...bottomScreenshot,
        height: 900,
        width: 3000,
      }),
    ).toBe(180);
  });

  it("calculates visible metrics from the trimmed second screenshot", () => {
    expect(
      getVisibleBottomScreenshotMetrics(bottomScreenshot, 120),
    ).toEqual({
      height: 2160,
      width: 1080,
    });
  });

  it("resets the runtime session state when calibration state changes", () => {
    const emptySession = createEmptyCustomCalibrationSession();

    expect(
      getCalibrationState("custom-panels", {
        "custom-panels": null,
        "default-union": null,
      }).customCalibrationSession,
    ).toEqual(emptySession);
    expect(
      getAcceptedCalibrationState(
        {
          "custom-panels": null,
          "default-union": null,
        },
        {
          mode: "default-union",
          rect: { height: 300, radius: 0, width: 200, x: 12, y: 34 },
          version: 1,
        },
      ).customCalibrationSession,
    ).toEqual(emptySession);
  });

  it("stores the imported top screenshot in the runtime custom session", async () => {
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
    expect(useQuickPanelStore.getState().screenshot).toBeNull();
  });

  it("rejects an invalid second screenshot in two-shot mode", async () => {
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
      assets: [
        {
          ...bottomScreenshot,
          width: 900,
        },
      ],
      canceled: false,
    });

    const { result } = renderHook(() => useCalibrationScreen());

    await act(async () => {
      await result.current.importCustomBottomScreenshot();
    });

    expect(result.current.error).toBe(
      "The second screenshot must be a portrait image with the same width as the first screenshot.",
    );
    expect(useQuickPanelStore.getState().customCalibrationSession.bottomScreenshot).toBeNull();
  });
});
