import { act, render } from "@testing-library/react-native";
import { useAdvancedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen";
import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, dismissTo: jest.fn() }),
}));

jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({
  pickImageFromLibrary: jest.fn(),
}));

type HookWindow = typeof globalThis & {
  __advancedCalibrationHook?: ReturnType<typeof useAdvancedCalibrationScreen>;
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
  uri: "file:///quick-panel.png",
  width: 1000,
  height: 2000,
};

describe("advanced calibration leave guard", () => {
  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    mockBack.mockClear();
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
});
