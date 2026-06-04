import { Text } from "@/components/ani-ui/text";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";

interface ImagePickerCardProps {
  onPick: () => void;
}

export function ImagePickerCard({ onPick }: ImagePickerCardProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      className="h-120 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-6 active:opacity-80"
      onPress={onPick}
    >
      <Text className="text-center text-lg font-semibold text-white">
        {t("customize.pickerTitle")}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-zinc-400">
        {t("customize.pickerSubtitle")}
      </Text>
    </Pressable>
  );
}
