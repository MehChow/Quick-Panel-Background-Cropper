import { preparePickedImage } from "@/features/quick-panel/shared/prepare-picked-image";

const mockLoad = jest.fn();
const mockManipulate = jest.fn();
const mockSave = jest.fn();
const mockSourceRelease = jest.fn();
const mockContextRelease = jest.fn();
const mockRenderedRelease = jest.fn();
const mockRender = jest.fn();
const mockResize = jest.fn();
jest.mock("expo-image", () => ({ Image: { loadAsync: (...args: unknown[]) => mockLoad(...args) } }));
jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: { manipulate: (...args: unknown[]) => mockManipulate(...args) },
  SaveFormat: { JPEG: "jpeg", PNG: "png" },
}));

const large = { uri: "file:///large.jpg", width: 5152, height: 7728, mimeType: "image/jpeg" };
describe("shared image preparation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoad.mockResolvedValue({ width: 2048, height: 3072, release: mockSourceRelease });
    mockManipulate.mockReturnValue({ renderAsync: mockRender, release: mockContextRelease, resize: mockResize });
    mockRender.mockResolvedValue({ saveAsync: mockSave, release: mockRenderedRelease });
    mockSave.mockResolvedValue({ uri: "file:///optimized.jpg", width: 2048, height: 3072 });
  });

  it("accepts the reported 39.8MP JPEG using bounded decoding before encoding", async () => {
    const image = await preparePickedImage(large);
    expect(image).toMatchObject({ width: 2048, height: 3072, uri: "file:///optimized.jpg" });
    expect(mockLoad).toHaveBeenCalledWith(large.uri, { maxWidth: 3072, maxHeight: 3072 });
    expect(mockManipulate).toHaveBeenCalledWith(await mockLoad.mock.results[0].value);
    expect(mockSave).toHaveBeenCalledWith({ compress: 0.9, format: "jpeg" });
    expect(mockSourceRelease).toHaveBeenCalledTimes(1);
    expect(mockContextRelease).toHaveBeenCalledTimes(1);
    expect(mockRenderedRelease).toHaveBeenCalledTimes(1);
  });

  it("keeps small images and ownership unchanged without decoding", async () => {
    const small = { ...large, width: 1536, height: 2048, ownedCacheUris: [large.uri] };
    expect(await preparePickedImage(small)).toBe(small);
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it("avoids native zero-width downsampling for a low-pixel-count strip", async () => {
    mockLoad.mockResolvedValueOnce({ width: 1, height: 10000, release: mockSourceRelease });
    mockSave.mockResolvedValueOnce({ uri: "file:///thin.png", width: 1, height: 3072 });
    const image = await preparePickedImage({ uri: "file:///thin.png", width: 1, height: 10000 });
    expect(mockLoad).toHaveBeenCalledWith("file:///thin.png", { maxWidth: 1, maxHeight: 10000 });
    expect(mockResize).toHaveBeenCalledWith({ width: 1, height: 3072 });
    expect(image).toMatchObject({ width: 1, height: 3072 });
  });

  it.each(["image/png", "image/webp"])("preserves alpha for %s even without a filename", async (mimeType) => {
    await preparePickedImage({ ...large, mimeType });
    expect(mockSave).toHaveBeenCalledWith({ compress: 1, format: "png" });
  });

  it("uses the decoder's upright dimensions rather than stale picker geometry", async () => {
    mockSave.mockResolvedValue({ uri: "file:///rotated.jpg", width: 3072, height: 2048 });
    expect(await preparePickedImage(large)).toMatchObject({ width: 3072, height: 2048 });
  });

  it("releases all native references when encoding fails", async () => {
    mockSave.mockRejectedValueOnce(new Error("disk full"));
    await expect(preparePickedImage(large)).rejects.toThrow("disk full");
    expect(mockSourceRelease).toHaveBeenCalledTimes(1);
    expect(mockContextRelease).toHaveBeenCalledTimes(1);
    expect(mockRenderedRelease).toHaveBeenCalledTimes(1);
  });

  it("releases the decoded source when creating the context fails", async () => {
    mockManipulate.mockImplementationOnce(() => { throw new Error("context failed"); });
    await expect(preparePickedImage(large)).rejects.toThrow("context failed");
    expect(mockSourceRelease).toHaveBeenCalledTimes(1);
  });

  it("decodes missing dimensions with bounds rather than accepting invalid geometry", async () => {
    expect(await preparePickedImage({ ...large, width: 0, height: 0 })).toMatchObject({ width: 2048, height: 3072 });
    expect(mockLoad).toHaveBeenCalled();
  });
});
