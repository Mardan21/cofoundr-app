import { useAuth } from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="home" />
    </Stack>
  );
}
