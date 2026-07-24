import { normalizeCustomizeImage } from "@/features/quick-panel/customize/services/normalize-customize-image";

const mockImageManipulatorContext = {
  renderAsync: jest.fn(),
  resize: jest.fn(),
};
const mockManipulate = jest.fn();
const mockSaveAsync = jest.fn();

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: {
    manipulate: (...args: unknown[]) => mockManipulate(...args),
  },
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

describe("normalizeCustomizeImage", () => {
  beforeEach(() => {
    mockManipulate.mockReset();
    mockSaveAsync.mockReset();
    mockImageManipulatorContext.renderAsync.mockReset();
    mockImageManipulatorContext.resize.mockReset();

    mockImageManipulatorContext.resize.mockReturnValue(
      mockImageManipulatorContext,
    );
    mockImageManipulatorContext.renderAsync.mockResolvedValue({
      saveAsync: mockSaveAsync,
    });
    mockManipulate.mockReturnValue(mockImageManipulatorContext);
    mockSaveAsync.mockResolvedValue({
      height: 3072,
      uri: "file:///optimized.jpg",
      width: 2048,
    });
  });

  it("keeps moderate images unchanged", async () => {
    const result = await normalizeCustomizeImage({
      fileName: "wallpaper.jpg",
      fileSize: 3_000_000,
      height: 2048,
      mimeType: "image/jpeg",
      uri: "file:///original.jpg",
      width: 1536,
    });

    expect(result).toEqual({
      image: {
        fileName: "wallpaper.jpg",
        height: 2048,
        uri: "file:///original.jpg",
        width: 1536,
      },
    });
    expect(mockManipulate).not.toHaveBeenCalled();
  });

  it("optimizes large images locally without changing the user-facing flow", async () => {
    const result = await normalizeCustomizeImage({
      fileName: "wallpaper.jpg",
      fileSize: 9_000_000,
      height: 4500,
      mimeType: "image/jpeg",
      uri: "file:///original.jpg",
      width: 3000,
    });

    expect(mockManipulate).toHaveBeenCalledWith("file:///original.jpg");
    expect(mockImageManipulatorContext.resize).toHaveBeenCalledWith({
      height: 3072,
      width: 2048,
    });
    expect(mockSaveAsync).toHaveBeenCalledWith({
      compress: 0.9,
      format: "jpeg",
    });
    expect(result).toEqual({
      image: {
        fileName: "wallpaper.jpg",
        height: 3072,
        originalHeight: 4500,
        originalWidth: 3000,
        uri: "file:///optimized.jpg",
        wasOptimized: true,
        width: 2048,
      },
    });
  });

  it("rejects extremely large images before processing", async () => {
    await expect(
      normalizeCustomizeImage({
        fileName: "wallpaper.png",
        fileSize: 25_000_000,
        height: 5000,
        mimeType: "image/png",
        uri: "file:///huge.png",
        width: 5000,
      }),
    ).rejects.toThrow("errors.imageTooLarge");

    expect(mockManipulate).not.toHaveBeenCalled();
  });
});
