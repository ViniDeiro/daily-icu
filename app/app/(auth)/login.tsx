import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuth } from "../../stores/auth";
import { AppHeader, Button, Card, Screen, TextField, theme } from "../../lib/ui";

export default function Login() {
  const r = useRouter();
  const setToken = useAuth((s) => s.setToken);
  const setHospital = useAuth((s) => s.setHospital);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, senha });
      await setToken(res.data.token);
      await setHospital(null);
      r.replace("/hospitals");
    } catch {
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll contentStyle={{ justifyContent: "center", flexGrow: 1, maxWidth: 520, width: "100%", alignSelf: "center" }}>
      <View style={{ gap: theme.space.md }}>
        <AppHeader title="UTI — Diário & Passagem" subtitle="Login de acesso" />
        <Card style={{ gap: theme.space.md }}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu.email@hospital.com"
            keyboardType="email-address"
          />
          <TextField label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />
          {error ? <Text style={{ color: theme.colors.danger, fontWeight: "700" }}>{error}</Text> : null}
          <Button label="Entrar" onPress={submit} loading={loading} />
        </Card>
        <Text style={{ color: theme.colors.subtle, textAlign: "center", fontSize: theme.font.small }}>
          Em modo mock, qualquer email válido e senha com 6+ caracteres entram.
        </Text>
      </View>
    </Screen>
  );
}
