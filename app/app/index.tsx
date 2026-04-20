import { Redirect } from "expo-router";
import { useAuth } from "../stores/auth";
import { ActivityIndicator } from "react-native";
import { Screen } from "../components/ui";

export default function Index() {
  const token = useAuth((s) => s.token);
  const hospitalId = useAuth((s) => s.hospitalId);
  const hydrated = useAuth((s) => s.hydrated);
  
  // No need to hydrate here, layout does it.
  
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
