import { fireEvent, render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const mockUseCustomizeScreen = jest.fn();
const mockUseSequentialExport = jest.fn();
let mockPreviewProps: Record<string, unknown> | null = null;
let mockExportProps: Record<string, unknown> | null = null;
let mockActionProps: Record<string, unknown> | null = null;
const mockActivePreset = {
  id: "test-controls",
  label: "Test Controls",
  mode: "default",
  width: 100,
  height: 100,
  customizationArea: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
  panels: {},
  visualOrder: [],
  goodLockOrder: [],
} satisfies QuickPanelPreset;

jest.mock("@/components/ani-ui/slider", () => ({
  Slider: (props: Record<string, unknown>) => {
    const React = jest.requireActual("react");
    const { Pressable } = jest.requireActual("react-native");
    const onValueChange = props.onValueChange;
    return React.createElement(Pressable, {
      ...props,
      onPress: () => {
        if (typeof onValueChange === "function") {
          onValueChange(props.testID === "vertical-identifier-position-slider" ? 80 : 35);
        }
      },
    });
  },
}));

jest.mock("react-i18next", () => ({
  initReactI18next: { init: jest.fn(), type: "3rdParty" },
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/features/quick-panel/shared/SubPageHeader", () => ({
  SubPageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <>
      <>{title}</>
      <>{subtitle}</>
    </>
  ),
}));

jest.mock("@/features/quick-panel/customize/components/CustomizeActions", () => ({
  CustomizeActions: (props: Record<string, unknown>) => {
    mockActionProps = props;
    return null;
  },
}));

jest.mock("@/features/quick-panel/customize/components/ImagePickerCard", () => ({
  ImagePickerCard: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/QuickPanelPreview", () => ({
  QuickPanelPreview: (props: Record<string, unknown>) => {
    mockPreviewProps = props;
    return null;
  },
}));

jest.mock("@/features/quick-panel/customize/components/ExportSurfaceHost", () => ({
  ExportSurfaceHost: (props: Record<string, unknown>) => {
    mockExportProps = props;
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(Text, null, "export-surfaces");
  },
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizeScreen", () => ({
  useCustomizeScreen: () => mockUseCustomizeScreen(),
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizePreviewImage", () => ({
  useCustomizePreviewImage: (image: { uri: string } | null) => ({
    isPreparingPreview: false,
    previewUri: image?.uri ?? "",
  }),
}));

jest.mock("@/features/quick-panel/customize/hooks/useSequentialExport", () => ({
  useSequentialExport: () => mockUseSequentialExport(),
}));

function createSequentialState(
  isActive: boolean,
  preset: QuickPanelPreset = mockActivePreset,
) {
  const firstPanelId = preset.goodLockOrder[0];
  const activePanel = isActive
    ? (firstPanelId ? preset.panels[firstPanelId] : null) ?? {
        id: "buttonBox" as const,
        label: "Button box",
        fileName: "01-button-box.png",
        family: "control" as const,
        rect: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
      }
    : null;
  return {
    activePanel,
    activeToken: activePanel ? { panelId: activePanel.id, runId: 1 } : null,
    exportRef: { current: null },
    markIdentifierReady: jest.fn(),
    markImageReady: jest.fn(),
    startExport: jest.fn(),
  };
}

function createScreenState(
  activePreset: QuickPanelPreset = mockActivePreset,
) {
  return {
    activePreset,
    error: null,
    exportImages: jest.fn(),
    image: { height: 2000, uri: "file:///image.jpg", width: 1500 },
    isExporting: false,
    isPreviewAdjusting: false,
    isProcessingImage: false,
    notice: null,
    pickImage: jest.fn(),
    refs: {
      brightness: { current: null },
      buttonBox: { current: null },
      mediaPlayer: { current: null },
      volume: { current: null },
    },
    resetFit: jest.fn(),
    canReset: false,
    selectedMode: "default",
    setIsPreviewAdjusting: jest.fn(),
    setIsExportSurfaceReady: jest.fn(),
    setTransform: jest.fn(),
    transform: { scale: 1, x: 0, y: 0 },
    goToCalibration: jest.fn(),
    goToAdvancedCalibration: jest.fn(),
  };
}

