import { act, render } from "@testing-library/react-native";
import { useAdvancedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen";
import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { BackHandler } from "react-native";

const mockBack = jest.fn();
const mockTrack = jest.fn();
const mockRelease = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, dismissTo: jest.fn() }),
}));

jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({
  pickImageFromLibrary: jest.fn(),
}));

jest.mock("@/features/quick-panel/cache/useOwnedImageCache", () => ({
  useOwnedImageCache: () => ({ release: mockRelease, track: mockTrack }),
}));

type HookWindow = typeof globalThis & {
  __advancedCalibrationHook?: ReturnType<typeof useAdvancedCalibrationScreen>;
  __mmkvStore?: Map<string, boolean | string>;
};

function HookProbe() {
  const hook = useAdvancedCalibrationScreen();
  (globalThis as HookWindow).__advancedCalibrationHook = hook;
  return null;
}

function getHook() {
  return (globalThis as HookWindow).__advancedCalibrationHook!;
}

const screenshot = {
  ownedCacheUris: ["file:///cache/ImagePicker/quick-panel.png"],
  uri: "file:///quick-panel.png",
  width: 1000,
  height: 2000,
};

describe("advanced calibration leave guard", () => {
  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    mockBack.mockClear();
    mockTrack.mockClear();
    mockRelease.mockClear();
    (pickImageFromLibrary as jest.Mock).mockResolvedValue(screenshot);
  });

  afterEach(() => {
    delete (globalThis as HookWindow).__advancedCalibrationHook;
  });

  it("leaves on the outer step, then opens the dialog after the green rect is confirmed", async () => {
    render(<HookProbe />);

    await act(async () => {
      await getHook().importScreenshot();
    });

    act(() => {
      getHook().requestLeaveCalibration();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(screenshot);
    expect(getHook().isLeaveDialogOpen).toBe(false);
    mockBack.mockClear();

    act(() => {
      getHook().goForward();
    });

    act(() => {
      getHook().requestLeaveCalibration();
    });

    expect(mockBack).not.toHaveBeenCalled();
    expect(getHook().isLeaveDialogOpen).toBe(true);
  });

  it("keeps one hardware-back subscription across draft rerenders", async () => {
    const remove = jest.fn();
    const addEventListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockReturnValue({ remove });
    const screen = render(<HookProbe />);

    await act(async () => {
      await getHook().importScreenshot();
    });
    act(() => {
      getHook().goForward();
      getHook().setRows(4);
      getHook().setColumns(3);
    });

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(remove).not.toHaveBeenCalled();

    screen.unmount();
    expect(remove).toHaveBeenCalledTimes(1);
    addEventListener.mockRestore();
  });

  it("reads and persists the shared snap sensitivity preference", () => {
    (globalThis as HookWindow).__mmkvStore?.set(
      "quick-panel.snap-sensitivity",
      "low",
    );

    render(<HookProbe />);

    expect(getHook().snapSensitivity).toBe("low");
    act(() => getHook().setSnapSensitivity("strong"));

    expect(getHook().snapSensitivity).toBe("strong");
    expect(
      (globalThis as HookWindow).__mmkvStore?.get("quick-panel.snap-sensitivity"),
    ).toBe("strong");
  });

  it("keeps Controls-only Next blocked until the active panel commits", async () => {
    render(<HookProbe />);
    await act(async () => getHook().importScreenshot());

    act(() => getHook().goForward());
    act(() => getHook().setAdvancedEnabledPanels(["buttonBox"]));
    act(() => getHook().goForward());
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("buttonBox");

    const finalRect = { x: 10, y: 20, width: 80, height: 80, radius: 0 };
    act(() => getHook().beginPanelGesture("buttonBox", 1));
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("buttonBox");

    act(() => getHook().commitPanelGesture("buttonBox", 1, finalRect));
    expect(useQuickPanelStore.getState().advancedDraft?.panels?.buttonBox).toEqual(finalRect);
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("confirm");
  });

  it("applies the same pending guard to Buttons-only", async () => {
    useQuickPanelStore.setState({
      ...createInitialQuickPanelStateData(),
      selectedAdvancedTarget: "buttons",
    });
    render(<HookProbe />);
    await act(async () => getHook().importScreenshot());

    act(() => getHook().goForward());
    act(() => getHook().setAdvancedButtons([{
      id: "button-1",
      label: "Wi-Fi",
      customIconId: null,
      rect: { x: 10, y: 20, width: 80, height: 80, radius: 0 },
    }]));
    act(() => getHook().goForward());
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("button-1");

    act(() => getHook().beginPanelGesture("button-1", 1));
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("button-1");
    act(() => getHook().commitPanelGesture("button-1", 1, {
      x: 20,
      y: 30,
      width: 80,
      height: 80,
      radius: 0,
    }));
    act(() => getHook().goForward());
    expect(getHook().phase).toBe("confirm");
  });
});
