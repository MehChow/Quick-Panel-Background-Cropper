import { act, render } from "@testing-library/react-native";
import { useCombinedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen";
import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { BackHandler } from "react-native";
import { createElement } from "react";

const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockTrack = jest.fn();
const mockRelease = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, dismissTo: mockDismissTo }),
}));

jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({
  pickImageFromLibrary: jest.fn(),
}));

jest.mock("@/features/quick-panel/cache/useOwnedImageCache", () => ({
  useOwnedImageCache: () => ({ release: mockRelease, track: mockTrack }),
}));

type HookWindow = typeof globalThis & {
  __combinedCalibrationHook?: ReturnType<typeof useCombinedCalibrationScreen>;
};

function HookProbe() {
  const hook = useCombinedCalibrationScreen();
  (globalThis as HookWindow).__combinedCalibrationHook = hook;
  return null;
}

function getHook() {
  return (globalThis as HookWindow).__combinedCalibrationHook!;
}

const screenshot = {
  ownedCacheUris: ["file:///cache/ImagePicker/quick-panel.png"],
  uri: "file:///quick-panel.png",
  width: 200,
  height: 400,
};

describe("combined calibration controller", () => {
  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    mockBack.mockClear();
    mockDismissTo.mockClear();
    mockTrack.mockClear();
    mockRelease.mockClear();
    (pickImageFromLibrary as jest.Mock).mockResolvedValue(screenshot);
  });

  afterEach(() => {
    delete (globalThis as HookWindow).__combinedCalibrationHook;
  });

  it("follows the combined setup phases and clamps grid values", async () => {
    render(createElement(HookProbe));

    expect(getHook().phase).toBe("outer");
    await act(async () => {
      await getHook().importScreenshot();
    });
    expect(mockTrack).toHaveBeenCalledWith(screenshot);
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("controlSelection");

    act(() => {
      getHook().setColumns(0);
      getHook().setRows(9);
    });
    expect(getHook().grid).toEqual({ columns: 1, rows: 8 });

    act(() => {
      getHook().setCombinedEnabledControls(["buttonBox"]);
    });
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("buttonSelection");
    act(() => {
      getHook().setCombinedButtons([
        {
          id: "button-1",
          label: "Wi-Fi",
          customIconId: null,
          rect: { x: 50, y: 100, width: 40, height: 40, radius: 0 },
        },
      ]);
    });
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("grid");
  });

  it("leaves immediately on the outer phase and guards later phases", async () => {
    render(createElement(HookProbe));
    await act(async () => {
      await getHook().importScreenshot();
    });

    act(() => getHook().requestLeaveCalibration());
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(getHook().isLeaveDialogOpen).toBe(false);

    act(() => getHook().goForward());
    act(() => getHook().requestLeaveCalibration());
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(getHook().isLeaveDialogOpen).toBe(true);
  });
});
