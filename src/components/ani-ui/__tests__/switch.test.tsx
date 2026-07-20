import { fireEvent, render } from "@testing-library/react-native";
import { Switch } from "../switch";

describe("Switch", () => {
  it("shows caller-provided localized state labels inside the switch thumb", () => {
    const { getByText } = render(
      <Switch
        offLabel="關"
        onLabel="開"
        onValueChange={jest.fn()}
        testID="grid-toggle"
        value={true}
      />,
    );

    expect(getByText("開")).toBeTruthy();
  });

  it("toggles through the existing controlled switch contract", () => {
    const onValueChange = jest.fn();
    const { getByTestId } = render(
      <Switch onValueChange={onValueChange} testID="grid-toggle" value={false} />,
    );

    fireEvent.press(getByTestId("grid-toggle"));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it("does not press when disabled", () => {
    const onValueChange = jest.fn();
    const { getByTestId } = render(
      <Switch
        disabled
        onValueChange={onValueChange}
        testID="grid-toggle"
        value={false}
      />,
    );

    fireEvent.press(getByTestId("grid-toggle"));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("centers the thumb within the bordered track", () => {
    const { getByTestId } = render(
      <Switch onValueChange={jest.fn()} testID="grid-toggle" value={true} />,
    );

    expect(getByTestId("grid-toggle").props.className).toContain("items-center");
  });
});
