import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ani-ui/tabs";
import { Text } from "@/components/ani-ui/text";
import { TextInput, View } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import {
  BrightnessSlider,
  OpacitySlider,
  useColorPickerContext,
} from "reanimated-color-picker";
import { useTranslation } from "react-i18next";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AdjustmentValueProps {
  channel: "brightness" | "intensity";
}

function AdjustmentValue({ channel }: AdjustmentValueProps) {
  const { alphaValue, brightnessValue } = useColorPickerContext();
  const animatedProps = useAnimatedProps(() => {
    const value = channel === "brightness"
      ? brightnessValue.value
      : alphaValue.value * 100;
    const text = `${Math.round(value)}%`;
    return { defaultValue: text, text };
  });

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      className="p-0 text-right text-xs font-semibold text-zinc-300"
      defaultValue={`${Math.round(
        channel === "brightness"
          ? brightnessValue.value
          : alphaValue.value * 100,
      )}%`}
      editable={false}
      pointerEvents="none"
      testID="button-label-adjustment-value"
    />
  );
}

interface AdjustmentContentProps {
  channel: "brightness" | "intensity";
  label: string;
}

function AdjustmentContent({ channel, label }: AdjustmentContentProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-zinc-300">{label}</Text>
        <AdjustmentValue channel={channel} />
      </View>
      {channel === "brightness" ? (
        <BrightnessSlider accessibilityLabel={label} />
      ) : (
        <OpacitySlider accessibilityLabel={label} />
      )}
    </View>
  );
}

export function ButtonLabelAdjustmentTabs() {
  const { t } = useTranslation();
  const brightness = t("customize.buttonIdentifierBrightness");
  const intensity = t("customize.buttonIdentifierIntensity");
  return (
    <Tabs defaultValue="brightness" size="sm">
      <TabsList className="w-full border border-white/15 bg-zinc-800/95">
        <TabsTrigger
          activeClassName="bg-black"
          activeTextClassName="text-white"
          testID="button-label-brightness-tab"
          textClassName="text-white"
          value="brightness"
        >
          {brightness}
        </TabsTrigger>
        <TabsTrigger
          activeClassName="bg-black"
          activeTextClassName="text-white"
          testID="button-label-intensity-tab"
          textClassName="text-white"
          value="intensity"
        >
          {intensity}
        </TabsTrigger>
      </TabsList>
      <TabsContent className="mt-3" value="brightness">
        <AdjustmentContent channel="brightness" label={brightness} />
      </TabsContent>
      <TabsContent className="mt-3" value="intensity">
        <AdjustmentContent channel="intensity" label={intensity} />
      </TabsContent>
    </Tabs>
  );
}
