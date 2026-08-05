import { pickImageFromLibrary } from "@/features/quick-panel/shared/pick-image-from-library";

const mockLaunchImageLibraryAsync = jest.fn();

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

describe("image picker cache ownership", () => {
  beforeEach(() => {
    mockLaunchImageLibraryAsync.mockReset();
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
});
