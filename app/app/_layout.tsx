import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from "../stores/auth";
import { useHandoff } from "../stores/handoff";
import { NativeWindStyleSheet } from "nativewind";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

NativeWindStyleSheet.setOutput({
  default: "native"
});

export default function Layout() {
  const hydrate = useAuth((s) => s.hydrate);
  const hydrated = useAuth((s) => s.hydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await hydrate();
        await useHandoff.getState().hydrate();
        // Artificially delay for a smoother experience
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, [hydrate]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      // This tells the splash screen to hide immediately! If we do this sooner,
      // the user will see a flash of empty screen.
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!hydrated || !isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
