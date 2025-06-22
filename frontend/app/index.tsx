import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/(auth)/welcome");
      } else if (!user?.profileType) {
        router.replace("/(app)/profile-setup");
      } else {
        router.replace("/(app)/home");
      }
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
