import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type { ExportRefs } from "@/features/quick-panel/model/types";
import { captureAndSaveExports } from "@/features/quick-panel/customize/services/export-files";
import type { View } from "react-native";

const mockAssetCreate = jest.fn();
const mockCaptureRef = jest.fn();
const mockReleaseCapture = jest.fn();
const mockCopy = jest.fn();

jest.mock("expo-media-library", () => ({
  Asset: {
    create: (...args: unknown[]) => mockAssetCreate(...args),
  },
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
    mockAssetCreate.mockReset();
    mockCaptureRef.mockReset();
    mockReleaseCapture.mockReset();
    mockCopy.mockReset();

    mockCaptureRef.mockImplementation(
      async (_ref: unknown, options: { fileName: string }) =>
        `file:///tmp/${options.fileName}.png`,
    );
    mockCopy.mockResolvedValue(undefined);
    mockAssetCreate.mockResolvedValue(undefined);
  });

  it("creates media library assets for each captured export", async () => {
    const result = await captureAndSaveExports(
      createRefs(),
      s25PlusOneUi85Preset,
    );

    expect(result).toHaveLength(4);
    expect(mockAssetCreate).toHaveBeenCalledTimes(4);
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      1,
      "file:///cache/01-button-box.png",
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      2,
      "file:///cache/02-media-player.png",
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      3,
      "file:///cache/03-brightness.png",
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      4,
      "file:///cache/04-volume.png",
    );
  });

  it("throws when an export surface ref is missing", async () => {
    const refs = createRefs();
    refs.mediaPlayer.current = null;

    await expect(
      captureAndSaveExports(refs, s25PlusOneUi85Preset),
    ).rejects.toThrow("The export preview for Media player is unavailable.");
  });
});
