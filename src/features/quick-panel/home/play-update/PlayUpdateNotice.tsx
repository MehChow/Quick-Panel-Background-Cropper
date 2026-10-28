import { Button } from "@/components/ani-ui/button";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

interface PlayUpdateNoticeProps {
  busy: boolean;
  error: boolean;
  progress: number | null;
  showOffer: boolean;
  onDecline: () => void;
  onStart: () => void;
}

export function PlayUpdateNotice({ busy, error, progress, showOffer, onDecline, onStart }: PlayUpdateNoticeProps) {
  const { t } = useTranslation();
  if (busy) return <Text accessibilityLiveRegion="polite" className="mb-3 text-center text-white">{progress === null ? t("playUpdate.downloading") : t("playUpdate.progress", { progress })}</Text>;
  if (error) return <Text accessibilityLiveRegion="polite" className="mb-3 text-center text-white">{t("playUpdate.failed")}</Text>;
  if (!showOffer) return null;
  return (
    <View className="mb-4 gap-3 rounded-lg border border-slate-700 bg-slate-950 p-4">
      <Text className="font-semibold text-white">{t("playUpdate.title")}</Text>
      <Text className="text-zinc-300">{t("playUpdate.description")}</Text>
      <View className="flex-row gap-2">
        <Button variant="outline" className="flex-1" onPress={onDecline}>{t("playUpdate.notNow")}</Button>
        <Button className="flex-1 bg-white" textClassName="text-black" onPress={onStart}>{t("playUpdate.update")}</Button>
      </View>
    </View>
  );
}
