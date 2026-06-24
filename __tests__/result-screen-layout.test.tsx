import { render, screen } from "@testing-library/react-native";
import { ResultScreen } from "@/features/quick-panel/result/ResultScreen";

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
  ExportSuccessPanel: () => {
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

jest.mock("@/features/quick-panel/store/quick-panel-store", () => ({
  useQuickPanelStore: () => ({
    exports: [
      { id: "buttonBox", previewUri: "file:///one.png" },
      { id: "mediaPlayer", previewUri: "file:///two.png" },
      { id: "brightness", previewUri: "file:///three.png" },
      { id: "volume", previewUri: "file:///four.png" },
    ],
    goToLanding: jest.fn(),
  }),
}));

describe("ResultScreen wide layout", () => {
  it("renders footer actions outside the success panel", () => {
    render(<ResultScreen />);

    expect(screen.getByText("export-panel")).toBeTruthy();
    expect(screen.getByTestId("result-footer")).toBeTruthy();
    expect(screen.getByText("export.openGoodLock")).toBeTruthy();
    expect(screen.getByText("export.backHome")).toBeTruthy();
  });
});
