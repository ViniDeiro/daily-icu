import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { styled } from "nativewind";
import { api } from "../lib/api";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../stores/auth";
import { Button, Card, Screen, StatusBadge } from "../components/ui";
import { calcAge, formatISODate } from "../lib/format";

type Paciente = {
  id: string;
  nome: string;
  registroHospitalar: string;
  dataInternacaoUti: string | null;
  dataInternacaoHospitalar?: string | null;
  dataNascimento?: string | null;
  saps3Atual?: number | null;
  mortalidadeEstimada?: number | null;
};

const StyledView = styled(View);
const StyledText = styled(Text);

export default function Patients() {
  const [data, setData] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const hospitalId = useAuth((s) => s.hospitalId);
  const setHospital = useAuth((s) => s.setHospital);

  async function load() {
    if (!token || !hospitalId) return;
    setLoading(true);
    try {
      const res = await api.get("/patients");
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hydrated || !token || !hospitalId) return;
    load();
  }, [hydrated, token, hospitalId]);

  if (!hydrated) {
    return (
      <Screen className="justify-center items-center bg-zinc-50">
        <ActivityIndicator color="black" />
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;
  if (!hospitalId) return <Redirect href="/hospitals" />;

  return (
    <Screen className="px-6 py-6 bg-zinc-50">
      <StyledView className="flex-row items-center justify-between mb-8 mt-4">
        <StyledView>
          <StyledText className="text-3xl font-bold text-zinc-900 uppercase tracking-tighter">Daily ICU</StyledText>
          <StyledText className="text-zinc-400 text-xs font-bold font-mono mt-1 tracking-widest">ID: {hospitalId}</StyledText>
        </StyledView>
        <Button
          label="TROCAR"
          variant="ghost"
          onPress={async () => {
            await setHospital(null);
            r.replace("/hospitals");
          }}
          className="h-9 px-3 rounded-xl bg-white border border-zinc-100 shadow-sm"
        />
      </StyledView>

      <StyledView className="w-full max-w-4xl self-center flex-1 space-y-6">
        {/* Dashboard Bar */}
        <StyledView className="flex-row flex-wrap gap-3">
          <StatusBadge label={`OCUPAÇÃO: ${Math.min(data.length, 10)}/10`} status={data.length >= 10 ? "critical" : "stable"} />
          <StatusBadge label="ALTA: 0" status="neutral" />
          <StatusBadge label="ÓBITO: 0" status="neutral" />
        </StyledView>

        <StyledView className="flex-row gap-4">
          <Button label="NOVO PACIENTE" onPress={() => r.push("/patients/new")} className="flex-1 rounded-2xl shadow-sm h-12" />
          <Button label="SAPS 3 (CALC)" variant="secondary" onPress={() => r.push("/saps3")} className="flex-1 rounded-2xl shadow-sm h-12 bg-white" />
        </StyledView>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerClassName="gap-4 pb-8"
          renderItem={({ item }) => {
            const age = calcAge(item.dataNascimento);
            const risk = item.mortalidadeEstimada != null ? `${item.mortalidadeEstimada.toFixed(1)}%` : null;

            return (
              <Card className="p-5 rounded-3xl shadow-sm border-zinc-100 space-y-4" noPadding>
                <StyledView className="flex-row justify-between items-start">
                  <StyledView className="flex-1 pr-4">
                    <StyledText className="text-xl font-bold text-zinc-900 leading-tight tracking-tight">{item.nome}</StyledText>
                    <StyledText className="text-zinc-400 font-medium text-xs mt-1 uppercase tracking-wide">
                      REG: {item.registroHospitalar} • {age != null ? `${age} ANOS` : "IDADE -"}
                    </StyledText>
                  </StyledView>
                  <StyledView className="items-end space-y-1">
                    {item.saps3Atual != null ? <StatusBadge label={`SAPS: ${item.saps3Atual}`} status="warning" /> : <StatusBadge label="SAPS: -" status="neutral" />}
                    {risk && <StyledText className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md mt-1">RISCO: {risk}</StyledText>}
                  </StyledView>
                </StyledView>

                <StyledView className="h-[1px] bg-zinc-100" />

                <StyledView className="flex-row flex-wrap gap-4">
                  <StyledView>
                    <StyledText className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Admissão UTI</StyledText>
                    <StyledText className="text-sm text-zinc-700 font-medium">{formatISODate(item.dataInternacaoUti)}</StyledText>
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Admissão Hosp</StyledText>
                    <StyledText className="text-sm text-zinc-700 font-medium">{formatISODate(item.dataInternacaoHospitalar)}</StyledText>
                  </StyledView>
                </StyledView>

                <Button label="ABRIR DIÁRIO" variant="secondary" onPress={() => r.push(`/patients/${item.id}`)} className="h-11 w-full rounded-xl bg-zinc-50 border-zinc-200 shadow-sm mt-1" />
              </Card>
            );
          }}
          ListEmptyComponent={
            <Card className="items-center py-12 border-dashed border-zinc-200 bg-transparent shadow-none">
              <StyledText className="text-zinc-400 font-medium text-lg">Nenhum paciente cadastrado.</StyledText>
            </Card>
          }
        />
      </StyledView>
    </Screen>
  );
}
