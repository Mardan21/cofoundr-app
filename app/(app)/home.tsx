import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to browse screen
    router.replace("/(app)/browse");
  }, []);

  return null;
}
