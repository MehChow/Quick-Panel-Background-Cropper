import { Button } from "@/components/ani-ui/button";
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
    <View className="flex-row gap-2">
      <Button className="flex-1" variant="secondary" onPress={onImport}>
        Re-import
      </Button>
      <Button
        className="flex-1 bg-orange-200"
        onPress={onContinue}
        textClassName="text-orange-800 font-semibold"
      >
        Looks good
      </Button>
    </View>
  );
}
