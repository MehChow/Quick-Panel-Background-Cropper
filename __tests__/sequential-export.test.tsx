import { ExportSurfaceHost } from "@/features/quick-panel/customize/components/ExportSurfaceHost";
import {
  useSequentialExport,
  type SequentialExportState,
} from "@/features/quick-panel/customize/hooks/useSequentialExport";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { createInitialQuickPanelStateData } from "@/features/quick-panel/store/quick-panel-defaults";
import { useQuickPanelStore } from "@/features/quick-panel/store/quick-panel-store";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";

const mockCapturePanelExport = jest.fn();
const mockCleanupCapturedExports = jest.fn();
const mockPrefetch = jest.fn();
const mockReplace = jest.fn();
const mockSaveCapturedExports = jest.fn();
let mockController: SequentialExportState | null = null;

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("expo-image", () => ({
  Image: { prefetch: (...args: unknown[]) => mockPrefetch(...args) },
}));

jest.mock("@/features/quick-panel/customize/services/export-files", () => ({
  capturePanelExport: (...args: unknown[]) => mockCapturePanelExport(...args),
  cleanupCapturedExports: (...args: unknown[]) =>
    mockCleanupCapturedExports(...args),
  saveCapturedExports: (...args: unknown[]) => mockSaveCapturedExports(...args),
}));

jest.mock("@/features/quick-panel/customize/schedule-export-work", () => ({
  scheduleExportWork: (work: () => void) => {
    work();
    return { cancel: jest.fn() };
  },
}));

jest.mock("@/features/quick-panel/customize/components/ExportSurface", () => {
  const React = jest.requireActual("react");
  const { View: MockView } = jest.requireActual("react-native");
  return {
    ExportSurface: (props: {
    onIdentifierPositionReady: () => void;
    onImageLoad: () => void;
    panel: { id: string };
    }) => React.createElement(
      MockView,
      null,
      React.createElement(MockView, {
        onSignal: props.onImageLoad,
        testID: `image-ready-${props.panel.id}`,
      }),
      React.createElement(MockView, {
        onSignal: props.onIdentifierPositionReady,
        testID: `identifier-ready-${props.panel.id}`,
      }),
    ),
  };
});

const buttonsPreset = {
  id: "sequential-buttons",
  label: "Sequential Buttons",
  mode: "advanced",
  width: 300,
  height: 300,
  customizationArea: { x: 0, y: 0, width: 300, height: 300, radius: 0 },
  panels: {
    "button-1": {
      id: "button-1",
      label: "Wi-Fi",
      fileName: "01-wi-fi.png",
      family: "button",
      rect: { x: 0, y: 0, width: 200, height: 100, radius: 0 },
      buttonIdentifier: { columnSpan: 2, rowSpan: 1, iconName: "wifi" },
    },
    "button-2": {
      id: "button-2",
      label: "Bluetooth",
      fileName: "02-bluetooth.png",
      family: "button",
      rect: { x: 0, y: 100, width: 100, height: 200, radius: 0 },
      buttonIdentifier: { columnSpan: 1, rowSpan: 2, iconName: "bluetooth" },
    },
    "button-3": {
      id: "button-3",
      label: "Smart View",
      fileName: "03-smart-view.png",
      family: "button",
      rect: { x: 100, y: 100, width: 100, height: 100, radius: 0 },
      buttonIdentifier: { columnSpan: 1, rowSpan: 1, iconName: "scan" },
    },
  },
  visualOrder: ["button-1", "button-2", "button-3"],
  goodLockOrder: ["button-1", "button-2", "button-3"],
} satisfies QuickPanelPreset;

const image = { height: 1080, uri: "file:///normalized.png", width: 1920 };
const transform = { scale: 1, x: 0, y: 0 };

function SequentialExportHarness() {
  const controller = useSequentialExport({
    image,
    isProcessingImage: false,
    preset: buttonsPreset,
    showButtonIdentifiers: true,
  });
  mockController = controller;

  return (
    <View>
      <Pressable onPress={controller.startExport}>
        <Text>start</Text>
      </Pressable>
      {controller.activePanel && controller.activeToken ? (
        <ExportSurfaceHost
          activePanel={controller.activePanel}
          activeToken={controller.activeToken}
          buttonIdentifierOpacity={0.7}
          buttonPanelOpacity={0.78}
          exportRef={controller.exportRef}
          identifierPositions={{ horizontal: 0.5, vertical: 0.5 }}
          image={image}
          markIdentifierReady={controller.markIdentifierReady}
          markImageReady={controller.markImageReady}
          showButtonIdentifiers
          transform={transform}
        />
      ) : null}
    </View>
  );
}

