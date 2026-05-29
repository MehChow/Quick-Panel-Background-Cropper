import { Card } from "@/components/ani-ui/card";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-red-100">
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Card className="mt-4">
        <Text className="text-lg font-bold">Welcome to Expo Router!</Text>
        <Text className="mt-2 text-gray-600">
          This is the home screen of your app. You can edit this screen by
          modifying the code in src/app/index.tsx.
        </Text>
      </Card>
    </View>
  );
}
