import { render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const mockUseCustomizeScreen = jest.fn();
const mockUseSequentialExport = jest.fn();

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

const mockScreenState = {
  activePreset: mockActivePreset,
  error: "Unable to export images.",
  errorKey: "errors.imageTooLarge",
  exportImages: jest.fn(),
  goToAdvancedCalibration: jest.fn(),
  goToCalibration: jest.fn(),
  image: null,
  isExporting: false,
  isPreviewAdjusting: false,
  isProcessingImage: false,
  noticeKey: "customize.imageOptimized",
  pickImage: jest.fn(),
  refs: {},
  resetFit: jest.fn(),
  canReset: false,
  selectedMode: "default",
  setIsExportSurfaceReady: jest.fn(),
  setIsPreviewAdjusting: jest.fn(),
  setTransform: jest.fn(),
  transform: { scale: 1, x: 0, y: 0 },
};

jest.mock("@/components/ani-ui/slider", () => ({
  Slider: () => null,
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
  CustomizeActions: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/ExportSuccessPanel", () => ({
  ExportSuccessPanel: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/ExportSurfaceHost", () => ({
  ExportSurfaceHost: ({ image }: { image: { uri: string } }) => {
    const { View } = jest.requireActual("react-native");
    return <View accessibilityLabel={image.uri} testID="export-surfaces" />;
  },
}));

jest.mock("@/features/quick-panel/customize/components/ImagePickerCard", () => ({
  ImagePickerCard: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/QuickPanelPreview", () => ({
  QuickPanelPreview: ({ previewUri }: { previewUri: string }) => {
    const { View } = jest.requireActual("react-native");
    return <View accessibilityLabel={previewUri} testID="quick-panel-preview" />;
  },
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizeScreen", () => ({
  useCustomizeScreen: () => mockUseCustomizeScreen(),
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizePreviewImage", () => ({
  useCustomizePreviewImage: () => ({
    isPreparingPreview: false,
    previewUri: "file:///preview.png",
  }),
}));

jest.mock("@/features/quick-panel/customize/hooks/useSequentialExport", () => ({
  useSequentialExport: () => mockUseSequentialExport(),
}));

describe("CustomizeScreen", () => {
  beforeEach(() => {
    mockUseCustomizeScreen.mockReturnValue(mockScreenState);
    mockUseSequentialExport.mockReturnValue({
      activePanel: null,
      activeToken: null,
      exportRef: { current: null },
      markIdentifierReady: jest.fn(),
      markImageReady: jest.fn(),
      startExport: jest.fn(),
    });
  });

  it("renders the inline notice via translation key", () => {
    render(<CustomizeScreen />);

    expect(screen.getByText("customize.imageOptimized")).toBeTruthy();
  });

  it("renders the inline error banner", () => {
    render(<CustomizeScreen />);

    expect(screen.getByText("errors.imageTooLarge")).toBeTruthy();
    expect(screen.getByText("Unable to export images.")).toBeTruthy();
  });

  it("uses the proxy only for preview while export keeps the original URI", () => {
    mockUseCustomizeScreen.mockReturnValue({
      ...mockScreenState,
      image: {
        height: 1080,
        uri: "file:///normalized-original.png",
        width: 1920,
      },
      isExporting: true,
    });
    mockUseSequentialExport.mockReturnValue({
      activePanel: {
        id: "button-1",
        label: "Wi-Fi",
        fileName: "01-wi-fi.png",
        family: "button",
        rect: { x: 0, y: 0, width: 50, height: 50, radius: 0 },
      },
      activeToken: { panelId: "button-1", runId: 1 },
      exportRef: { current: null },
      markIdentifierReady: jest.fn(),
      markImageReady: jest.fn(),
      startExport: jest.fn(),
    });

    render(<CustomizeScreen />);

    expect(screen.getByTestId("quick-panel-preview").props.accessibilityLabel).toBe(
      "file:///preview.png",
    );
    expect(screen.getByTestId("export-surfaces").props.accessibilityLabel).toBe(
      "file:///normalized-original.png",
    );
  });
});
