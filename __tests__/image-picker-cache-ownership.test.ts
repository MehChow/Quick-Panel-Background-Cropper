import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";

const mockLaunchImageLibraryAsync = jest.fn();
const mockPrepare = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/features/quick-panel/shared/prepare-picked-image", () => ({
  preparePickedImage: (...args: unknown[]) => mockPrepare(...args),
}));
jest.mock("@/features/quick-panel/cache/cache-files", () => ({
  deleteOwnedCacheUris: (...args: unknown[]) => mockDelete(...args),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

describe("image picker cache ownership", () => {
  beforeEach(() => {
    mockLaunchImageLibraryAsync.mockReset();
    mockPrepare.mockReset().mockImplementation((asset) => Promise.resolve(asset));
    mockDelete.mockReset();
  });

  it("marks the picker-created copy as owned", async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      assets: [{
        fileName: "picked.jpg",
        height: 100,
        uri: "file:///cache/ImagePicker/picked.jpg",
        width: 100,
      }],
      canceled: false,
    });

    await expect(pickImageFromLibrary()).resolves.toMatchObject({
      ownedCacheUris: ["file:///cache/ImagePicker/picked.jpg"],
      uri: "file:///cache/ImagePicker/picked.jpg",
    });
  });

  it("prepares once and deletes the redundant picker copy after successful normalization", async () => {
    const raw = { uri: "file:///cache/ImagePicker/large.jpg", width: 5152, height: 7728, mimeType: "image/jpeg", fileSize: 9000000 };
    const prepared = { uri: "file:///cache/ImageManipulator/working.jpg", width: 2048, height: 3072, ownedCacheUris: ["file:///cache/ImageManipulator/working.jpg"] };
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [raw] });
    mockPrepare.mockResolvedValue(prepared);
    expect(await pickImageFromLibrary()).toEqual(prepared);
    expect(mockPrepare).toHaveBeenCalledWith(expect.objectContaining(raw));
    expect(mockDelete).toHaveBeenCalledWith([raw.uri], expect.any(Object));
  });

  it("cleans a failed import and preserves its cause without exposing native text", async () => {
    const cause = new Error("private native path / broken decoder");
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: "file:///cache/ImagePicker/bad.jpg", width: 8000, height: 6000 }] });
    mockPrepare.mockRejectedValue(cause);
    await expect(pickImageFromLibrary()).rejects.toMatchObject({ message: "errors.unableToProcessImage", cause });
    expect(mockDelete).toHaveBeenCalledWith(["file:///cache/ImagePicker/bad.jpg"], expect.any(Object));
  });

  it("does no preparation when selection is cancelled", async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null });
    expect(await pickImageFromLibrary()).toBeNull();
    expect(mockPrepare).not.toHaveBeenCalled();
  });
});
