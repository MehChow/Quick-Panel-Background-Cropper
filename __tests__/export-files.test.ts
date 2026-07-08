import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type { ExportRefs } from "@/features/quick-panel/model/types";
import { createButtonsPreset } from "@/features/quick-panel/calibration/advanced/buttons-geometry";
import { captureAndSaveExports } from "@/features/quick-panel/customize/services/export-files";
import type { View } from "react-native";

const mockAlbumCreate = jest.fn();
const mockAlbumGet = jest.fn();
const mockAssetCreate = jest.fn();
const mockCaptureRef = jest.fn();
const mockReleaseCapture = jest.fn();
const mockCopy = jest.fn();
const mockRequestPermissionsAsync = jest.fn();

jest.mock("expo-media-library", () => ({
  Album: {
    create: (...args: unknown[]) => mockAlbumCreate(...args),
    get: (...args: unknown[]) => mockAlbumGet(...args),
  },
  Asset: {
    create: (...args: unknown[]) => mockAssetCreate(...args),
  },
  requestPermissionsAsync: (...args: unknown[]) =>
    mockRequestPermissionsAsync(...args),
}));

jest.mock("react-native-view-shot", () => ({
  captureRef: (...args: unknown[]) => mockCaptureRef(...args),
  releaseCapture: (...args: unknown[]) => mockReleaseCapture(...args),
}));

jest.mock("expo-file-system", () => ({
  File: class MockFile {
    uri: string;

    constructor(...parts: string[]) {
      this.uri = parts.join("/");
    }

    copy = (...args: unknown[]) => mockCopy(...args);
  },
  Paths: {
    cache: "file:///cache",
  },
}));

jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
  },
}));

function createRefs(): ExportRefs {
  const view = {} as View;
  return {
    brightness: { current: view },
    buttonBox: { current: view },
    mediaPlayer: { current: view },
    volume: { current: view },
  };
}

describe("captureAndSaveExports", () => {
  beforeEach(() => {
    mockAlbumCreate.mockReset();
    mockAlbumGet.mockReset();
    mockAssetCreate.mockReset();
    mockCaptureRef.mockReset();
    mockReleaseCapture.mockReset();
    mockCopy.mockReset();
    mockRequestPermissionsAsync.mockReset();

    mockCaptureRef.mockImplementation(
      async (_ref: unknown, options: { fileName: string }) =>
        `file:///tmp/${options.fileName}.png`,
    );
    mockAlbumCreate.mockResolvedValue({ id: "created-album" });
    mockAlbumGet.mockResolvedValue(null);
    mockCopy.mockResolvedValue(undefined);
    mockAssetCreate.mockResolvedValue(undefined);
    mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });
  });

  it("saves exports into an existing Android album", async () => {
    const album = { id: "album-id" };
    mockAlbumGet.mockResolvedValue(album);

    const result = await captureAndSaveExports(
      createRefs(),
      s25PlusOneUi85Preset,
    );

    expect(result).toHaveLength(4);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledWith(true);
    expect(mockAlbumGet).toHaveBeenCalledWith("Quick Panel Exports");
    expect(mockAlbumCreate).not.toHaveBeenCalled();
    expect(mockAssetCreate).toHaveBeenCalledTimes(4);
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      1,
      "file:///cache/01-button-box.png",
      album,
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      2,
      "file:///cache/02-media-player.png",
      album,
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      3,
      "file:///cache/03-brightness.png",
      album,
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      4,
      "file:///cache/04-volume.png",
      album,
    );
  });

  it("creates the Android album on first export", async () => {
    await captureAndSaveExports(createRefs(), s25PlusOneUi85Preset);

    expect(mockAlbumCreate).toHaveBeenCalledWith("Quick Panel Exports", [
      "file:///cache/01-button-box.png",
    ]);
    expect(mockAssetCreate).toHaveBeenCalledTimes(3);
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      1,
      "file:///cache/02-media-player.png",
      { id: "created-album" },
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      2,
      "file:///cache/03-brightness.png",
      { id: "created-album" },
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      3,
      "file:///cache/04-volume.png",
      { id: "created-album" },
    );
  });

  it("throws when media library permission is denied", async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: "denied" });

    await expect(
      captureAndSaveExports(createRefs(), s25PlusOneUi85Preset),
    ).rejects.toThrow("Media library permission is required to save exports.");
  });

  it("throws when an export surface ref is missing", async () => {
    const refs = createRefs();
    refs.mediaPlayer!.current = null;

    await expect(
      captureAndSaveExports(refs, s25PlusOneUi85Preset),
    ).rejects.toThrow("The export preview for Media player is unavailable.");
  });

  it("exports dynamic button refs in reviewed order with duplicate filenames", async () => {
    const view = {} as View;
    const preset = createButtonsPreset({
      screenshotWidth: 100,
      screenshotHeight: 100,
      grid: { columns: 2, rows: 1 },
      outerRect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
      buttons: [
        { id: "button-1", label: "Wi-Fi", rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 } },
        { id: "button-2", label: "Wi-Fi", rect: { x: 50, y: 0, width: 40, height: 40, radius: 0 } },
      ],
    });

    const result = await captureAndSaveExports(
      { "button-1": { current: view }, "button-2": { current: view } },
      preset,
    );

    expect(result.map((file) => file.fileName)).toEqual([
      "01-wi-fi.png",
      "02-wi-fi-2.png",
    ]);
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      1,
      "file:///cache/02-wi-fi-2.png",
      { id: "created-album" },
    );
  });
});
