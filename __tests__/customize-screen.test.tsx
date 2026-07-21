import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";
import { toast } from "sonner-native";

const mockUseCustomizeScreen = jest.fn();
const mockUseSequentialExport = jest.fn();
let animationFrames: Array<(timestamp: number) => void> = [];
const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
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

jest.mock("sonner-native", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/features/quick-panel/shared/SubPageHeader", () => ({
  SubPageHeader: (props: Record<string, unknown>) => {
    const { Pressable, Text, View } = jest.requireActual("react-native");
    return (
      <View>
        <Text>{props.title as string}</Text>
        <Text>{props.subtitle as string}</Text>
        {typeof props.onActionPress === "function" ? (
          <Pressable
            accessibilityLabel={props.actionAccessibilityLabel as string}
            onPress={props.onActionPress}
          />
        ) : null}
      </View>
    );
  },
}));

jest.mock(
  "@/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet",
  () => ({
    CustomizeImagePlacementHelpSheet: () => {
      const { Text } = jest.requireActual("react-native");
      return <Text>customize.imagePlacementHelpTitle</Text>;
    },
  }),
  { virtual: true },
);

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
    jest.useFakeTimers();
    animationFrames = [];
    globalThis.requestAnimationFrame = jest.fn((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });
    globalThis.cancelAnimationFrame = jest.fn();
    jest.mocked(toast.error).mockClear();
    jest.mocked(toast.success).mockClear();
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

  afterEach(() => {
    jest.useRealTimers();
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it("shows export feedback as an error toast", () => {
    render(<CustomizeScreen />);

    expect(screen.queryByText("errors.imageTooLarge")).toBeNull();
    expect(screen.queryByText("Unable to export images.")).toBeNull();
    expect(toast.error).not.toHaveBeenCalled();
    act(() => animationFrames.splice(0).forEach((callback) => callback(0)));
    act(() => jest.runOnlyPendingTimers());
    expect(toast.error).toHaveBeenCalledWith("Unable to export images.");
  });

  it("opens localized image-placement help from the header", () => {
    render(<CustomizeScreen />);
    fireEvent.press(
      screen.getByLabelText("customize.imagePlacementHelpButton"),
    );
    expect(screen.getByText("customize.imagePlacementHelpTitle")).toBeTruthy();
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
