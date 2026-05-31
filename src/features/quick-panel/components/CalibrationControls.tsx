import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

interface CalibrationControlsProps {
  onContinue: () => void;
  onImport: () => void;
}

export function CalibrationControls({
  onContinue,
  onImport,
}: CalibrationControlsProps) {
  return (
    <View className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <Text className="text-sm leading-5 text-zinc-300">
        Drag the green box to move it. Drag any edge or corner to resize it
        around the whole customizable stack.
      </Text>
      <View className="mt-4 flex-row gap-2">
        <Button className="flex-1" variant="secondary" onPress={onImport}>
          Reimport
        </Button>
        <Button className="flex-1" onPress={onContinue}>
          Looks good
        </Button>
      </View>
    </View>
  );
}
