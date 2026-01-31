import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { styled } from "nativewind";
import { api } from "../lib/api";
import { useAuth } from "../stores/auth";
import { Redirect, useRouter } from "expo-router";
import { Button, Card, Screen, StatusBadge } from "../components/ui";

type Hospital = { id: string; nome: string };

const StyledView = styled(View);
const StyledText = styled(Text);

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
      <Screen className="justify-center items-center bg-zinc-50">
        <ActivityIndicator color="black" />
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
    <Screen className="px-6 py-6 bg-zinc-50">
      <StyledView className="flex-row items-center justify-between mb-8 mt-4">
        <StyledView>
          <StyledText className="text-3xl font-bold text-zinc-900 tracking-tighter">Unidades</StyledText>
          <StyledText className="text-zinc-500 text-base font-medium">Selecione o local de trabalho</StyledText>
        </StyledView>
        <Button label="SAIR" variant="ghost" onPress={doLogout} className="h-10 px-4 bg-white shadow-sm border border-zinc-100 rounded-xl" />
      </StyledView>

      <StyledView className="w-full max-w-2xl self-center flex-1 space-y-6">
        <Card noPadding className="p-5 flex-row items-center justify-between bg-white border-zinc-100 shadow-sm rounded-3xl">
          <StyledView className="flex-row items-center space-x-3">
            <StyledView className="w-2 h-2 rounded-full bg-green-500" />
            <StyledText className="text-zinc-500 text-sm font-bold tracking-wide">DISPONÍVEIS</StyledText>
          </StyledView>
          <StatusBadge label={`${data.length}`} status="neutral" />
        </Card>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerClassName="gap-4 pb-8"
          renderItem={({ item }) => (
            <Card className="flex-row items-center justify-between p-6 shadow-sm border-zinc-100 rounded-3xl active:scale-[0.98]" noPadding>
              <StyledView className="flex-1">
                <StyledText className="text-xl font-bold text-zinc-900 tracking-tight">{item.nome}</StyledText>
                <StyledText className="text-zinc-400 text-sm mt-1">CNES: 123456</StyledText>
              </StyledView>
              <Button label="ACESSAR" onPress={() => select(item)} className="h-10 px-6 rounded-xl" />
            </Card>
          )}
          ListEmptyComponent={
            <Card className="items-center py-12 border-dashed border-zinc-200 bg-transparent shadow-none">
              <StyledText className="text-zinc-400 font-medium text-lg">
                {loading ? "Carregando..." : "Nenhuma unidade encontrada."}
              </StyledText>
            </Card>
          }
        />
      </StyledView>
    </Screen>
  );
}
