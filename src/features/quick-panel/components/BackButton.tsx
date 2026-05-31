import { Lucide } from "@react-native-vector-icons/lucide";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

export function BackButton() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      className="mb-5 h-11 w-11 items-center justify-center rounded-full bg-zinc-900 active:opacity-80"
      onPress={() => router.back()}
    >
      <Lucide color="#fafafa" name="arrow-left" size={24} />
    </Pressable>
  );
}
