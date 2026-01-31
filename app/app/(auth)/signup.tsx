import { useState } from "react";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { Button, Card, Input, Screen } from "../../components/ui";

const StyledView = styled(View);
const StyledText = styled(Text);

export default function Signup() {
    const r = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [nome, setNome] = useState("");
    const [crm, setCrm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit() {
        setError(null);
        setLoading(true);
        try {
            if (!email || !senha || !nome) {
                setError("Preencha todos os campos obrigatórios.");
                return;
            }
            await api.post("/auth/register", { email, senha, nome, crm });
            r.replace("/(auth)/login");
        } catch {
            setError("Erro ao cadastrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Screen scroll contentContainerClassName="justify-center px-6">
            <StyledView className="w-full max-w-md self-center space-y-6">
                <StyledView className="space-y-1">
                    <StyledText className="text-3xl font-bold text-zinc-900 tracking-tighter">Novo Acesso</StyledText>
                    <StyledText className="text-zinc-600 text-base">Informe seus dados profissionais.</StyledText>
                </StyledView>

                <Card className="space-y-4">
                    <Input label="Nome Completo" value={nome} onChangeText={setNome} placeholder="Dr. João Silva" />
                    <Input label="CRM / Registro" value={crm} onChangeText={setCrm} placeholder="12345/SP" />
                    <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    <Input label="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

                    {error && <StyledText className="text-red-600 font-bold text-sm">{error}</StyledText>}

                    <Button label="CRIAR CONTA" onPress={submit} loading={loading} />

                    <Button variant="ghost" label="Voltar para Login" onPress={() => r.back()} />
                </Card>
            </StyledView>
        </Screen>
    );
}
