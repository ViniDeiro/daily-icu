import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { api } from "../lib/api";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../stores/auth";
import {
  AppHeader,
  Button,
  Card,
  ChipsRow,
  Screen,
  Tag,
  calcAge,
  formatISODate,
  theme
} from "../lib/ui";

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
      <Screen>
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;
  if (!hospitalId) return <Redirect href="/hospitals" />;

  return (
    <Screen>
      <AppHeader
        title="UTI — Pacientes"
        subtitle={`Hospital: ${hospitalId}`}
        right={
          <Button
            label="Trocar"
            tone="neutral"
            onPress={async () => {
              await setHospital(null);
              r.replace("/hospitals");
            }}
          />
        }
      />

      <View style={{ gap: theme.space.md, maxWidth: 980, width: "100%", alignSelf: "center" }}>
        <Card style={{ gap: theme.space.md }}>
          <ChipsRow>
            <Tag label={`Ocupação: ${Math.min(data.length, 10)}/10`} tone={data.length >= 10 ? "danger" : "primary"} />
            <Tag label="Alta: 0" tone="default" />
            <Tag label="Óbito: 0" tone="default" />
            <Tag label="CROSS: 0" tone="default" />
          </ChipsRow>
          <View style={{ flexDirection: "row", gap: theme.space.sm }}>
            <View style={{ flex: 1 }}>
              <Button label="Novo paciente" onPress={() => r.push("/patients/new")} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="SAPS 3" tone="neutral" onPress={() => r.push("/saps3")} />
            </View>
          </View>
        </Card>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          refreshing={loading}
          onRefresh={load}
          contentContainerStyle={{ gap: theme.space.md, paddingBottom: theme.space.lg }}
          renderItem={({ item }) => {
            const age = calcAge(item.dataNascimento);
            const risk = item.mortalidadeEstimada != null ? `${item.mortalidadeEstimada.toFixed(1)}% A.S.` : null;
            return (
              <Card style={{ padding: theme.space.lg }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: theme.space.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: theme.font.h2, fontWeight: "900" }}>{item.nome}</Text>
                    <Text style={{ color: theme.colors.muted, marginTop: 4 }}>
                      {age != null ? `${age} anos` : "Idade -"} • Reg. {item.registroHospitalar}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    {item.saps3Atual != null ? <Tag label={`SAPS 3: ${item.saps3Atual}`} tone="warning" /> : <Tag label="SAPS 3: -" />}
                    {risk ? <Tag label={risk} tone="danger" /> : null}
                  </View>
                </View>
                <View style={{ height: theme.space.md }} />
                <ChipsRow>
                  <Tag label={`DIUTI: ${formatISODate(item.dataInternacaoUti)}`} />
                  <Tag label={`DIH: ${formatISODate(item.dataInternacaoHospitalar)}`} />
                </ChipsRow>
                <View style={{ height: theme.space.md }} />
                <Button label="Abrir diário" onPress={() => r.push(`/patients/${item.id}`)} />
              </Card>
            );
          }}
          ListEmptyComponent={
            <Card>
              <Text style={{ color: theme.colors.muted }}>
                {loading ? "Carregando pacientes…" : "Nenhum paciente cadastrado. Use “Novo paciente” para começar."}
              </Text>
            </Card>
          }
        />
      </View>
    </Screen>
  );
}
