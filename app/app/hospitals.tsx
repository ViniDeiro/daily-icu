import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../stores/auth";
import { Redirect, useRouter } from "expo-router";
import { AppHeader, Button, Card, Screen, Tag, theme } from "../lib/ui";

type Hospital = { id: string; nome: string };

export default function Hospitals() {
  const [data, setData] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const setHospital = useAuth((s) => s.setHospital);
  const logout = useAuth((s) => s.logout);
  const r = useRouter();

  useEffect(() => {
    if (!hydrated || !token) return;
    setLoading(true);
    api
      .get("/hospitals")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [hydrated, token]);

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
  async function select(h: Hospital) {
    await setHospital(h.id);
    r.replace("/patients");
  }

  async function doLogout() {
    await logout();
    r.replace("/(auth)/login");
  }
  return (
    <Screen>
      <AppHeader
        title="Hospital"
        subtitle="Selecione a unidade para continuar"
        right={<Button label="Sair" tone="neutral" onPress={doLogout} />}
      />
      <View style={{ gap: theme.space.md, flex: 1, maxWidth: 980, width: "100%", alignSelf: "center" }}>
        <Card style={{ padding: theme.space.lg }}>
          <Text style={{ color: theme.colors.muted, marginBottom: theme.space.sm }}>
            Dica: em produção, isso pode ser fixo por usuário.
          </Text>
          <Tag label={`${data.length} unidade(s) disponível(is)`} tone="primary" />
        </Card>
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ gap: theme.space.md, paddingBottom: theme.space.lg }}
          renderItem={({ item }) => (
            <Card style={{ padding: theme.space.lg }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.font.h2, fontWeight: "800" }}>{item.nome}</Text>
              <View style={{ height: theme.space.md }} />
              <Button label="Selecionar" tone="primary" onPress={() => select(item)} />
            </Card>
          )}
          ListEmptyComponent={
            <Card>
              <Text style={{ color: theme.colors.muted }}>
                {loading ? "Carregando hospitais…" : "Nenhum hospital retornado pela API."}
              </Text>
            </Card>
          }
        />
      </View>
    </Screen>
  );
}
