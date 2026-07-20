import { createButtonsPreset } from "@/features/quick-panel/calibration/advanced/buttons-geometry";
import { s25PlusOneUi85Preset } from "@/features/quick-panel/model/preset";
import type { GeneratedExport } from "@/features/quick-panel/model/types";
import {
  capturePanelExport,
  cleanupCapturedExports,
  saveCapturedExports,
} from "@/features/quick-panel/customize/services/export-files";
import type { View } from "react-native";
import i18n from "../i18next/i18next";

const mockAlbumCreate = jest.fn();
const mockAlbumGet = jest.fn();
const mockAssetCreate = jest.fn();
const mockCaptureRef = jest.fn();
const mockCopy = jest.fn();
const mockDelete = jest.fn();
const mockReleaseCapture = jest.fn();
const mockRequestPermissionsAsync = jest.fn();

jest.mock("@/lib/crashlytics", () => ({
  recordCrashlyticsError: jest.fn(),
}));

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
    delete = () => mockDelete(this.uri);
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

const generatedFiles: GeneratedExport[] = [
  {
    fileName: "01-button-box.png",
    id: "buttonBox",
    label: "Button box",
    previewUri: "file:///cache/01-button-box.png",
    uri: "file:///cache/01-button-box.png",
  },
  {
    fileName: "02-media-player.png",
    id: "mediaPlayer",
    label: "Media player",
    previewUri: "file:///cache/02-media-player.png",
    uri: "file:///cache/02-media-player.png",
  },
];

describe("export files", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCaptureRef.mockResolvedValue("file:///tmp/01-button-box.png");
    mockAlbumCreate.mockResolvedValue({ id: "created-album" });
    mockAlbumGet.mockResolvedValue(null);
    mockCopy.mockResolvedValue(undefined);
    mockAssetCreate.mockResolvedValue(undefined);
    mockRequestPermissionsAsync.mockResolvedValue({ status: "granted" });
  });

  it("captures one panel with unchanged PNG output options", async () => {
    const view = {} as View;
    const panel = s25PlusOneUi85Preset.panels.buttonBox;

    await expect(capturePanelExport(view, panel)).resolves.toEqual({
      fileName: panel.fileName,
      id: panel.id,
      label: panel.label,
      previewUri: "file:///cache/01-button-box.png",
      uri: "file:///cache/01-button-box.png",
    });
    expect(mockCaptureRef).toHaveBeenCalledWith(view, {
      fileName: "01-button-box",
      format: "png",
      height: 1024,
      quality: 1,
      result: "tmpfile",
      width: 1024,
    });
    expect(mockCopy).toHaveBeenCalledWith(
      expect.objectContaining({ uri: "file:///cache/01-button-box.png" }),
      { overwrite: true },
    );
    expect(mockReleaseCapture).toHaveBeenCalledWith(
      "file:///tmp/01-button-box.png",
    );
  });

  it("releases a temporary capture when copying fails", async () => {
    mockCopy.mockRejectedValue(new Error("copy failed"));

    await expect(
      capturePanelExport(
        {} as View,
        s25PlusOneUi85Preset.panels.buttonBox,
      ),
    ).rejects.toThrow("copy failed");
    expect(mockReleaseCapture).toHaveBeenCalledWith(
      "file:///tmp/01-button-box.png",
    );
  });

  it("saves captures into an existing Android album in order", async () => {
    const album = { id: "album-id" };
    mockAlbumGet.mockResolvedValue(album);

    await saveCapturedExports(generatedFiles);

    expect(mockRequestPermissionsAsync).toHaveBeenCalledWith(true);
    expect(mockAlbumGet).toHaveBeenCalledWith("Quick Panel Exports");
    expect(mockAlbumCreate).not.toHaveBeenCalled();
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      1,
      generatedFiles[0].uri,
      album,
    );
    expect(mockAssetCreate).toHaveBeenNthCalledWith(
      2,
      generatedFiles[1].uri,
      album,
    );
  });

  it("creates the Android album from the first capture", async () => {
    await saveCapturedExports(generatedFiles);

    expect(mockAlbumCreate).toHaveBeenCalledWith("Quick Panel Exports", [
      generatedFiles[0].uri,
    ]);
    expect(mockAssetCreate).toHaveBeenCalledWith(
      generatedFiles[1].uri,
      { id: "created-album" },
    );
  });

  it("throws when media-library permission is denied", async () => {
    mockRequestPermissionsAsync.mockResolvedValue({ status: "denied" });

    await expect(saveCapturedExports(generatedFiles)).rejects.toThrow(
      "Media library permission is required to save exports.",
    );
  });

  it("cleans only captures supplied by the failed run", async () => {
    await cleanupCapturedExports(generatedFiles);

    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenNthCalledWith(1, generatedFiles[0].uri);
    expect(mockDelete).toHaveBeenNthCalledWith(2, generatedFiles[1].uri);
  });

  it("keeps localized labels separate from stable Button filenames", async () => {
    await i18n.changeLanguage("zh");
    try {
      const preset = createButtonsPreset({
        screenshotWidth: 100,
        screenshotHeight: 100,
        grid: { columns: 1, rows: 1 },
        isGridEnabled: true,
        outerRect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
        buttons: [{
          id: "button-1",
          label: "Bluetooth",
          customIconId: null,
          rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 },
        }],
      });

      expect(preset.panels["button-1"]).toMatchObject({
        label: "藍牙",
        fileName: "01-bluetooth.png",
        buttonIdentifier: {
          columnSpan: 1,
          rowSpan: 1,
          iconName: "bluetooth",
        },
      });
    } finally {
      await i18n.changeLanguage("en");
    }
  });

  it("preserves duplicate Button ordering and filenames", () => {
    const preset = createButtonsPreset({
      screenshotWidth: 100,
      screenshotHeight: 100,
      grid: { columns: 2, rows: 1 },
      isGridEnabled: true,
      outerRect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
      buttons: [
        { id: "button-1", label: "Wi-Fi", customIconId: null, rect: { x: 0, y: 0, width: 40, height: 40, radius: 0 } },
        { id: "button-2", label: "Wi-Fi", customIconId: null, rect: { x: 50, y: 0, width: 40, height: 40, radius: 0 } },
      ],
    });

    expect(preset.goodLockOrder).toEqual(["button-1", "button-2"]);
    expect(preset.goodLockOrder.map((id) => preset.panels[id].fileName)).toEqual([
      "01-wi-fi.png",
      "02-wi-fi-2.png",
    ]);
  });
});
