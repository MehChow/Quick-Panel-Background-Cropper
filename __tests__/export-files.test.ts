import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type { ExportRefs } from "@/features/quick-panel/model/types";
import { captureAndSaveExports } from "@/features/quick-panel/customize/services/export-files";
import type { View } from "react-native";

const mockRequestPermissionsAsync = jest.fn();
const mockAlbumGet = jest.fn();
const mockAlbumCreate = jest.fn();
const mockAssetCreate = jest.fn();
const mockCaptureRef = jest.fn();
const mockReleaseCapture = jest.fn();
const mockCopy = jest.fn();

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
    mockRequestPermissionsAsync.mockReset();
    mockAlbumGet.mockReset();
    mockAlbumCreate.mockReset();
    mockAssetCreate.mockReset();
    mockCaptureRef.mockReset();
    mockReleaseCapture.mockReset();
    mockCopy.mockReset();

    mockCaptureRef.mockImplementation(
      async (_ref: unknown, options: { fileName: string }) =>
        `file:///tmp/${options.fileName}.png`,
    );
    mockCopy.mockResolvedValue(undefined);
    mockAlbumGet.mockResolvedValue({ id: "existing-album" });
  });

  it("throws a translated error when media permission is denied", async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ granted: false });

    await expect(
      captureAndSaveExports(createRefs(), s25PlusOneUi85Preset),
    ).rejects.toThrow("Media library permission is required to save exports.");
  });

  it("throws when an export surface ref is missing", async () => {
    const refs = createRefs();
    refs.mediaPlayer.current = null;

    await expect(
      captureAndSaveExports(refs, s25PlusOneUi85Preset),
    ).rejects.toThrow("Export surface is missing for Media player.");
  });
});
