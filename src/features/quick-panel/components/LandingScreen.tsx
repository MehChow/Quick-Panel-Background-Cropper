import { Button } from "@/components/ani-ui/button";
import { Text } from "@/components/ani-ui/text";
import { Image } from "expo-image";
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
    <View className="gap-8">
      <View className="aspect-square w-full flex-row">
        {/* Doro gif */}
        <View className="flex-1 p-8">
          <Image
            source={require("@/assets/doro_like.gif")}
            style={{ flex: 1 }}
            contentFit="contain"
          />
        </View>
        {/* Example screenshot */}
        <View className="flex-1 gap-1">
          <Text className="text-center font-semibold">Example</Text>
          <Image
            source={require("@/assets/example.jpeg")}
            style={{
              flex: 1,
              borderRadius: 16,
            }}
            contentPosition="top center"
          />
        </View>
      </View>

      {/* Button container */}
      <View className="gap-4">
        <Button className="w-full" onPress={onStart} disabled={!isCalibrated}>
          Start customizing
        </Button>
        {isCalibrated ? (
          <Text className="text-center text-sm leading-5 text-zinc-400">
            Calibrated.{" "}
            <Text
              accessibilityRole="link"
              className="text-sm leading-5 text-emerald-300 underline"
              onPress={onCalibrate}
            >
              Wanna recalibrate?
            </Text>
          </Text>
        ) : (
          <Button
            className="w-full bg-orange-200"
            onPress={onCalibrate}
            textClassName="font-semibold text-orange-800"
          >
            Calibration
          </Button>
        )}
        {!isCalibrated ? (
          <Text className="text-center text-sm leading-5 text-zinc-400">
            Calibration is required once so exports match your Quick Panel
            layout.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
