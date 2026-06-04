import { render, screen } from "@testing-library/react-native";
import { CustomizeScreen } from "@/features/quick-panel/customize/CustomizeScreen";

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

jest.mock("@/features/quick-panel/customize/hooks/useCustomizeScreen", () => ({
  useCustomizeScreen: () => ({
    activePreset: null,
    error: "Unable to export images.",
    exportImages: jest.fn(),
    exports: [],
    hasExported: false,
    image: null,
    isExporting: false,
    isPreviewAdjusting: false,
    pickImage: jest.fn(),
    refs: {
      brightness: { current: null },
      buttonBox: { current: null },
      mediaPlayer: { current: null },
      volume: { current: null },
    },
    resetFit: jest.fn(),
    setIsPreviewAdjusting: jest.fn(),
    setTransform: jest.fn(),
    transform: { scale: 1, x: 0, y: 0 },
  }),
}));

describe("CustomizeScreen", () => {
  it("renders the inline error banner", () => {
    render(<CustomizeScreen />);

    expect(screen.getByText("Unable to export images.")).toBeTruthy();
  });
});
