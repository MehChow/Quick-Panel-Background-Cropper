import { act, render } from "@testing-library/react-native";
import { useCalibrationScreen } from "@/features/quick-panel/calibration/default/hooks/useCalibrationScreen";
import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

const mockTrack = jest.fn();
const mockRelease = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ dismissTo: jest.fn() }),
}));

jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({
  pickImageFromLibrary: jest.fn(),
}));

jest.mock("@/features/quick-panel/cache/useOwnedImageCache", () => ({
  useOwnedImageCache: () => ({ release: mockRelease, track: mockTrack }),
}));

type HookWindow = typeof globalThis & {
  __defaultCalibrationHook?: ReturnType<typeof useCalibrationScreen>;
};

function HookProbe() {
  const hook = useCalibrationScreen();
  (globalThis as HookWindow).__defaultCalibrationHook = hook;
  return null;
}

function getHook() {
  return (globalThis as HookWindow).__defaultCalibrationHook!;
}

const firstScreenshot = {
  height: 200,
  ownedCacheUris: ["file:///cache/ImagePicker/first.jpg"],
  uri: "file:///cache/ImagePicker/first.jpg",
  width: 100,
};
const secondScreenshot = {
  height: 300,
  ownedCacheUris: ["file:///cache/ImagePicker/second.jpg"],
  uri: "file:///cache/ImagePicker/second.jpg",
  width: 150,
};

describe("Default calibration cache ownership", () => {
  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    mockTrack.mockReset();
    mockRelease.mockReset();
    (pickImageFromLibrary as jest.Mock).mockReset();
  });

  afterEach(() => {
    delete (globalThis as HookWindow).__defaultCalibrationHook;
  });

  it("tracks imports and releases the replaced screenshot", async () => {
    (pickImageFromLibrary as jest.Mock)
      .mockResolvedValueOnce(firstScreenshot)
      .mockResolvedValueOnce(secondScreenshot);
    render(<HookProbe />);

    await act(async () => getHook().importScreenshot());
    await act(async () => getHook().importScreenshot());

    expect(mockTrack).toHaveBeenNthCalledWith(1, firstScreenshot);
    expect(mockTrack).toHaveBeenNthCalledWith(2, secondScreenshot);
    expect(mockRelease).toHaveBeenCalledWith(firstScreenshot);
  });
});