describe("CustomizeScreen export surfaces", () => {
  beforeEach(() => {
    mockPreviewProps = null;
    mockExportProps = null;
    mockActionProps = null;
    mockUseSequentialExport.mockReturnValue(createSequentialState(false));
  });

  it("does not mount export surfaces during normal preview", () => {
    mockUseCustomizeScreen.mockReturnValue(createScreenState());

    render(<CustomizeScreen />);

    expect(screen.queryByText("export-surfaces")).toBeNull();
    expect(mockPreviewProps).not.toHaveProperty("showSourceImageContext");
    expect(mockActionProps).not.toHaveProperty("showSourceImageContext");
    expect(mockActionProps).not.toHaveProperty(
      "onShowSourceImageContextChange",
    );
  });

  it("mounts export surfaces only while export rendering is needed", () => {
    mockUseCustomizeScreen.mockReturnValue(createScreenState());
    mockUseSequentialExport.mockReturnValue(createSequentialState(true));

    render(<CustomizeScreen />);

    expect(screen.getByText("export-surfaces")).toBeTruthy();
    expect(mockPreviewProps).not.toHaveProperty("showSourceImageContext");
    expect(mockActionProps).not.toHaveProperty("showSourceImageContext");
    expect(mockActionProps).not.toHaveProperty(
      "onShowSourceImageContextChange",
    );
    expect(mockExportProps).not.toHaveProperty("showSourceImageContext");
    expect(mockExportProps).not.toHaveProperty(
      "onShowSourceImageContextChange",
    );
  });

  it("persists Button customization controls and keeps preview/export synchronized", () => {
    const buttonPreset = {
      ...mockActivePreset,
      id: "test-buttons",
      mode: "advanced" as const,
      panels: {
        "button-1": {
          id: "button-1" as const,
          label: "Wi-Fi",
          fileName: "01-wi-fi.png",
          family: "button" as const,
          rect: { x: 0, y: 0, width: 100, height: 50, radius: 0 },
          buttonIdentifier: {
            columnSpan: 2,
            rowSpan: 1,
            iconName: "wifi" as const,
            referenceCellSize: 50,
          },
        },
        "button-2": {
          id: "button-2" as const,
          label: "Bluetooth",
          fileName: "02-bluetooth.png",
          family: "button" as const,
          rect: { x: 0, y: 50, width: 50, height: 100, radius: 0 },
          buttonIdentifier: {
            columnSpan: 1,
            rowSpan: 2,
            iconName: "bluetooth" as const,
            referenceCellSize: 50,
          },
        },
        "button-3": {
          id: "button-3" as const,
          label: "Smart View",
          fileName: "03-smart-view.png",
          family: "button" as const,
          rect: { x: 50, y: 50, width: 50, height: 50, radius: 0 },
          buttonIdentifier: {
            columnSpan: 1,
            rowSpan: 1,
            iconName: "scan" as const,
            referenceCellSize: 50,
          },
        },
      },
      visualOrder: ["button-1" as const, "button-2" as const, "button-3" as const],
      goodLockOrder: ["button-1" as const, "button-2" as const, "button-3" as const],
    } satisfies QuickPanelPreset;
    mockUseCustomizeScreen.mockReturnValue(createScreenState(buttonPreset));
    mockUseSequentialExport.mockReturnValue(
      createSequentialState(true, buttonPreset),
    );

    const mounted = render(<CustomizeScreen />);

    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      identifierPositions: { horizontal: 0.5, vertical: 0.5 },
      showButtonIdentifiers: true,
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      identifierPositions: { horizontal: 0.5, vertical: 0.5 },
      showButtonIdentifiers: true,
    });

    fireEvent.press(screen.getByTestId("button-adjustment-horizontal-tab"));
    fireEvent.press(screen.getByTestId("horizontal-identifier-position-slider"));
    fireEvent.press(screen.getByTestId("button-adjustment-vertical-tab"));
    fireEvent.press(screen.getByTestId("vertical-identifier-position-slider"));
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      identifierPositions: { horizontal: 0.35, vertical: 0.8 },
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      identifierPositions: { horizontal: 0.35, vertical: 0.8 },
    });

    fireEvent.press(screen.getByTestId("button-adjustment-image-tab"));
    fireEvent.press(screen.getByTestId("button-panel-opacity-slider"));
    expect(mockPreviewProps).toMatchObject({ buttonPanelOpacity: 0.35 });
    expect(mockExportProps).toMatchObject({ buttonPanelOpacity: 0.35 });

    fireEvent.press(screen.getByRole("switch"));
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.35,
      showButtonIdentifiers: false,
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.35,
      showButtonIdentifiers: false,
    });

    fireEvent.press(screen.getByRole("switch"));
    fireEvent.press(screen.getByTestId("button-adjustment-identifier-tab"));
    fireEvent.press(screen.getByTestId("button-identifier-opacity-slider"));
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.35,
      buttonPanelOpacity: 0.35,
      identifierPositions: { horizontal: 0.35, vertical: 0.8 },
      showButtonIdentifiers: true,
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.35,
      buttonPanelOpacity: 0.35,
      identifierPositions: { horizontal: 0.35, vertical: 0.8 },
      showButtonIdentifiers: true,
    });

    mounted.unmount();
    render(<CustomizeScreen />);
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.35,
      buttonPanelOpacity: 0.35,
      identifierPositions: { horizontal: 0.35, vertical: 0.8 },
      showButtonIdentifiers: true,
    });
  });
});
