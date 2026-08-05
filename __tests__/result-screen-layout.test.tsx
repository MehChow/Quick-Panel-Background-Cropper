import { render, screen } from "@testing-library/react-native";
import { ResultScreen } from "@/features/quick-panel/result/ResultScreen";

let mockSuccessPanelProps: { exports: Array<{ id: string; label: string }> } | null = null;
const mockUseQuickPanelStore = jest.fn();
const mockCleanupCapturedExports = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("expo-router", () => ({
  Redirect: () => null,
  useRouter: () => ({
    dismissTo: jest.fn(),
  }),
}));

jest.mock("@/features/quick-panel/customize/components/ExportSuccessPanel", () => ({
  ExportSuccessPanel: (props: { exports: Array<{ id: string; label: string }> }) => {
    mockSuccessPanelProps = props;
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(Text, null, "export-panel");
  },
}));

jest.mock("@/features/quick-panel/customize/useGoodLockLink", () => ({
  useGoodLockLink: () => ({
    closeGoodLockDialog: jest.fn(),
    isGoodLockDialogOpen: false,
    isOpeningGoodLock: false,
    isOpeningSamsungStore: false,
    openGoodLockApp: jest.fn(),
    openSamsungStore: jest.fn(),
  }),
}));

jest.mock("@/features/quick-panel/customize/components/GoodLockUnavailableDialog", () => ({
  GoodLockUnavailableDialog: () => null,
}));

jest.mock("@/features/quick-panel/customize/services/export-files", () => ({
  cleanupCapturedExports: (...args: unknown[]) => mockCleanupCapturedExports(...args),
}));

jest.mock("@/features/quick-panel/store/quick-panel-store", () => ({
  useQuickPanelStore: (...args: unknown[]) => mockUseQuickPanelStore(...args),
}));

mockUseQuickPanelStore.mockReturnValue({
    exports: [
      { id: "buttonBox", previewUri: "file:///one.png" },
      { id: "mediaPlayer", previewUri: "file:///two.png" },
      { id: "brightness", previewUri: "file:///three.png" },
      { id: "volume", previewUri: "file:///four.png" },
    ],
    goToLanding: jest.fn(),
  });

describe("ResultScreen wide layout", () => {
  beforeEach(() => {
    mockCleanupCapturedExports.mockReset();
  });

  it("renders footer actions outside the success panel", () => {
    render(<ResultScreen />);

    expect(screen.getByText("export-panel")).toBeTruthy();
    expect(screen.getByTestId("result-footer")).toBeTruthy();
    expect(screen.getByText("export.openGoodLock")).toBeTruthy();
    expect(screen.getByText("export.backHome")).toBeTruthy();
  });

  it("passes mixed Result exports through without reordering", () => {
    const mixedExports = [
      { id: "buttonBox", label: "Button box", previewUri: "file:///1.png" },
      { id: "mediaPlayer", label: "Media player", previewUri: "file:///2.png" },
      { id: "brightness", label: "Brightness", previewUri: "file:///3.png" },
      { id: "button-1", label: "Wi-Fi", previewUri: "file:///4.png" },
      { id: "button-2", label: "Bluetooth", previewUri: "file:///5.png" },
    ];
    mockUseQuickPanelStore.mockReturnValue({
      exports: mixedExports,
      goToLanding: jest.fn(),
    });

    render(<ResultScreen />);

    expect(mockSuccessPanelProps?.exports.map((item) => item.id)).toEqual([
      "buttonBox",
      "mediaPlayer",
      "brightness",
      "button-1",
      "button-2",
    ]);
  });

  it("cleans successful captures only after Result unmounts", () => {
    const exports = [
      { id: "buttonBox", label: "Button box", previewUri: "file:///one.png" },
      { id: "mediaPlayer", label: "Media player", previewUri: "file:///two.png" },
    ];
    mockUseQuickPanelStore.mockReturnValue({
      exports,
      goToLanding: jest.fn(),
    });

    const screen = render(<ResultScreen />);

    expect(mockCleanupCapturedExports).not.toHaveBeenCalled();
    screen.unmount();

    expect(mockCleanupCapturedExports).toHaveBeenCalledWith(exports);
  });
});
