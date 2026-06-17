import { cn } from "@/lib/utils";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Pressable, View } from "react-native";

export type HeaderActionVariant =
  | "default"
  | "helper-subtle"
  | "helper-balanced";

interface HeaderActionButtonProps {
  accessibilityLabel: string;
  icon?: React.ComponentProps<typeof Lucide>["name"];
  onPress: () => void;
  variant?: HeaderActionVariant;
}

interface HeaderActionTheme {
  className: string;
  iconColor: string;
  iconName: React.ComponentProps<typeof Lucide>["name"];
  iconSize: number;
  pressedClassName: string;
  showInnerRing: boolean;
}

const themes: Record<HeaderActionVariant, HeaderActionTheme> = {
  default: {
    className: "rounded-full bg-white",
    iconColor: "#000",
    iconName: "circle-help",
    iconSize: 28,
    pressedClassName: "opacity-80",
    showInnerRing: false,
  },
  "helper-subtle": {
    className: "rounded-2xl border border-white/12 bg-zinc-900/90",
    iconColor: "#f5f5f5",
    iconName: "message-circle-question",
    iconSize: 20,
    pressedClassName: "scale-95 border-[#f3c992]/55 bg-[#34282f]",
    showInnerRing: true,
  },
  "helper-balanced": {
    className: "rounded-2xl border border-[#f3c992]/35 bg-[#2c2328]",
    iconColor: "#f5d6aa",
    iconName: "message-circle-question",
    iconSize: 20,
    pressedClassName: "scale-95 border-[#f3c992]/55 bg-[#34282f]",
    showInnerRing: true,
  },
};

export function HeaderActionButton({
  accessibilityLabel,
  icon,
  onPress,
  variant = "default",
}: HeaderActionButtonProps) {
  const theme = themes[variant];
  const iconName = icon ?? theme.iconName;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View
          className={cn(
            "h-11 w-11 items-center justify-center overflow-hidden",
            theme.className,
            pressed && theme.pressedClassName,
          )}
        >
          {theme.showInnerRing ? (
            <View className="absolute inset-0.5 rounded-[14px] border border-white/8" />
          ) : null}
          <Lucide
            color={theme.iconColor}
            name={iconName}
            size={theme.iconSize}
          />
        </View>
      )}
    </Pressable>
  );
}
