import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { styled } from "nativewind";
import { api } from "../lib/api";
import { useAuth } from "../stores/auth";
import { Redirect, useRouter } from "expo-router";
import { Button, Card, Screen, TopBar, Pill } from "../components/ui";

type Hospital = { id: string; nome: string };

const StyledView = styled(View);

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
      <Screen className="justify-center items-center bg-slate-50">
        <ActivityIndicator color="#0F766E" size="large" />
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;

  async function select(h: Hospital) {
    setLoading(true);
    await setHospital(h.id);
    // Artificial delay for smooth transition feel
    await new Promise((resolve) => setTimeout(resolve, 100));
    setLoading(false);
    r.replace("/patients");
  }

  async function doLogout() {
    await logout();
    r.replace("/(auth)/login");
  }

  return (
    <Screen className="bg-slate-50">
      <TopBar 
        title="Unidades" 
        subtitle="Selecione o local de trabalho"
        action={
            <Button 
                label="Sair" 
                variant="ghost" 
                onPress={doLogout} 
                className="h-9 px-3 rounded-lg text-xs" 
            />
        }
      />

      <StyledView className="flex-1 px-6 pt-6 w-full max-w-2xl self-center">
        <Card noPadding className="p-4 flex-row items-center justify-between mb-6">
          <Pill label="Disponíveis" variant="success" />
          <Pill label={`${data.length}`} variant="neutral" />
        </Card>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerClassName="gap-4 pb-8"
          renderItem={({ item }) => (
            <Card className="flex-row items-center justify-between p-5 active:scale-[0.99] active:bg-slate-50" noPadding>
              <StyledView className="flex-row items-center gap-4 flex-1 min-w-0 pr-4">
                <StyledView className="w-12 h-12 bg-primary-50 rounded-2xl items-center justify-center border border-primary-100 shrink-0">
                    <Pill label="🏥" variant="outline" className="border-0 bg-transparent" />
                </StyledView>
                <StyledView className="flex-1 min-w-0">
                    <Pill label="CNES: 123456" variant="neutral" className="mb-1 border-0 px-0" /> 
                    {/* Using Pill as label carrier or just text? Text is better for semantics, Pill for status. */}
                    {/* Let's stick to text for name */}
                    <Button 
                        label={item.nome} 
                        variant="ghost" 
                        className="items-start justify-start px-0 h-auto" 
                        onPress={() => select(item)}
                    />
                </StyledView>
              </StyledView>
              <Button label="Acessar" onPress={() => select(item)} className="h-10 px-5 rounded-xl bg-primary-600 shrink-0" />
            </Card>
          )}
          ListEmptyComponent={
            <Card className="items-center py-12 border-dashed border-2 border-slate-200 bg-transparent shadow-none">
               <ActivityIndicator color="#94A3B8" />
            </Card>
          }
        />
      </StyledView>
    </Screen>
  );
}
