import { useState } from "react";
import { ActivityIndicator, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { styled } from "nativewind";
import { api } from "../../lib/api";
import { Redirect, useRouter } from "expo-router";
import { useSaps } from "../../stores/saps";
import { useAuth } from "../../stores/auth";
import { Button, Card, Screen, FormField, SectionTitle, Divider, TopBar } from "../../components/ui";

const StyledView = styled(View);

export default function NewPatient() {
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const hospitalId = useAuth((s) => s.hospitalId);
  const [nome, setNome] = useState("");
  const [registro, setRegistro] = useState("");
  const [cpf, setCpf] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [nomePai, setNomePai] = useState("");
  const [endereco, setEndereco] = useState("");
  const [leito, setLeito] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [dataHospital, setDataHospital] = useState("");
  const [dataUti, setDataUti] = useState("");
  const [previsaoAlta, setPrevisaoAlta] = useState("");
  const [alergias, setAlergias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saps3, setSaps3] = useState<number | null>(null);
  const sapsStore = useSaps((s) => s.saps3);
  
  if (sapsStore != null && saps3 !== sapsStore) setSaps3(sapsStore);

  if (!hydrated) return <Screen className="bg-slate-50"><ActivityIndicator /></Screen>;
  if (!token) return <Redirect href="/(auth)/login" />;
  if (!hospitalId) return <Redirect href="/hospitals" />;

  async function save() {
    setLoading(true);
    setError(null);
    if (!nome || !registro || !cpf || !nomeMae || !dataNasc) {
      setError("Preencha todos os campos obrigatórios (*)");
      setLoading(false);
      return;
    }

    try {
      const p = await api.post("/patients", {
        nome,
        registroHospitalar: registro,
        cpf,
        nomeMae,
        nomePai: nomePai || undefined,
        endereco: endereco || undefined,
        leito: leito || undefined,
        dataNascimento: dataNasc,
        dataInternacaoHospitalar: dataHospital || undefined,
        dataInternacaoUti: dataUti || undefined,
        previsaoAlta: previsaoAlta || undefined,
        alergias: alergias || undefined,
        setor: "UTI"
      });
      const today = new Date().toISOString();
      await api.post(`/patients/${p.data.id}/days`, { data: today, condutaDiaria: "" });
      if (saps3 != null) {
        const days = await api.get(`/patients/${p.data.id}/days`);
        const current = days.data[0];
        await api.put(`/patients/${p.data.id}/days/${current.id}?override=true`, { saps3 });
      }
      r.replace(`/patients/${p.data.id}`);
    } catch {
      setError("Erro ao salvar. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen className="bg-slate-50">
      <TopBar title="Novo Paciente" subtitle="Admissão UTI" back />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerClassName="p-6 pb-12" showsVerticalScrollIndicator={false}>
            <Card className="space-y-6" noPadding>
                <StyledView className="p-6 space-y-6">
                    <SectionTitle title="Identificação" />
                    <FormField label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Nome do paciente" />
                    <StyledView className="flex-row gap-4">
                        <FormField containerClassName="flex-1 min-w-0" label="CPF *" value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" keyboardType="numeric" />
                        <FormField containerClassName="flex-1 min-w-0" label="Registro *" value={registro} onChangeText={setRegistro} placeholder="RH/Prontuário" keyboardType="numeric" />
                    </StyledView>
                    <StyledView className="flex-row gap-4">
                        <FormField containerClassName="flex-1 min-w-0" label="Nascimento *" value={dataNasc} onChangeText={setDataNasc} placeholder="YYYY-MM-DD" />
                        <FormField containerClassName="flex-1 min-w-0" label="Leito" value={leito} onChangeText={setLeito} placeholder="Ex: 05" />
                    </StyledView>
                </StyledView>

                <Divider />

                <StyledView className="p-6 space-y-6">
                    <SectionTitle title="Filiação & Contato" />
                    <FormField label="Nome da Mãe *" value={nomeMae} onChangeText={setNomeMae} placeholder="Nome completo" />
                    <FormField label="Nome do Pai" value={nomePai} onChangeText={setNomePai} placeholder="Opcional" />
                    <FormField label="Endereço" value={endereco} onChangeText={setEndereco} placeholder="Rua, Cidade, UF" />
                </StyledView>

                <Divider />

                <StyledView className="p-6 space-y-6">
                    <SectionTitle title="Internação" />
                    <StyledView className="flex-row gap-4">
                        <FormField containerClassName="flex-1 min-w-0" label="Data Hosp." value={dataHospital} onChangeText={setDataHospital} placeholder="YYYY-MM-DD" />
                        <FormField containerClassName="flex-1 min-w-0" label="Data UTI" value={dataUti} onChangeText={setDataUti} placeholder="YYYY-MM-DD" />
                    </StyledView>
                    <FormField label="Previsão Alta" value={previsaoAlta} onChangeText={setPrevisaoAlta} placeholder="YYYY-MM-DD" />
                </StyledView>

                <Divider />

                <StyledView className="p-6 space-y-6">
                    <SectionTitle title="Clínica" />
                    <FormField label="Alergias" value={alergias} onChangeText={setAlergias} placeholder="Nega, Penicilina..." />
                    
                    <StyledView className="flex-row gap-4 items-end">
                        <Button label="Calc. SAPS 3" variant="secondary" onPress={() => r.push("/saps3")} className="flex-1 rounded-xl h-14" />
                        <StyledView className="flex-1 h-14 bg-slate-100 rounded-xl border border-slate-200 items-center justify-center">
                            <SectionTitle title="Score" />
                            <StyledView className="-mt-3"><Button label={saps3 ? String(saps3) : "-"} variant="ghost" disabled /></StyledView>
                        </StyledView>
                    </StyledView>
                </StyledView>

                {error && (
                    <StyledView className="px-6 pb-2">
                        <Pill label={error} variant="critical" className="w-full justify-center" />
                    </StyledView>
                )}

                <StyledView className="p-6 pt-0">
                    <Button label="Admitir Paciente" onPress={save} loading={loading} className="h-14 rounded-2xl shadow-md" />
                </StyledView>
            </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
