import { act, renderHook } from "@testing-library/react-native";
import { useAdvancedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/hooks/useAdvancedCalibrationScreen";
import { useCombinedCalibrationScreen } from "@/features/quick-panel/calibration/advanced/combined/hooks/useCombinedCalibrationScreen";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
const mockPick = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), dismissTo: jest.fn() }) }));
jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({ pickImageFromLibrary: () => mockPick() }));
jest.mock("@/features/quick-panel/cache/cache-files", () => ({ deleteOwnedCacheUris: jest.fn() }));
const prepared = { uri: "file:///working.jpg", width: 2048, height: 3072, originalWidth: 5152, originalHeight: 7728 };

beforeEach(() => {
  jest.clearAllMocks();
  useQuickPanelStore.setState(createInitialQuickPanelStateData());
});

it.each(["controls", "buttons"] as const)("uses prepared coordinates for Advanced %s and blocks duplicate requests", async (target) => {
  useQuickPanelStore.setState({ selectedMode: "advanced", selectedAdvancedTarget: target });
  let finish!: (value: typeof prepared) => void;
  mockPick.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
  const hook = renderHook(() => useAdvancedCalibrationScreen());
  let pending!: Promise<void>;
  act(() => { pending = hook.result.current.importScreenshot(); void hook.result.current.importScreenshot(); });
  expect(mockPick).toHaveBeenCalledTimes(1);
  expect(hook.result.current.isImporting).toBe(true);
  await act(async () => { finish(prepared); await pending; });
  const state = useQuickPanelStore.getState();
  const draft = target === "buttons" ? state.advancedButtonsDraft : state.advancedDraft;
  expect(draft?.screenshot).toEqual(prepared);
  expect(draft?.outerRect?.width).toBeLessThan(2048);
  expect(hook.result.current.isImporting).toBe(false);
});

it("uses prepared coordinates for Combined and keeps other drafts unchanged", async () => {
  useQuickPanelStore.setState({ selectedMode: "advanced", selectedAdvancedTarget: "combined" });
  const before = useQuickPanelStore.getState();
  mockPick.mockResolvedValue(prepared);
  const hook = renderHook(() => useCombinedCalibrationScreen());
  await act(async () => hook.result.current.importScreenshot());
  const after = useQuickPanelStore.getState();
  expect(after.advancedCombinedDraft?.screenshot).toEqual(prepared);
  expect(after.advancedCombinedDraft?.outerRect?.width).toBeLessThan(2048);
  expect(after.advancedDraft).toBe(before.advancedDraft);
  expect(after.advancedButtonsDraft).toBe(before.advancedButtonsDraft);
  expect(after.defaultCalibration).toBe(before.defaultCalibration);
});
