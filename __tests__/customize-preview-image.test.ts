import {
  createCustomizePreviewImage,
  getCustomizePreviewResize,
} from "@/features/quick-panel/customize/services/create-customize-preview-image";
import { useCustomizePreviewImage } from "@/features/quick-panel/customize/hooks/useCustomizePreviewImage";
import { renderHook, waitFor } from "@testing-library/react-native";

const mockContext = {
  renderAsync: jest.fn(),
  resize: jest.fn(),
};
const mockDelete = jest.fn();
const mockManipulate = jest.fn();
const mockSaveAsync = jest.fn();

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: {
    manipulate: (...args: unknown[]) => mockManipulate(...args),
  },
  SaveFormat: { PNG: "png" },
}));

jest.mock("expo-file-system", () => ({
  File: class {
    uri: string;

    constructor(uri: string) {
      this.uri = uri;
    }

    delete() {
      mockDelete(this.uri);
    }
  },
}));

describe("Customize preview images", () => {
  beforeEach(() => {
    mockContext.renderAsync.mockReset();
    mockContext.resize.mockReset();
    mockDelete.mockReset();
    mockManipulate.mockReset();
    mockSaveAsync.mockReset();
    mockContext.resize.mockReturnValue(mockContext);
    mockContext.renderAsync.mockResolvedValue({ saveAsync: mockSaveAsync });
    mockManipulate.mockReturnValue(mockContext);
    mockSaveAsync.mockResolvedValue({
      height: 608,
      uri: "file:///preview.png",
      width: 1080,
    });
  });

  it("reuses images whose long edge is at most 1080", async () => {
    await expect(
      createCustomizePreviewImage({
        uri: "file:///source.png",
        width: 1080,
        height: 720,
        fileName: "source.png",
      }),
    ).resolves.toEqual({ isOwned: false, uri: "file:///source.png" });
    expect(mockManipulate).not.toHaveBeenCalled();
  });

  it("preserves aspect ratio for landscape and portrait previews", () => {
    expect(getCustomizePreviewResize(1920, 1080)).toEqual({
      width: 1080,
      height: 608,
    });
    expect(getCustomizePreviewResize(900, 1600)).toEqual({
      width: 608,
      height: 1080,
    });
    expect(getCustomizePreviewResize(720, 1080)).toBeNull();
  });

  it("creates an owned PNG preview", async () => {
    await expect(
      createCustomizePreviewImage({
        uri: "file:///source.png",
        width: 1920,
        height: 1080,
      }),
    ).resolves.toEqual({ isOwned: true, uri: "file:///preview.png" });
    expect(mockContext.resize).toHaveBeenCalledWith({
      width: 1080,
      height: 608,
    });
    expect(mockSaveAsync).toHaveBeenCalledWith({
      compress: 1,
      format: "png",
    });
  });

  it("falls back to the original URI when preview generation fails", async () => {
    mockContext.renderAsync.mockRejectedValue(new Error("preview failed"));
    const image = {
      uri: "file:///source.png",
      width: 1920,
      height: 1080,
    };
    const hook = renderHook(() => useCustomizePreviewImage(image));

    await waitFor(() => expect(hook.result.current.isPreparingPreview).toBe(false));
    expect(hook.result.current.previewUri).toBe(image.uri);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("deletes only the owned preview when the hook unmounts", async () => {
    const image = {
      uri: "file:///source.png",
      width: 1920,
      height: 1080,
    };
    const hook = renderHook(() => useCustomizePreviewImage(image));

    await waitFor(() =>
      expect(hook.result.current.previewUri).toBe("file:///preview.png"),
    );
    hook.unmount();

    expect(mockDelete).toHaveBeenCalledWith("file:///preview.png");
    expect(mockDelete).not.toHaveBeenCalledWith(image.uri);
  });
});
