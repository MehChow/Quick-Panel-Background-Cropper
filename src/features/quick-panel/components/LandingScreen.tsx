import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { View } from "react-native";

interface LandingScreenProps {
  isCalibrated: boolean;
  onCalibrate: () => void;
  onStart: () => void;
}

export function LandingScreen({
  isCalibrated,
  onCalibrate,
  onStart,
}: LandingScreenProps) {
  return (
    <View className="gap-4 rounded-[30px] border border-zinc-800 bg-zinc-900 p-5">
      <Button className="w-full" onPress={onStart}>
        Start customizing
      </Button>
      <Button
        className={
          isCalibrated
            ? "w-full border border-emerald-400/40 bg-emerald-400/10"
            : "w-full"
        }
        textClassName={isCalibrated ? "text-emerald-100" : undefined}
        variant={isCalibrated ? "secondary" : "default"}
        onPress={onCalibrate}
      >
        {isCalibrated ? "Calibrated. Wanna recalibrate?" : "Calibration"}
      </Button>
      {!isCalibrated ? (
        <Text className="text-center text-sm leading-5 text-zinc-400">
          Calibration is required once so exports match your Quick Panel layout.
        </Text>
      ) : null}
    </View>
  );
}
