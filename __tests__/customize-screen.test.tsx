import { render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";
import type { QuickPanelPreset } from "@/features/quick-panel/model/types";

jest.mock("@/components/ani-ui/slider", () => ({
  Slider: () => null,
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

jest.mock("@/features/quick-panel/customize/components/ExportSuccessPanel", () => ({
  ExportSuccessPanel: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/ExportSurfaces", () => ({
  ExportSurfaces: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/ImagePickerCard", () => ({
  ImagePickerCard: () => null,
}));

jest.mock("@/features/quick-panel/customize/components/QuickPanelPreview", () => ({
  QuickPanelPreview: () => null,
}));

jest.mock("@/features/quick-panel/customize/hooks/useCustomizeScreen", () => {
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

  return {
    useCustomizeScreen: () => ({
      activePreset: mockActivePreset,
      error: "Unable to export images.",
      errorKey: "errors.imageTooLarge",
      exportImages: jest.fn(),
      exportLoadToken: 1,
      goToAdvancedCalibration: jest.fn(),
      goToCalibration: jest.fn(),
      image: null,
      isExporting: false,
      isPreviewAdjusting: false,
      isProcessingImage: false,
      noticeKey: "customize.imageOptimized",
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
      setIsExportSurfaceReady: jest.fn(),
      setIsPreviewAdjusting: jest.fn(),
      setTransform: jest.fn(),
      shouldRenderExportSurfaces: false,
      transform: { scale: 1, x: 0, y: 0 },
    }),
  };
});

describe("CustomizeScreen", () => {
  it("renders the inline notice via translation key", () => {
    render(<CustomizeScreen />);

    expect(screen.getByText("customize.imageOptimized")).toBeTruthy();
  });

  it("renders the inline error banner", () => {
    render(<CustomizeScreen />);

    expect(screen.getByText("errors.imageTooLarge")).toBeTruthy();
    expect(screen.getByText("Unable to export images.")).toBeTruthy();
  });
});
