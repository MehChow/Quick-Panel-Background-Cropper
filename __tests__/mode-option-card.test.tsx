import { render } from "@testing-library/react-native";
import { FlatList } from "react-native";
import { ModeOptionCard } from "@/features/quick-panel/select-mode/ModeOptionCard";

jest.mock("@/data/images", () => ({
  images: {
    modeAdvanced1: 1,
    modeAdvanced2: 2,
    modeAdvanced3: 3,
    modeDefault: 5,
  },
}));

describe("ModeOptionCard", () => {
  it("shows all three advanced mode example slides", () => {
    const { UNSAFE_getByType } = render(
      <ModeOptionCard
        isSelected
        label="Advanced"
        mode="advanced"
        onPress={jest.fn()}
      />,
    );

    expect(UNSAFE_getByType(FlatList).props.data).toEqual([1, 2, 3]);
  });
});
