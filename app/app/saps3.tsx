import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useSaps } from "../stores/saps";
import { useAuth } from "../stores/auth";
import { AppHeader, Button, Card, KeyValueRow, Screen, TextField, theme } from "../lib/ui";

export default function Saps3() {
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const [idade, setIdade] = useState("");
  const [pas, setPas] = useState("");
  const [pao2fio2, setPao2fio2] = useState("");
  const [resultado, setResultado] = useState<number | null>(null);
  const setSaps3 = useSaps((s) => s.setSaps3);

  if (!hydrated) {
    return (
      <Screen>
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;

  function calcular() {
    const a = Number(idade) || 0;
    const p = Number(pas) || 0;
    const o = Number(pao2fio2) || 0;
    const score = Math.round(a * 0.2 + p * 0.1 + o * 0.3);
    setResultado(score);
  }

  function usarValor() {
    if (resultado != null) setSaps3(resultado);
    r.back();
  }

  return (
    <Screen scroll contentStyle={{ maxWidth: 520, width: "100%", alignSelf: "center" }}>
      <AppHeader title="SAPS 3" subtitle="Calculadora rápida (simplificada)" right={<Button label="Voltar" tone="neutral" onPress={() => r.back()} />} />
      <Card style={{ gap: theme.space.md }}>
        <TextField label="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" placeholder="Ex.: 73" />
        <TextField label="PAS" value={pas} onChangeText={setPas} keyboardType="numeric" placeholder="Ex.: 90" />
        <TextField label="PaO2/FiO2" value={pao2fio2} onChangeText={setPao2fio2} keyboardType="numeric" placeholder="Ex.: 180" />
        <Button label="Calcular" onPress={calcular} />
        <KeyValueRow k="Resultado" v={resultado != null ? String(resultado) : "-"} />
        <Button label="Usar valor" tone="success" onPress={usarValor} disabled={resultado == null} />
        <Text style={{ color: theme.colors.subtle, fontSize: theme.font.small }}>
          Observação: este cálculo é apenas para simulação do fluxo no MVP.
        </Text>
      </Card>
    </Screen>
  );
}
