import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../stores/auth";
import { ActivityIndicator, View } from "react-native";
import { Screen } from "../components/ui";

export default function Index() {
  const token = useAuth((s) => s.token);
  const hospitalId = useAuth((s) => s.hospitalId);
  const hydrated = useAuth((s) => s.hydrated);
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  if (!hydrated) {
    return (
      <Screen className="justify-center items-center">
        <ActivityIndicator color="black" />
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;
  if (!hospitalId) return <Redirect href="/hospitals" />;
  return <Redirect href="/patients" />;
}
