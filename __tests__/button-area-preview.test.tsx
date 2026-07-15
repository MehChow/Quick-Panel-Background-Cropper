import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { View } from "react-native";
import { ButtonAreaPreview } from "@/features/quick-panel/calibration/advanced/components/ButtonAreaPreview";

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

describe("ButtonAreaPreview", () => {
  it("pins the preview on tap and dismisses it from the backdrop", async () => {
    const screen = render(
      <ButtonAreaPreview outerRect={outerRect} screenshot={screenshot}>
        {(previewTrigger) => <View>{previewTrigger}</View>}
      </ButtonAreaPreview>,
    );

    fireEvent.press(screen.getByLabelText("Preview outlined area"));

    expect(screen.getByTestId("button-area-preview-overlay")).toBeTruthy();
    expect(screen.queryByText("Release to close")).toBeNull();

    fireEvent.press(screen.getByLabelText("Close outlined area preview"));

    await waitFor(() => {
      expect(screen.queryByTestId("button-area-preview-overlay")).toBeNull();
    });
  });

  it("does not open the preview on long press", () => {
    const screen = render(
      <ButtonAreaPreview outerRect={outerRect} screenshot={screenshot}>
        {(previewTrigger) => <View>{previewTrigger}</View>}
      </ButtonAreaPreview>,
    );
    const trigger = screen.getByLabelText("Preview outlined area");

    fireEvent(trigger, "longPress");

    expect(screen.queryByTestId("button-area-preview-overlay")).toBeNull();
  });
});
