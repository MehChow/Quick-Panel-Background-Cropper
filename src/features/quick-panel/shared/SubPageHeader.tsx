import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { BackButton } from "./BackButton";

interface SubPageHeaderProps {
  actionAccessibilityLabel?: string;
  actionIcon?: React.ComponentProps<typeof Lucide>["name"];
  onActionPress?: () => void;
  title: string;
  subtitle: string;
}

export function SubPageHeader({
  actionAccessibilityLabel,
  actionIcon,
  onActionPress,
  title,
  subtitle,
}: SubPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-5 flex-row items-center gap-3">
      <BackButton className="" />
      <View className="flex-1">
        <Text className="text-2xl font-semibold leading-7 text-white">
          {title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-zinc-400">{subtitle}</Text>
      </View>
      {onActionPress ? (
        <Pressable
          accessibilityLabel={
            actionAccessibilityLabel ?? t("calibration.helpButton")
          }
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
          onPress={onActionPress}
        >
          <Lucide color="#000" name={actionIcon ?? "circle-help"} size={28} />
        </Pressable>
      ) : null}
    </View>
  );
}
