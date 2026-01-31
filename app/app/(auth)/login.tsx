import { useState } from "react";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuth } from "../../stores/auth";
import { Button, Card, Input, Screen } from "../../components/ui";

const StyledView = styled(View);
const StyledText = styled(Text);

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
    <Screen scroll contentContainerClassName="justify-center px-8 py-10 bg-zinc-50/50">
      <StyledView className="w-full max-w-md self-center space-y-10">
        <StyledView className="items-center space-y-3">
          <StyledView className="w-16 h-16 bg-black rounded-3xl mb-2 items-center justify-center shadow-lg shadow-black/20">
            <StyledText className="text-white text-2xl font-bold">D</StyledText>
          </StyledView>
          <StyledView className="items-center">
            <StyledText className="text-4xl font-bold text-zinc-900 tracking-tighter">Daily ICU</StyledText>
            <StyledText className="text-zinc-500 font-medium text-lg tracking-tight">Acesso Profissional</StyledText>
          </StyledView>
        </StyledView>

        <Card className="space-y-6 shadow-xl shadow-zinc-200/50 border-zinc-100">
          <Input
            label="Email Corporativo"
            value={email}
            onChangeText={setEmail}
            placeholder="medico@hospital.com"
            keyboardType="email-address"
          />
          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
            secureTextEntry
          />

          {error && <StyledText className="text-red-600 font-bold text-sm text-center bg-red-50 py-2 rounded-lg">{error}</StyledText>}

          <Button label="ACESSAR SISTEMA" onPress={submit} loading={loading} />

          <StyledView className="flex-row justify-center items-center space-x-1 pt-2">
            <StyledText className="text-zinc-500 font-medium">Não tem conta?</StyledText>
            <Button variant="ghost" label="Criar cadastro" onPress={() => r.push("/signup")} className="h-auto px-2 py-0" />
          </StyledView>
        </Card>

        <StyledText className="text-center text-zinc-300 font-medium text-xs tracking-widest uppercase">
          Swiss Clinical Design • v1.0
        </StyledText>
      </StyledView>
    </Screen>
  );
}
