import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";
import { BackButton } from "./BackButton";

interface SubPageHeaderProps {
  title: string;
  subtitle: string;
}

export function SubPageHeader({ title, subtitle }: SubPageHeaderProps) {
  return (
    <View className="mb-5 flex-row items-center gap-3">
      <BackButton className="" />
      <View className="flex-1">
        <Text className="text-2xl font-semibold leading-7 text-white">
          {title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-zinc-400">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
