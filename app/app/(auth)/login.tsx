import { useState } from "react";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { useAuth } from "../../stores/auth";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";
import { Button, FormField, Screen } from "../../components/ui";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setToken = useAuth((s) => s.setToken);
  const r = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      await setToken(res.data.token);
      r.replace("/hospitals");
    } catch (e) {
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen className="bg-background justify-center px-6" contentContainerClassName="flex-1 justify-center max-w-md w-full self-center">
      <StyledView className="items-center mb-12">
        <StyledView className="w-20 h-20 bg-primary-100 rounded-3xl items-center justify-center mb-6 shadow-sm shadow-primary-200">
             <StyledText className="text-4xl">🏥</StyledText>
        </StyledView>
        <StyledText className="text-4xl font-bold text-slate-900 tracking-tight text-center">Daily UTI</StyledText>
        <StyledText className="text-slate-500 font-medium text-lg mt-2 text-center">Gestão intensiva inteligente</StyledText>
      </StyledView>

      <StyledView className="space-y-6 bg-white p-8 rounded-[32px] shadow-lg shadow-slate-200/50 border border-white">
        <StyledView className="space-y-5">
            <FormField 
                label="E-mail profissional" 
                value={email} 
                onChangeText={setEmail} 
                placeholder="seunome@hospital.com" 
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <FormField 
                label="Senha de acesso" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                placeholder="••••••••"
            />
        </StyledView>

        {error ? (
            <StyledView className="bg-red-50 p-4 rounded-xl border border-red-100">
                <StyledText className="text-critical font-bold text-center text-sm">{error}</StyledText>
            </StyledView>
        ) : null}

        <Button label="ACESSAR SISTEMA" onPress={handleLogin} loading={loading} className="shadow-primary-500/30" />
        
        <Button 
            label="Criar nova conta" 
            variant="ghost" 
            onPress={() => r.push("/(auth)/signup")} 
            className="mt-2"
        />
      </StyledView>
      
      <StyledText className="text-center text-slate-400 text-xs font-medium mt-12">
        Versão 1.0.2 • Build 2026
      </StyledText>
    </Screen>
  );
}
