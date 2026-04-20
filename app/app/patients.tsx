import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View, Text } from "react-native";
import { styled } from "nativewind";
import { api } from "../lib/api";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../stores/auth";
import { Button, Card, Screen, Pill, TopBar } from "../components/ui";
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

  if (!hydrated) return <Screen className="bg-slate-50"><ActivityIndicator /></Screen>;
  if (!token) return <Redirect href="/(auth)/login" />;
  if (!hospitalId) return <Redirect href="/hospitals" />;

  return (
    <Screen className="bg-slate-50">
      <TopBar 
        title="Pacientes" 
        subtitle="Daily ICU • Unidade Geral"
        action={
            <Button 
                label="Trocar" 
                variant="ghost" 
                onPress={async () => {
                    await setHospital(null);
                    r.replace("/hospitals");
                }}
                className="h-8 px-3 text-xs"
            />
        }
      />

      <StyledView className="flex-1 w-full max-w-4xl self-center px-6 pt-6">
        {/* Stats */}
        <StyledView className="flex-row flex-wrap gap-2 mb-6">
          <Pill label={`Ocupação: ${Math.min(data.length, 10)}/10`} variant={data.length >= 10 ? "critical" : "primary"} />
          <Pill label="Altas: 0" variant="neutral" />
          <Pill label="Óbitos: 0" variant="neutral" />
        </StyledView>

        <StyledView className="flex-row gap-3 mb-6">
          <Button label="+ Novo Paciente" onPress={() => r.push("/patients/new")} className="flex-1 rounded-xl h-12" />
          <Button label="Calc. SAPS 3" variant="secondary" onPress={() => r.push("/saps3")} className="flex-1 rounded-xl h-12" />
        </StyledView>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerClassName="gap-4 pb-12"
          renderItem={({ item }) => {
            const age = calcAge(item.dataNascimento);
            const risk = item.mortalidadeEstimada != null ? `${item.mortalidadeEstimada.toFixed(1)}%` : null;
            const initials = item.nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

            return (
              <Card className="p-5 active:bg-slate-50" noPadding>
                <StyledView className="flex-row justify-between items-start mb-4">
                  <StyledView className="flex-row gap-4 flex-1 min-w-0 pr-2">
                    <StyledView className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 shrink-0">
                        <StyledText className="text-slate-600 font-bold text-xs">{initials}</StyledText>
                    </StyledView>
                    <StyledView className="flex-1 min-w-0">
                        <StyledText className="text-lg font-bold text-slate-900 leading-tight" numberOfLines={1}>{item.nome}</StyledText>
                        <StyledText className="text-slate-400 font-medium text-xs mt-0.5">
                            REG: {item.registroHospitalar} • {age != null ? `${age} anos` : "-"}
                        </StyledText>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="items-end gap-1 shrink-0">
                    {item.saps3Atual != null 
                        ? <Pill label={`SAPS: ${item.saps3Atual}`} variant="warning" /> 
                        : <Pill label="SAPS: -" variant="neutral" />
                    }
                    {risk && <Pill label={`Risco: ${risk}`} variant="critical" />}
                  </StyledView>
                </StyledView>

                <StyledView className="h-[1px] bg-slate-50 mb-3" />

                <StyledView className="flex-row justify-between items-center">
                    <StyledView className="flex-row gap-4">
                        <StyledView>
                            <StyledText className="text-[10px] text-slate-400 uppercase font-bold">UTI</StyledText>
                            <StyledText className="text-xs font-bold text-slate-700">{formatISODate(item.dataInternacaoUti)}</StyledText>
                        </StyledView>
                        <StyledView>
                            <StyledText className="text-[10px] text-slate-400 uppercase font-bold">Hosp</StyledText>
                            <StyledText className="text-xs font-bold text-slate-700">{formatISODate(item.dataInternacaoHospitalar)}</StyledText>
                        </StyledView>
                    </StyledView>
                    <Button 
                        label="Abrir" 
                        variant="secondary" 
                        onPress={() => r.push(`/patients/${item.id}`)} 
                        className="h-8 px-4 rounded-lg text-xs bg-slate-50"
                    />
                </StyledView>
              </Card>
            );
          }}
          ListEmptyComponent={
            <Card className="items-center py-16 border-dashed border-2 border-slate-200 bg-transparent shadow-none">
              <StyledText className="text-slate-400 font-medium text-lg">Lista vazia.</StyledText>
            </Card>
          }
        />
      </StyledView>
    </Screen>
  );
}
