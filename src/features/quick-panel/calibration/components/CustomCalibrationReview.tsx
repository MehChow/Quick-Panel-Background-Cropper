import { Button } from "@/components/ani-ui/button";
import { Card } from "@/components/ani-ui/card";
import { Text } from "@/components/ani-ui/text";
import { getPanelLabel } from "@/features/quick-panel/model/i18n";
import { panelIds, type CustomPanelsCalibrationProfile } from "@/features/quick-panel/model/calibration-profile";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface CustomCalibrationReviewProps {
  onBack: () => void;
  onSave: () => void;
  profile: CustomPanelsCalibrationProfile;
}

export function CustomCalibrationReview({
  onBack,
  onSave,
  profile,
}: CustomCalibrationReviewProps) {
  const { t } = useTranslation();

  return (
    <Card className="gap-4 rounded-2xl border-zinc-800 bg-zinc-900">
      <View className="gap-1">
        <Text className="text-lg font-semibold text-white">
          {t("calibration.reviewTitle")}
        </Text>
        <Text className="text-sm leading-5 text-zinc-400">
          {t("calibration.reviewSubtitle")}
        </Text>
      </View>

      <View className="gap-3">
        {panelIds.map((id) => (
          <View
            key={id}
            className="flex-row items-center justify-between rounded-xl border border-zinc-800 bg-black/20 px-4 py-3"
          >
            <Text className="text-sm font-medium text-white">
              {getPanelLabel(id)}
            </Text>
            <Text className="text-sm text-zinc-400">
              {profile.panels[id].status === "hidden"
                ? t("calibration.hiddenStatus")
                : t("calibration.visibleStatus")}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row gap-3">
        <Button className="flex-1" onPress={onBack} textClassName="font-semibold">
          {t("common.back")}
        </Button>
        <Button
          className="flex-1 bg-green-200/90"
          onPress={onSave}
          textClassName="font-semibold text-green-900"
        >
          {t("calibration.saveCustomLayout")}
        </Button>
      </View>
    </Card>
  );
}
