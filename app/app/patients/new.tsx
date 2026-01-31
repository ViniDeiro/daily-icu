import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { styled } from "nativewind";
import { api } from "../../lib/api";
import { Redirect, useRouter } from "expo-router";
import { useSaps } from "../../stores/saps";
import { useAuth } from "../../stores/auth";
import { Button, Card, Screen, Input, SectionTitle } from "../../components/ui";

const StyledView = styled(View);
const StyledText = styled(Text);

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

  if (!hydrated) {
    return (
      <Screen className="justify-center items-center bg-zinc-50">
        <ActivityIndicator color="black" />
      </Screen>
    );
  }
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
      setError("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll className="bg-zinc-50">
      <StyledView className="px-6 py-6 w-full max-w-2xl self-center">
        <StyledView className="flex-row items-center justify-between mb-8 mt-4">
          <StyledView>
            <StyledText className="text-3xl font-bold text-zinc-900 tracking-tighter">Novo Paciente</StyledText>
            <StyledText className="text-zinc-500 text-base font-medium">Cadastro e admissão</StyledText>
          </StyledView>
          <Button label="CANCELAR" variant="ghost" onPress={() => r.back()} className="h-10 px-4 rounded-xl bg-white border border-zinc-100 shadow-sm" />
        </StyledView>

        <Card className="p-6 space-y-8 shadow-sm border-zinc-100 rounded-3xl" noPadding>
          <StyledView>
            <SectionTitle title="IDENTIFICAÇÃO" />
            <StyledView className="space-y-4 mt-2">
              <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Ex.: Soares da Silva Souza" />
              <StyledView className="flex-row gap-4">
                <Input containerClassName="flex-1" label="CPF *" value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" keyboardType="numeric" />
                <Input containerClassName="flex-1" label="Registro hospitalar *" value={registro} onChangeText={setRegistro} placeholder="Ex.: 64111" />
              </StyledView>

              <Input label="Nome da mãe *" value={nomeMae} onChangeText={setNomeMae} placeholder="Nome completo da mãe" />
              <Input label="Nome do pai" value={nomePai} onChangeText={setNomePai} placeholder="Nome completo do pai" />
              <Input label="Endereço completo" value={endereco} onChangeText={setEndereco} placeholder="Rua, Número, Cidade..." />

              <StyledView className="flex-row gap-4">
                <Input containerClassName="flex-1" label="Nascimento *" value={dataNasc} onChangeText={setDataNasc} placeholder="YYYY-MM-DD" />
                <Input containerClassName="flex-1" label="Leito" value={leito} onChangeText={setLeito} placeholder="Ex.: 08" />
              </StyledView>
            </StyledView>
          </StyledView>

          <Divider className="my-2" />

          <StyledView>
            <SectionTitle title="DATAS" />
            <StyledView className="space-y-4 mt-2">
              <StyledView className="flex-row gap-4">
                <Input containerClassName="flex-1" label="DIH" value={dataHospital} onChangeText={setDataHospital} placeholder="YYYY-MM-DD" />
                <Input containerClassName="flex-1" label="DIUTI" value={dataUti} onChangeText={setDataUti} placeholder="YYYY-MM-DD" />
              </StyledView>
              <Input label="Previsão de alta" value={previsaoAlta} onChangeText={setPrevisaoAlta} placeholder="YYYY-MM-DD" />
            </StyledView>
          </StyledView>

          <Divider className="my-2" />

          <StyledView>
            <SectionTitle title="CLÍNICA" />
            <StyledView className="space-y-4 mt-2">
              <Input label="Alergias" value={alergias} onChangeText={setAlergias} placeholder="Ex.: Dipirona" />

              <StyledView className="flex-row gap-4 items-end">
                <Button label="CALCULAR SAPS 3" variant="secondary" onPress={() => r.push("/saps3")} className="flex-1 rounded-xl h-14 bg-zinc-50 border-zinc-200" />
                <StyledView className="flex-1 h-14 justify-center items-center bg-zinc-100 rounded-xl border border-zinc-200">
                  <StyledText className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Score SAPS 3</StyledText>
                  <StyledText className="text-zinc-900 text-xl font-bold">{saps3 ?? "-"}</StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>

          {error ? <StyledText className="text-red-600 font-bold text-center bg-red-50 py-3 rounded-xl">{error}</StyledText> : null}

          <StyledView className="pt-2">
            <Button label="ADMITIR PACIENTE" onPress={save} loading={loading} className="rounded-2xl h-14 shadow-md shadow-zinc-200" />
          </StyledView>
        </Card>
      </StyledView>
    </Screen>
  );
}
