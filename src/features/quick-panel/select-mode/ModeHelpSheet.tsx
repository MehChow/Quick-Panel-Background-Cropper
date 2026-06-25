import { Text } from "@/components/ani-ui/text";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useWindowDimensions, View } from "react-native";
import { useBottomSheetInsets } from "../shared/useBottomSheetInsets";

interface ModeHelpSheetProps {
  advancedDescription: string;
  advancedLabel: string;
  defaultDescription: string;
  defaultLabel: string;
  onClose: () => void;
  subtitle: string;
  title: string;
}

export function ModeHelpSheet({
  advancedDescription,
  advancedLabel,
  defaultDescription,
  defaultLabel,
  onClose,
  subtitle,
  title,
}: ModeHelpSheetProps) {
  const { height } = useWindowDimensions();
  const { bottomInset, contentPaddingBottom } = useBottomSheetInsets();

  return (
    <BottomSheet
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{
        backgroundColor: "#18181b",
        borderWidth: 1,
        borderColor: "#27272a",
        borderRadius: 32,
      }}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: "#52525b",
        height: 6,
        width: 48,
      }}
      index={0}
      bottomInset={bottomInset}
      maxDynamicContentSize={height * 0.85}
      onClose={onClose}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: contentPaddingBottom,
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-lg font-semibold text-white">{title}</Text>
            <Text className="text-sm leading-6 text-zinc-300">{subtitle}</Text>
          </View>
          <ModeExplanation
            description={defaultDescription}
            label={defaultLabel}
          />
          <ModeExplanation
            description={advancedDescription}
            label={advancedLabel}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

interface ModeExplanationProps {
  description: string;
  label: string;
}

function ModeExplanation({ description, label }: ModeExplanationProps) {
  return (
    <View className="rounded-3xl border border-zinc-800 bg-zinc-800 p-5">
      <Text className="text-base font-semibold text-orange-200">{label}</Text>
      <Text className="mt-2 text-sm leading-6 text-zinc-300">
        {description}
      </Text>
    </View>
  );
}
