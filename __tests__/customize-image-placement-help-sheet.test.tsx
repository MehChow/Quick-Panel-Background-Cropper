import { CustomizeImagePlacementHelpSheet } from "@/features/quick-panel/customize/components/CustomizeImagePlacementHelpSheet";
import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = jest.requireActual("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) => <>{children}</>,
    BottomSheetBackdrop: () => null,
    BottomSheetScrollView: ({ children }: { children?: ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

jest.mock("@/features/quick-panel/shared/useBottomSheetInsets", () => ({
  useBottomSheetInsets: () => ({ bottomInset: 0, contentPaddingBottom: 32 }),
}));

describe("CustomizeImagePlacementHelpSheet", () => {
  it("explains the full placement area in a separate paragraph", () => {
    render(<CustomizeImagePlacementHelpSheet onClose={jest.fn()} />);

    expect(screen.getByText("customize.imagePlacementHelpBody")).toBeTruthy();
    expect(
      screen.getByText("customize.imagePlacementBoundaryHelp"),
    ).toBeTruthy();
  });
});
