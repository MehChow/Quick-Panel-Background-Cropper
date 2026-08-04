import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

interface ButtonAppearanceInspectorControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  total: number;
}

export function ButtonAppearanceInspectorControls(
  props: ButtonAppearanceInspectorControlsProps,
) {
  const { t } = useTranslation();
  if (props.total <= 1) return null;

  return (
    <View
      className="absolute inset-y-0 left-0 right-0 flex-row items-center justify-between px-1"
      pointerEvents="box-none"
      testID="button-appearance-navigation"
    >
      <Pressable
        accessibilityLabel={t("customize.buttonAppearancePrevious")}
        accessibilityRole="button"
        className="min-h-11 min-w-11 items-center justify-center"
        onPress={props.onPrevious}
        testID="button-appearance-previous"
      >
        <Lucide color="#FFFFFF" name="chevron-left" size={20} />
      </Pressable>
      <Pressable
        accessibilityLabel={t("customize.buttonAppearanceNext")}
        accessibilityRole="button"
        className="min-h-11 min-w-11 items-center justify-center"
        onPress={props.onNext}
        testID="button-appearance-next"
      >
        <Lucide color="#FFFFFF" name="chevron-right" size={20} />
      </Pressable>
    </View>
  );
}
