import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHEET_PADDING_BOTTOM = 32;

export interface BottomSheetInsets {
  bottomInset: number;
  contentPaddingBottom: number;
}

export function useBottomSheetInsets(): BottomSheetInsets {
  const insets = useSafeAreaInsets();

  return {
    bottomInset: insets.bottom,
    contentPaddingBottom: SHEET_PADDING_BOTTOM + insets.bottom,
  };
}
