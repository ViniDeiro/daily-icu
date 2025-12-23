import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { api } from "../../lib/api";
import { Redirect, useRouter } from "expo-router";
import { useSaps } from "../../stores/saps";
import { useAuth } from "../../stores/auth";
import { AppHeader, Button, Card, Screen, TextField, theme } from "../../lib/ui";

export default function NewPatient() {
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const hospitalId = useAuth((s) => s.hospitalId);
  const [nome, setNome] = useState("");
  const [registro, setRegistro] = useState("");
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
      <Screen>
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;
  if (!hospitalId) return <Redirect href="/hospitals" />;

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const p = await api.post("/patients", {
        nome,
        registroHospitalar: registro,
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
    <Screen scroll contentStyle={{ maxWidth: 720, width: "100%", alignSelf: "center" }}>
      <AppHeader title="Novo paciente" subtitle="Cadastro (Dia 1) + criação do diário" />
      <Card style={{ gap: theme.space.md }}>
        <TextField label="Nome completo" value={nome} onChangeText={setNome} placeholder="Ex.: Soares da Silva Souza" />
        <TextField label="Registro hospitalar" value={registro} onChangeText={setRegistro} placeholder="Ex.: 64111" />
        <TextField label="Leito" value={leito} onChangeText={setLeito} placeholder="Ex.: 08" />
        <TextField label="Data de nascimento" value={dataNasc} onChangeText={setDataNasc} placeholder="YYYY-MM-DD" />
        <TextField
          label="Data internação hospitalar (DIH)"
          value={dataHospital}
          onChangeText={setDataHospital}
          placeholder="YYYY-MM-DD"
        />
        <TextField label="Data internação UTI (DIUTI)" value={dataUti} onChangeText={setDataUti} placeholder="YYYY-MM-DD" />
        <TextField label="Previsão de alta" value={previsaoAlta} onChangeText={setPrevisaoAlta} placeholder="YYYY-MM-DD" />
        <TextField label="Alergias" value={alergias} onChangeText={setAlergias} placeholder="Ex.: Dipirona" />

        <View style={{ flexDirection: "row", gap: theme.space.sm }}>
          <View style={{ flex: 1 }}>
            <Button label="Calcular SAPS 3" tone="neutral" onPress={() => r.push("/saps3")} />
          </View>
          <View style={{ justifyContent: "center" }}>
            <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>SAPS: {saps3 ?? "-"}</Text>
          </View>
        </View>

        {error ? <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{error}</Text> : null}

        <View style={{ flexDirection: "row", gap: theme.space.sm }}>
          <View style={{ flex: 1 }}>
            <Button label="Cancelar" tone="neutral" onPress={() => r.back()} disabled={loading} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Salvar" onPress={save} loading={loading} />
          </View>
        </View>
      </Card>
    </Screen>
  );
}
