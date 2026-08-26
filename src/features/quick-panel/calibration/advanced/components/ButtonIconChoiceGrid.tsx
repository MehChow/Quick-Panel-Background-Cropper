import { Lucide } from "@react-native-vector-icons/lucide";
import { Pressable, ScrollView, View } from "react-native";
import type { CustomButtonIconId } from "../../../model/button-labels";

export interface ButtonIconChoice {
  id: CustomButtonIconId;
  label: string;
}

interface ButtonIconChoiceGridProps {
  choices: ButtonIconChoice[];
  maxHeight: number;
  onSelect: (iconId: CustomButtonIconId) => void;
  testID: string;
}

export function ButtonIconChoiceGrid({
  choices,
  maxHeight,
  onSelect,
  testID,
}: ButtonIconChoiceGridProps) {
  const rows = Array.from(
    { length: Math.ceil(choices.length / 4) },
    (_, rowIndex) => choices.slice(rowIndex * 4, rowIndex * 4 + 4),
  );

  return (
    <ScrollView
      contentContainerClassName="gap-3"
      showsVerticalScrollIndicator={false}
      style={{ maxHeight }}
      testID={testID}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-3">
          {Array.from({ length: 4 }, (_, columnIndex) => {
            const choice = row[columnIndex];
            return (
              <View key={choice?.id ?? `spacer-${columnIndex}`} className="flex-1">
                {choice ? (
                  <Pressable
                    accessibilityLabel={choice.label}
                    accessibilityRole="button"
                    className="aspect-square w-full min-h-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 p-2"
                    onPress={() => onSelect(choice.id)}
                  >
                    <Lucide color="#ffffff" name={choice.id} size={22} />
                  </Pressable>
                ) : (
                  <View className="aspect-square w-full min-h-12" />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