function signalReady(panelId: string, waitsForIdentifier: boolean) {
  act(() => screen.getByTestId(`image-ready-${panelId}`).props.onSignal());
  if (waitsForIdentifier) {
    act(() => screen.getByTestId(`identifier-ready-${panelId}`).props.onSignal());
  }
}

describe("sequential export", () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;

  beforeEach(() => {
    jest.clearAllMocks();
    mockController = null;
    useQuickPanelStore.setState(createInitialQuickPanelStateData());
    mockPrefetch.mockResolvedValue(true);
    mockCapturePanelExport.mockImplementation(
      async (_ref: unknown, panel: { fileName: string; id: string; label: string }) => ({
        fileName: panel.fileName,
        id: panel.id,
        label: panel.label,
        previewUri: `file:///cache/${panel.fileName}`,
        uri: `file:///cache/${panel.fileName}`,
      }),
    );
    mockCleanupCapturedExports.mockResolvedValue(undefined);
    mockSaveCapturedExports.mockResolvedValue(undefined);
    globalThis.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      callback(16);
      return 1;
    });
  });

  afterAll(() => {
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it("mounts and captures one panel at a time in Good Lock order", async () => {
    render(<SequentialExportHarness />);
    fireEvent.press(screen.getByText("start"));

    await screen.findByTestId("export-surface-button-1");
    expect(screen.queryByTestId("export-surface-button-2")).toBeNull();
    act(() => screen.getByTestId("image-ready-button-1").props.onSignal());
    expect(mockCapturePanelExport).not.toHaveBeenCalled();
    act(() => screen.getByTestId("identifier-ready-button-1").props.onSignal());

    await waitFor(() => expect(mockCapturePanelExport).toHaveBeenCalledTimes(1));
    await screen.findByTestId("export-surface-button-2");
    expect(screen.queryByTestId("export-surface-button-1")).toBeNull();
    signalReady("button-2", false);
    await screen.findByTestId("export-surface-button-3");
    signalReady("button-3", false);

    await waitFor(() => expect(mockSaveCapturedExports).toHaveBeenCalledTimes(1));
    expect(mockCapturePanelExport.mock.calls.map((call) => call[1].id)).toEqual([
      "button-1",
      "button-2",
      "button-3",
    ]);
    expect(mockSaveCapturedExports.mock.calls[0][0].map(
      (file: { id: string }) => file.id,
    )).toEqual(["button-1", "button-2", "button-3"]);
    expect(mockReplace).toHaveBeenCalledWith("/result");
    expect(useQuickPanelStore.getState().isExporting).toBe(false);
  });

  it("ignores stale readiness callbacks from an older token", async () => {
    render(<SequentialExportHarness />);
    fireEvent.press(screen.getByText("start"));
    await screen.findByTestId("export-surface-button-1");
    const staleToken = mockController!.activeToken!;
    signalReady("button-1", true);
    await screen.findByTestId("export-surface-button-2");

    mockController!.markImageReady(staleToken);
    mockController!.markIdentifierReady(staleToken);

    expect(mockCapturePanelExport).toHaveBeenCalledTimes(1);
  });

  it("continues with the surface when prefetch fails", async () => {
    mockPrefetch.mockRejectedValue(new Error("prefetch failed"));
    render(<SequentialExportHarness />);

    fireEvent.press(screen.getByText("start"));

    await screen.findByTestId("export-surface-button-1");
    expect(useQuickPanelStore.getState().isExporting).toBe(true);
  });

  it("stops and avoids media save or navigation after capture failure", async () => {
    mockCapturePanelExport.mockRejectedValue(new Error("capture failed"));
    render(<SequentialExportHarness />);
    fireEvent.press(screen.getByText("start"));
    await screen.findByTestId("export-surface-button-1");

    signalReady("button-1", true);

    await waitFor(() => expect(useQuickPanelStore.getState().isExporting).toBe(false));
    expect(mockCleanupCapturedExports).toHaveBeenCalledWith([]);
    expect(mockSaveCapturedExports).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByTestId("export-surface-button-1")).toBeNull();
  });

  it("cleans completed captures and avoids Result after media save failure", async () => {
    mockSaveCapturedExports.mockRejectedValue(new Error("save failed"));
    render(<SequentialExportHarness />);
    fireEvent.press(screen.getByText("start"));
    await screen.findByTestId("export-surface-button-1");
    signalReady("button-1", true);
    await screen.findByTestId("export-surface-button-2");
    signalReady("button-2", false);
    await screen.findByTestId("export-surface-button-3");
    signalReady("button-3", false);

    await waitFor(() => expect(mockCleanupCapturedExports).toHaveBeenCalled());
    expect(mockCleanupCapturedExports.mock.calls[0][0]).toHaveLength(3);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(useQuickPanelStore.getState().isExporting).toBe(false);
  });
});
