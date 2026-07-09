import { act, render, screen, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import {
  markHelpSeen,
  useHasSeenHelp,
} from "@/features/quick-panel/store/storage";

function SeenHelpProbe() {
  const hasSeenHelp = useHasSeenHelp("select-mode");

  return <Text>{hasSeenHelp ? "seen" : "unseen"}</Text>;
}

describe("seen help reactivity", () => {
  it("updates subscribed UI after help is marked as seen", async () => {
    render(<SeenHelpProbe />);

    expect(screen.getByText("unseen")).toBeTruthy();

    act(() => {
      markHelpSeen("select-mode");
    });

    await waitFor(() => {
      expect(screen.getByText("seen")).toBeTruthy();
    });
  });
});
