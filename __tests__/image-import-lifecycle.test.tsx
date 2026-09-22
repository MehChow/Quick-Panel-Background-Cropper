import { act, renderHook } from "@testing-library/react-native";
import { useCustomizeActions } from "@/features/quick-panel/customize/hooks/useCustomizeActions";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";

const mockPick = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({ pickImageFromLibrary: () => mockPick() }));
jest.mock("@/features/quick-panel/cache/cache-files", () => ({ deleteOwnedCacheUris: (...args: unknown[]) => mockDelete(...args) }));
const image = { uri: "file:///cache/new.jpg", width: 2048, height: 3072, ownedCacheUris: ["file:///cache/new.jpg"] };
const oldImage = { ...image, uri: "file:///cache/old.jpg", ownedCacheUris: ["file:///cache/old.jpg"] };

describe("image import lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    useQuickPanelStore.getState().setImage(oldImage);
  });

  it("locks before opening the picker and installs the prepared image once", async () => {
    let resolve!: (value: typeof image) => void;
    mockPick.mockReturnValue(new Promise((done) => { resolve = done; }));
    const hook = renderHook(() => useCustomizeActions());
    let pending!: Promise<void>;
    act(() => { pending = hook.result.current.pickImage(); void hook.result.current.pickImage(); });
    expect(mockPick).toHaveBeenCalledTimes(1);
    expect(useQuickPanelStore.getState().isProcessingImage).toBe(true);
    await act(async () => { resolve(image); await pending; });
    expect(useQuickPanelStore.getState().image).toEqual(image);
    expect(useQuickPanelStore.getState().step).toBe("adjustBackground");
    expect(useQuickPanelStore.getState().isProcessingImage).toBe(false);
  });

  it("preserves the previous image and transform when cancelled", async () => {
    const transform = useQuickPanelStore.getState().transform;
    mockPick.mockResolvedValue(null);
    const hook = renderHook(() => useCustomizeActions());
    await act(async () => hook.result.current.pickImage());
    expect(useQuickPanelStore.getState()).toMatchObject({ image: oldImage, transform, isProcessingImage: false });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("preserves the old image on failure and allows retry", async () => {
    mockPick.mockRejectedValueOnce(new Error("errors.unableToProcessImage")).mockResolvedValueOnce(image);
    const hook = renderHook(() => useCustomizeActions());
    await act(async () => hook.result.current.pickImage());
    expect(useQuickPanelStore.getState()).toMatchObject({ image: oldImage, errorKey: "errors.unableToProcessImage", isProcessingImage: false });
    await act(async () => hook.result.current.pickImage());
    expect(useQuickPanelStore.getState()).toMatchObject({ image, errorKey: null });
  });

  it("cleans a late result after unmount without installing it or clearing a newer import", async () => {
    let resolve!: (value: typeof image) => void;
    mockPick.mockReturnValue(new Promise((done) => { resolve = done; }));
    const hook = renderHook(() => useCustomizeActions());
    let pending!: Promise<void>;
    act(() => { pending = hook.result.current.pickImage(); });
    hook.unmount();
    expect(useQuickPanelStore.getState().isProcessingImage).toBe(false);
    useQuickPanelStore.getState().startImageProcessing();
    await act(async () => { resolve(image); await pending; });
    expect(useQuickPanelStore.getState().image).toEqual(oldImage);
    expect(useQuickPanelStore.getState().isProcessingImage).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith(image.ownedCacheUris, expect.any(Object));
  });
});
