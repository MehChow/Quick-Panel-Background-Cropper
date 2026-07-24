import { Text } from "@/components/ani-ui/text";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import type { AdvancedTarget } from "../model/types";

interface Props {
  selectedTarget: AdvancedTarget | null;
  onSelectTarget: (target: AdvancedTarget) => void;
}

export function AdvancedTargetSelection({ selectedTarget, onSelectTarget }: Props) {
  const { t } = useTranslation();
  return (
    <View className="gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4">
      <TargetRow
        isSelected={selectedTarget === "controls"}
        title={t("mode.advancedControlsOnly")}
        body={t("mode.advancedControlsOnlyDescription")}
        onPress={() => onSelectTarget("controls")}
      />
      <TargetRow
        isSelected={selectedTarget === "buttons"}
        title={t("mode.advancedButtonsOnly")}
        body={t("mode.advancedButtonsOnlyDescription")}
        onPress={() => onSelectTarget("buttons")}
      />
    </View>
  );
}

interface TargetRowProps {
  isSelected: boolean;
  title: string;
  body: string;
  onPress: () => void;
}

function TargetRow({ isSelected, title, body, onPress }: TargetRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      className={`min-h-12 rounded-xl border px-4 py-3 ${
        isSelected ? "border-emerald-300/50 bg-emerald-300/10" : "border-white/10 bg-zinc-800/70"
      }`}
      onPress={onPress}
    >
      <Text className="font-semibold text-white">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-zinc-400">{body}</Text>
    </Pressable>
  );
}
