import { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { styled } from "nativewind";
import { Redirect, useRouter } from "expo-router";
import { useSaps } from "../stores/saps";
import { useAuth } from "../stores/auth";
import { Screen, Button, TopBar } from "../components/ui";
import { Saps3Form, Saps3Summary, calculateSaps3, Saps3Input, Saps3Region, Saps3Result } from "../src/modules/saps3";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);

export default function Saps3Screen() {
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const setSaps3Result = useSaps((s) => s.setSaps3Result);

  const [result, setResult] = useState<Saps3Result | null>(null);

  if (!hydrated) return null;
  if (!token) return <Redirect href="/(auth)/login" />;

  function handleCalculate(input: Saps3Input, region: Saps3Region) {
    const res = calculateSaps3(input, region);
    setResult(res);
  }

  function handleUseValue() {
    if (result) {
      setSaps3Result(result);
      r.back();
    }
  }

  return (
    <Screen className="bg-slate-50">
      <TopBar title="Calculadora SAPS 3" back />

      <StyledScrollView contentContainerClassName="p-6 pb-12">
        {result ? (
          <StyledView className="space-y-6">
            <Saps3Summary result={result} />
            <StyledView className="flex-row gap-4">
                <Button label="Recalcular" variant="secondary" onPress={() => setResult(null)} className="flex-1" />
                <Button label="Usar Valor" onPress={handleUseValue} className="flex-1 shadow-md" />
            </StyledView>
          </StyledView>
        ) : (
          <Saps3Form onCalculate={handleCalculate} />
        )}
      </StyledScrollView>
    </Screen>
  );
}
