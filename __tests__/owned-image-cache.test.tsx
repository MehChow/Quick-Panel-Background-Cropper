import { act, renderHook } from "@testing-library/react-native";
import { useOwnedImageCache } from "@/features/quick-panel/cache/useOwnedImageCache";

const mockDeleteOwnedCacheUris = jest.fn();

jest.mock("@/features/quick-panel/cache/cache-files", () => ({
  deleteOwnedCacheUris: (...args: unknown[]) => mockDeleteOwnedCacheUris(...args),
}));

describe("useOwnedImageCache", () => {
  beforeEach(() => {
    mockDeleteOwnedCacheUris.mockReset();
  });

  it("releases a tracked image once", () => {
    const hook = renderHook(() => useOwnedImageCache());
    const image = {
      height: 100,
      ownedCacheUris: ["file:///cache/ImagePicker/source.jpg"],
      uri: "file:///cache/ImagePicker/source.jpg",
      width: 100,
    };

    act(() => hook.result.current.track(image));
    act(() => hook.result.current.release(image));
    hook.unmount();

    expect(mockDeleteOwnedCacheUris).toHaveBeenCalledTimes(1);
    expect(mockDeleteOwnedCacheUris).toHaveBeenCalledWith(
      image.ownedCacheUris,
      { action: "cleanup_owned_image" },
    );
  });

  it("releases every still-tracked URI on unmount", () => {
    const hook = renderHook(() => useOwnedImageCache());
    const optimizedImage = {
      height: 100,
      ownedCacheUris: [
        "file:///cache/ImagePicker/source.jpg",
        "file:///cache/ImageManipulator/optimized.jpg",
      ],
      uri: "file:///cache/ImageManipulator/optimized.jpg",
      width: 100,
    };

    act(() => hook.result.current.track(optimizedImage));
    hook.unmount();

    expect(mockDeleteOwnedCacheUris).toHaveBeenCalledWith(
      optimizedImage.ownedCacheUris,
      { action: "cleanup_owned_image" },
    );
  });
});
