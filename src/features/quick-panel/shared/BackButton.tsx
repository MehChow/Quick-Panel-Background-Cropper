import { cn } from "@/lib/utils";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

interface BackButtonProps {
  className?: string;
  onPress?: () => void;
}

export function BackButton({ className = "mb-5", onPress }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full bg-zinc-900 active:opacity-80",
        className,
      )}
      onPress={onPress ?? (() => router.back())}
    >
      <Lucide color="#fafafa" name="arrow-left" size={24} />
    </Pressable>
  );
}
