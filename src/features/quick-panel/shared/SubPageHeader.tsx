import { Text } from "@/components/ani-ui/text";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { BackButton } from "./BackButton";
import {
  HeaderActionButton,
  type HeaderActionVariant,
} from "./HeaderActionButton";

interface SubPageHeaderProps {
  actionAccessibilityLabel?: string;
  actionIcon?: React.ComponentProps<typeof Lucide>["name"];
  actionVariant?: HeaderActionVariant;
  onActionPress?: () => void;
  title: string;
  subtitle: string;
}

export function SubPageHeader({
  actionAccessibilityLabel,
  actionIcon,
  actionVariant,
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
        <HeaderActionButton
          accessibilityLabel={
            actionAccessibilityLabel ?? t("calibration.helpButton")
          }
          icon={actionIcon}
          onPress={onActionPress}
          variant={actionVariant}
        />
      ) : null}
    </View>
  );
}
