import { render, screen } from "@testing-library/react-native";
import { SelectModeScreen } from "@/features/quick-panel/select-mode/SelectModeScreen";
import { ScrollView } from "react-native";

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
    label,
  }: {
    label: string;
  }) => {
    const React = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, null, label),
      React.createElement(Text, null, `card:${label}`),
    );
  },
}));

jest.mock("@/features/quick-panel/store/quick-panel-store", () => ({
  useQuickPanelStore: () => ({
    lastExportedAdvancedTarget: null,
    lastExportedMode: null,
    selectMode: jest.fn(),
    selectAdvancedTarget: jest.fn(),
  }),
}));

describe("SelectModeScreen layout", () => {
  it("renders mode cards in the fixed main area and a footer action bar", () => {
    const { UNSAFE_queryByType } = render(<SelectModeScreen />);

    expect(screen.getByText("card:mode.default")).toBeTruthy();
    expect(screen.getByText("card:mode.advanced")).toBeTruthy();
    expect(screen.getByTestId("select-mode-footer")).toBeTruthy();
    expect(screen.getByText("common.confirm")).toBeTruthy();
    expect(UNSAFE_queryByType(ScrollView)).toBeNull();
  });
});
