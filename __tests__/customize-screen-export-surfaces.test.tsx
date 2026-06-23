import { render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";

const mockUseCustomizeScreen = jest.fn();

jest.mock("react-i18next", () => ({
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

jest.mock("@/features/quick-panel/customize/components/ImagePickerCard", () => ({
  ImagePickerCard: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/QuickPanelPreview", () => ({
  QuickPanelPreview: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/ExportSurfaces", () => ({
  ExportSurfaces: () => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(Text, null, "export-surfaces");
  },
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizeScreen", () => ({
  useCustomizeScreen: () => mockUseCustomizeScreen(),
}));

function createScreenState(shouldRenderExportSurfaces: boolean) {
  return {
    activePreset: { mode: "default" },
    error: null,
    exportImages: jest.fn(),
    exportLoadToken: 1,
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
    shouldRenderExportSurfaces,
    transform: { scale: 1, x: 0, y: 0 },
    goToCalibration: jest.fn(),
    goToAdvancedCalibration: jest.fn(),
  };
}

describe("CustomizeScreen export surfaces", () => {
  it("does not mount export surfaces during normal preview", () => {
    mockUseCustomizeScreen.mockReturnValue(createScreenState(false));

    render(<CustomizeScreen />);

    expect(screen.queryByText("export-surfaces")).toBeNull();
  });

  it("mounts export surfaces only while export rendering is needed", () => {
    mockUseCustomizeScreen.mockReturnValue(createScreenState(true));

    render(<CustomizeScreen />);

    expect(screen.getByText("export-surfaces")).toBeTruthy();
  });
});
