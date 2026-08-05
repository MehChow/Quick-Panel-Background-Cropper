import { act, renderHook } from "@testing-library/react-native";
import { useCustomizeActions } from "@/features/quick-panel/customize/hooks/useCustomizeActions";
import { normalizeCustomizeImage } from "@/features/quick-panel/customize/services/normalize-customize-image";
import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";

const mockTrack = jest.fn();
const mockRelease = jest.fn();

jest.mock("@/features/quick-panel/shared/pick-image-from-library", () => ({
  pickImageFromLibrary: jest.fn(),
}));

jest.mock("@/features/quick-panel/customize/services/normalize-customize-image", () => ({
  normalizeCustomizeImage: jest.fn(),
}));

jest.mock("@/features/quick-panel/cache/useOwnedImageCache", () => ({
  useOwnedImageCache: () => ({ release: mockRelease, track: mockTrack }),
}));

describe("Customize image cache ownership", () => {
  const pickedImage = {
    height: 100,
    ownedCacheUris: ["file:///cache/ImagePicker/picked.jpg"],
    uri: "file:///cache/ImagePicker/picked.jpg",
    width: 100,
  };
  const normalizedImage = {
    ...pickedImage,
    ownedCacheUris: [
      "file:///cache/ImagePicker/picked.jpg",
      "file:///cache/ImageManipulator/optimized.jpg",
    ],
    uri: "file:///cache/ImageManipulator/optimized.jpg",
  };

  beforeEach(() => {
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    mockTrack.mockReset();
    mockRelease.mockReset();
    (pickImageFromLibrary as jest.Mock).mockReset();
    (normalizeCustomizeImage as jest.Mock).mockReset();
  });

  it("tracks the picked and normalized source before releasing the previous image", async () => {
    const previousImage = {
      height: 80,
      ownedCacheUris: ["file:///cache/ImagePicker/previous.jpg"],
      uri: "file:///cache/ImagePicker/previous.jpg",
      width: 80,
    };
    useQuickPanelStore.getState().setImage(previousImage);
    (pickImageFromLibrary as jest.Mock).mockResolvedValue(pickedImage);
    (normalizeCustomizeImage as jest.Mock).mockResolvedValue({ image: normalizedImage });
    const hook = renderHook(() => useCustomizeActions());

    await act(async () => hook.result.current.pickImage());

    expect(mockTrack).toHaveBeenNthCalledWith(1, pickedImage);
    expect(mockTrack).toHaveBeenNthCalledWith(2, normalizedImage);
    expect(mockRelease).toHaveBeenCalledWith(previousImage);
  });

  it("releases a newly picked source when normalization fails", async () => {
    (pickImageFromLibrary as jest.Mock).mockResolvedValue(pickedImage);
    (normalizeCustomizeImage as jest.Mock).mockRejectedValue(new Error("failed"));
    const hook = renderHook(() => useCustomizeActions());

    await act(async () => hook.result.current.pickImage());

    expect(mockRelease).toHaveBeenCalledWith(pickedImage);
  });
});
