import { fireEvent, render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

const mockUseCustomizeScreen = jest.fn();
let mockPreviewProps: Record<string, unknown> | null = null;
let mockExportProps: Record<string, unknown> | null = null;
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
        if (typeof onValueChange === "function") onValueChange(35);
      },
    });
  },
}));

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
  QuickPanelPreview: (props: Record<string, unknown>) => {
    mockPreviewProps = props;
    return null;
  },
}));

jest.mock("@/features/quick-panel/customize/components/ExportSurfaces", () => ({
  ExportSurfaces: (props: Record<string, unknown>) => {
    mockExportProps = props;
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(Text, null, "export-surfaces");
  },
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizeScreen", () => ({
  useCustomizeScreen: () => mockUseCustomizeScreen(),
}));

function createScreenState(
  shouldRenderExportSurfaces: boolean,
  activePreset: QuickPanelPreset = mockActivePreset,
) {
  return {
    activePreset,
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
  beforeEach(() => {
    mockPreviewProps = null;
    mockExportProps = null;
  });

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

  it("keeps Button identifier controls screen-local and synchronized", () => {
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
          rect: { x: 0, y: 0, width: 100, height: 100, radius: 0 },
          buttonIdentifier: { columnSpan: 1, rowSpan: 1, iconName: "wifi" as const },
        },
      },
      visualOrder: ["button-1" as const],
      goodLockOrder: ["button-1" as const],
    } satisfies QuickPanelPreset;
    mockUseCustomizeScreen.mockReturnValue(createScreenState(true, buttonPreset));

    const mounted = render(<CustomizeScreen />);

    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: true,
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: true,
    });

    fireEvent.press(screen.getByRole("switch"));
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: false,
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: false,
    });

    fireEvent.press(screen.getByRole("switch"));
    fireEvent.press(screen.getByTestId("button-identifier-opacity-slider"));
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.35,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: true,
    });
    expect(mockExportProps).toMatchObject({
      buttonIdentifierOpacity: 0.35,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: true,
    });

    mounted.unmount();
    render(<CustomizeScreen />);
    expect(mockPreviewProps).toMatchObject({
      buttonIdentifierOpacity: 0.7,
      buttonPanelOpacity: 0.78,
      showButtonIdentifiers: true,
    });
  });
});
