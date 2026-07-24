import { AdvancedPanelSelection } from "@/features/quick-panel/calibration/advanced/components/AdvancedPanelSelection";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const screenshot = {
  uri: "file:///quick-panel.png",
  width: 1080,
  height: 2340,
};
const outerRect = {
  x: 40,
  y: 300,
  width: 1000,
  height: 1400,
  radius: 0,
};
const enabledPanels = [
  "buttonBox",
  "brightness",
  "volume",
  "mediaPlayer",
] as const;

describe("AdvancedPanelSelection", () => {
  it("opens the confirmed outer-area preview", async () => {
    const screen = render(
      <AdvancedPanelSelection
        enabledPanels={[...enabledPanels]}
        outerRect={outerRect}
        screenshot={screenshot}
        onEnabledPanelsChange={jest.fn()}
      />,
    );

    const trigger = await waitFor(() =>
      screen.getByLabelText("Preview outlined area"),
    );
    fireEvent.press(trigger);

    expect(screen.getByTestId("calibration-area-preview-overlay")).toBeTruthy();
  });

  it("keeps panel toggles independent from the preview", () => {
    const onEnabledPanelsChange = jest.fn();
    const screen = render(
      <AdvancedPanelSelection
        enabledPanels={[...enabledPanels]}
        outerRect={outerRect}
        screenshot={screenshot}
        onEnabledPanelsChange={onEnabledPanelsChange}
      />,
    );

    fireEvent.press(screen.getAllByRole("switch")[1]);

    expect(onEnabledPanelsChange).toHaveBeenCalledWith([
      "buttonBox",
      "volume",
      "mediaPlayer",
    ]);
  });
});
