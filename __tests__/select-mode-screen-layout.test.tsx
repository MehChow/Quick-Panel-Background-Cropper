import { render, screen } from "@testing-library/react-native";
import { SelectModeScreen } from "@/features/quick-panel/select-mode/SelectModeScreen";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
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

jest.mock("@/features/quick-panel/select-mode/ModeHelpSheet", () => ({
  ModeHelpSheet: () => null,
}));

jest.mock("@/features/quick-panel/select-mode/ModeOptionCard", () => ({
  ModeOptionCard: ({
    cardMaxWidth,
    isStacked,
    label,
  }: {
    cardMaxWidth: number;
    isStacked: boolean;
    label: string;
  }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, label),
      React.createElement(Text, null, `stacked:${label}:${String(isStacked)}`),
      React.createElement(Text, null, `max:${label}:${cardMaxWidth}`),
    );
  },
}));

jest.mock("@/features/quick-panel/store/quick-panel-store", () => ({
  useQuickPanelStore: () => ({
    lastExportedMode: null,
    selectMode: jest.fn(),
  }),
}));

jest.mock("@/features/quick-panel/shared/wide-screen-layout", () => ({
  getWideScreenLayout: () => ({
    isWideScreen: true,
    footerMaxWidth: 560,
    contentMaxWidth: 540,
    heroMaxWidth: 520,
    importCardMaxWidth: 560,
    importExampleRowMaxWidth: 380,
    resultGridMaxWidth: 460,
    selectCardMaxWidth: 220,
    selectContentMaxWidth: 640,
    selectPreviewMaxHeight: 460,
    shouldStackSelectCards: false,
  }),
}));

describe("SelectModeScreen wide layout", () => {
  it("keeps wide foldable mode cards in a row and renders a footer action bar", () => {
    render(<SelectModeScreen />);

    expect(screen.getByText("stacked:mode.default:false")).toBeTruthy();
    expect(screen.getByText("stacked:mode.advanced:false")).toBeTruthy();
    expect(screen.getByTestId("select-mode-footer")).toBeTruthy();
    expect(screen.getByText("max:mode.default:220")).toBeTruthy();
    expect(screen.getByText("common.confirm")).toBeTruthy();
  });
});
