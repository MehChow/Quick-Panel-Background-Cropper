import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({
  title,
  subtitle,
}: AppHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-5">
      <Text variant="h2" className="text-white">
        {title ?? t("home.title")}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-zinc-400">
        {subtitle ?? t("home.subtitle")}
      </Text>
    </View>
  );
}
