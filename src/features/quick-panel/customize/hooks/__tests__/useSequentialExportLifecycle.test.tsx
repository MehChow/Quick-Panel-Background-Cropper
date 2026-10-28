import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { View } from "react-native";
import type { GeneratedExport, QuickPanelPreset } from "../../../model/types";
import { useSequentialExportLifecycle } from "../useSequentialExportLifecycle";

const mockCapturePanelExport = jest.fn();
const mockCleanupCapturedExports = jest.fn();
const mockPrefetch = jest.fn();
const mockSaveCapturedExports = jest.fn();

jest.mock("expo-image", () => ({
  Image: { prefetch: (...args: unknown[]) => mockPrefetch(...args) },
}));
jest.mock("../../services/export-files", () => ({
  capturePanelExport: (...args: unknown[]) => mockCapturePanelExport(...args),
  cleanupCapturedExports: (...args: unknown[]) => mockCleanupCapturedExports(...args),
  saveCapturedExports: (...args: unknown[]) => mockSaveCapturedExports(...args),
}));
jest.mock("../../schedule-export-work", () => ({
  scheduleExportWork: (work: () => void) => {
    work();
    return { cancel: jest.fn() };
  },
}));

const preset: QuickPanelPreset = {
  id: "lifecycle-controls", label: "Controls", mode: "default",
  width: 100, height: 200,
  customizationArea: { x: 0, y: 0, width: 100, height: 200, radius: 0 },
  panels: {
    buttonBox: {
      id: "buttonBox", label: "Button box", fileName: "01-button-box.png",
      family: "control", rect: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
    },
    mediaPlayer: {
      id: "mediaPlayer", label: "Media player", fileName: "02-media-player.png",
      family: "control", rect: { x: 0, y: 100, width: 100, height: 100, radius: 0 },
    },
  },
  goodLockOrder: ["buttonBox", "mediaPlayer"],
  visualOrder: ["buttonBox", "mediaPlayer"],
};
const firstCapture: GeneratedExport = {
  id: "buttonBox", label: "Button box", fileName: "01-button-box.png",
  uri: "file:///cache/01-button-box.png", previewUri: "file:///cache/01-button-box.png",
};
const lateCapture: GeneratedExport = {
  id: "mediaPlayer", label: "Media player", fileName: "02-media-player.png",
  uri: "file:///cache/02-media-player.png", previewUri: "file:///cache/02-media-player.png",
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => { resolve = settle; });
  return { promise, resolve };
}

function setup() {
  const onStarted = jest.fn();
  const onFinished = jest.fn();
  const onFailed = jest.fn();
  const hook = renderHook(() => useSequentialExportLifecycle({
    image: { uri: "file:///working.png", width: 1920, height: 1080 },
    isProcessingImage: false, preset, buttonIdentifierContentMode: "none",
    onStarted, onFinished, onFailed,
  }));
  hook.result.current.exportRef.current = {} as View;
  return { ...hook, onStarted, onFinished, onFailed };
}

describe("sequential export lifecycle", () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefetch.mockResolvedValue(true);
    mockCleanupCapturedExports.mockResolvedValue(undefined);
    mockSaveCapturedExports.mockResolvedValue(undefined);
    globalThis.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      callback(16);
      return 1;
    });
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it("keeps one run when start is repeated during prefetch and capture", async () => {
    const prefetch = deferred<boolean>();
    const capture = deferred<GeneratedExport>();
    mockPrefetch.mockReturnValue(prefetch.promise);
    mockCapturePanelExport.mockReturnValue(capture.promise);
    const hook = setup();

    act(() => {
      hook.result.current.startExport();
      hook.result.current.startExport();
    });
    expect(hook.onStarted).toHaveBeenCalledTimes(1);
    expect(mockPrefetch).toHaveBeenCalledTimes(1);
    await act(async () => prefetch.resolve(true));
    const token = hook.result.current.activeToken!;
    act(() => {
      hook.result.current.markImageReady(token);
      hook.result.current.startExport();
      hook.result.current.markImageReady(token);
    });
    expect(hook.result.current.activeToken).toEqual(token);
    expect(hook.onStarted).toHaveBeenCalledTimes(1);
    expect(mockCapturePanelExport).toHaveBeenCalledTimes(1);
    await act(async () => capture.resolve(firstCapture));
    expect(hook.result.current.activePanel?.id).toBe("mediaPlayer");
    expect(mockSaveCapturedExports).not.toHaveBeenCalled();
  });

  it("cleans completed and late captures when an in-flight capture finishes after unmount", async () => {
    const capture = deferred<GeneratedExport>();
    mockCapturePanelExport.mockResolvedValueOnce(firstCapture)
      .mockReturnValueOnce(capture.promise);
    const hook = setup();
    act(() => hook.result.current.startExport());
    await waitFor(() => expect(hook.result.current.activePanel?.id).toBe("buttonBox"));
    act(() => hook.result.current.markImageReady(hook.result.current.activeToken!));
    await waitFor(() => expect(hook.result.current.activePanel?.id).toBe("mediaPlayer"));
    act(() => hook.result.current.markImageReady(hook.result.current.activeToken!));
    expect(mockCapturePanelExport).toHaveBeenCalledTimes(2);

    hook.unmount();
    expect(mockCleanupCapturedExports).toHaveBeenCalledWith([firstCapture]);
    await act(async () => capture.resolve(lateCapture));

    expect(mockCleanupCapturedExports.mock.calls).toEqual([
      [[firstCapture]], [[lateCapture]],
    ]);
    expect(mockSaveCapturedExports).not.toHaveBeenCalled();
    expect(hook.onFinished).not.toHaveBeenCalled();
    expect(hook.onFailed).not.toHaveBeenCalled();
  });
});
