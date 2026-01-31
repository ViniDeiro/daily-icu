import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, useWindowDimensions, View, Alert } from "react-native";
import { styled } from "nativewind";
import { api } from "../../lib/api";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useSaps } from "../../stores/saps";
import { useAuth } from "../../stores/auth";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import {
  Button,
  Card,
  ChipsRow,
  Divider,
  KeyValueRow,
  Screen,
  SectionTitle,
  Input,
  StatusBadge
} from "../../components/ui";
import { calcAge, formatDateBR, formatISODate } from "../../lib/format";

type Day = {
  id: string;
  data: string;
  diaInternacaoUti: number;
  saps3: string | null;
  condutaDiaria: string | null;
  diagnosticoPrincipal: string | null;
  peso?: string;
  comorbidades?: string;
  drogasVasoativasDescricao?: string;
  inotropicos?: string;
  antibioticos?: string;
  previos?: string;
  culturas?: string;
  diurese?: string;
  dispositivos?: string;
};

type Patient = {
  id: string;
  nome: string;
  dataNascimento: string;
  registroHospitalar: string;
  leito?: string;
  setor?: string;
  saps3?: number;
  dataInternacaoUti?: string;
  dataInternacaoHospitalar?: string;
  previsaoAlta?: string;
  alergias?: string;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

export default function PatientDetail() {
  const { id } = useLocalSearchParams();
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const sapsStore = useSaps((s) => s.saps3);
  const resetSaps = useSaps((s) => s.reset);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"VISAO_GERAL" | "EVOLUCAO" | "METAS">("EVOLUCAO");

  const [form, setForm] = useState({
    saps3: "",
    condutaDiaria: "",
    diagnosticoPrincipal: "",
    peso: "",
    comorbidades: "",
    drogasVasoativasDescricao: "",
    drogasVasoativas: false, // helper logic
    inotropicos: "",
    antibioticos: "",
    previos: "",
    culturas: "",
    diurese: "",
    dispositivos: ""
  });

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [retroOverrideDayId, setRetroOverrideDayId] = useState<string | null>(null);

  // Audio
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);
  const [audioBusy, setAudioBusy] = useState(false);

  // CID
  const [cidMode, setCidMode] = useState<"MANUAL" | "BUSCA">("MANUAL");
  const [cidQuery, setCidQuery] = useState("");
  const [cidResults, setCidResults] = useState<any[]>([]);

  // Goals
  const [goals, setGoals] = useState({
    nutricao: false,
    sedacao: false,
    analgesia: false,
    cabeceriaElevada: false,
    profilaxiaTvp: false,
    profilaxiaUlcera: false,
    glicemia: false
  });
  const [fastExpanded, setFastExpanded] = useState(false);

  useEffect(() => {
    if (token && id) loadPatient();
  }, [token, id]);

  useEffect(() => {
    if (sapsStore != null) {
      setForm((s) => ({ ...s, saps3: String(sapsStore) }));
      resetSaps();
    }
  }, [sapsStore]);

  // Search CID
  useEffect(() => {
    if (cidQuery.length > 2 && cidMode === "BUSCA") {
      const t = setTimeout(async () => {
        try {
          const res = await api.get(`/cid?q=${cidQuery}`);
          setCidResults(res.data);
        } catch { }
      }, 500);
      return () => clearTimeout(t);
    } else {
      setCidResults([]);
    }
  }, [cidQuery, cidMode]);

  async function loadPatient() {
    setLoading(true);
    try {
      const p = await api.get(`/patients/${id}`);
      setPatient(p.data);
      const d = await api.get(`/patients/${id}/days`);
      setDays(d.data);
      if (d.data.length > 0) {
        selectDay(d.data[0]);
      }
    } catch (e) {
      setError("Erro ao carregar paciente");
    } finally {
      setLoading(false);
    }
  }

  function selectDay(d: Day) {
    setSelectedDayId(d.id);
    setForm({
      saps3: d.saps3 || "",
      condutaDiaria: d.condutaDiaria || "",
      diagnosticoPrincipal: d.diagnosticoPrincipal || "",
      peso: d.peso || "",
      comorbidades: d.comorbidades || "",
      drogasVasoativasDescricao: d.drogasVasoativasDescricao || "",
      drogasVasoativas: !!d.drogasVasoativasDescricao,
      inotropicos: d.inotropicos || "",
      antibioticos: d.antibioticos || "",
      previos: d.previos || "",
      culturas: d.culturas || "",
      diurese: d.diurese || "",
      dispositivos: d.dispositivos || ""
    });
    // Attempt load audio
    checkAudio(d.id);
  }

  const selectedDay = days.find((d) => d.id === selectedDayId);
  const latestDay = days.length > 0 ? days[0] : null;

  // Logic for editing: can only edit LATEST day by default. Retro requires override.
  const isLatest = selectedDay?.id === latestDay?.id;
  const selectedDayIsRetro = !isLatest;
  const canEditSelectedDay = isLatest || (selectedDayIsRetro && retroOverrideDayId === selectedDay?.id);

  async function checkAudio(dayId: string) {
    setAudioUri(null);
    try {
      // try secure store first (offline cache sort of)
      const available = await SecureStore.isAvailableAsync();
      let uri = null;
      if (available) {
        uri = await SecureStore.getItemAsync(`audio:${dayId}`);
      }
      if (!uri) {
        // mock check server if we had robust backend for audio
      }
      if (uri) setAudioUri(uri);
    } catch { }
  }

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      Alert.alert("Erro", "Falha ao iniciar gravação");
    }
  }

  async function stopRecording() {
    setAudioBusy(true);
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording?.getURI();
    if (uri && selectedDayId) {
      setAudioUri(uri);
      const available = await SecureStore.isAvailableAsync();
      if (available) {
        await SecureStore.setItemAsync(`audio:${selectedDayId}`, uri);
      }
    }
    setAudioBusy(false);
  }

  async function playAudio(uri: string) {
    setAudioBusy(true);
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          setSound(undefined);
          setAudioBusy(false);
        }
      });
    } catch {
      setAudioBusy(false);
    }
  }

  async function stopAudio() {
    if (sound) {
      await sound.stopAsync();
      setSound(undefined);
    }
  }

  async function deleteAudio() {
    if (!selectedDayId) return;
    setAudioUri(null);
    const available = await SecureStore.isAvailableAsync();
    if (available) await SecureStore.deleteItemAsync(`audio:${selectedDayId}`);
  }

  async function saveDay(override = false) {
    if (!selectedDayId) return;
    setSaving(true);
    try {
      await api.put(`/patients/${id}/days/${selectedDayId}?override=${override}`, {
        ...form,
        saps3: form.saps3 ? Number(form.saps3) : null
      });
      // reload
      const d = await api.get(`/patients/${id}/days`);
      setDays(d.data);
      Alert.alert("Sucesso", "Dados salvos.");
      setRetroOverrideDayId(null);
    } catch {
      Alert.alert("Erro", "Falha ao salvar dia.");
    } finally {
      setSaving(false);
    }
  }

  function copyPrevConduta() {
    // find day before selected
    const idx = days.findIndex(d => d.id === selectedDayId);
    if (idx < days.length - 1) {
      const prev = days[idx + 1];
      setForm(s => ({ ...s, condutaDiaria: prev.condutaDiaria || "" }));
    } else {
      Alert.alert("Aviso", "Não há dia anterior.");
    }
  }

  if (loading || !patient) {
    return (
      <Screen className="justify-center items-center bg-zinc-50">
        <ActivityIndicator color="black" />
      </Screen>
    )
  }

  return (
    <Screen className="bg-zinc-50">
      <StyledView className="px-6 pt-6 pb-4 bg-white border-b border-zinc-100 shadow-sm z-10">
        <StyledView className="flex-row items-center justify-between mb-4 mt-2">
          <Button label="VOLTAR" variant="ghost" onPress={() => r.back()} className="h-9 px-0 rounded-xl" />
          <StyledText className="text-zinc-400 font-mono text-xs font-bold tracking-widest uppercase">Prontuário Digital</StyledText>
        </StyledView>

        <StyledView className="flex-row justify-between items-start mb-4">
          <StyledView>
            <StyledText className="text-3xl font-bold text-zinc-900 tracking-tight leading-none mb-1">{patient.nome}</StyledText>
            <StyledText className="text-zinc-500 font-medium text-sm">
              {calcAge(patient.dataNascimento)} anos • Leito {patient.leito || "-"} • Reg: {patient.registroHospitalar}
            </StyledText>
          </StyledView>
          {patient.saps3Atual != null && (
            <StyledView className="items-end">
              <StatusBadge label={`SAPS 3: ${patient.saps3Atual}`} status="warning" />
              {patient.mortalidadeEstimada != null && (
                <StyledText className="text-red-600 font-bold text-xs mt-1 bg-red-50 px-2 py-0.5 rounded-md">
                  Risco: {patient.mortalidadeEstimada.toFixed(1)}%
                </StyledText>
              )}
            </StyledView>
          )}
        </StyledView>

        <StyledView className="flex-row items-center gap-2 mb-4">
          {patient.leito && <StatusBadge label={`Leito ${patient.leito}`} status="neutral" />}
          <StatusBadge label={patient.setor || "UTI"} status="neutral" />
          {patient.alergias && <StatusBadge label={`ALERGIA: ${patient.alergias}`} status="critical" />}
        </StyledView>

        <StyledView className="flex-row bg-zinc-100 p-1 rounded-2xl">
          {(["EVOLUCAO", "VISAO_GERAL", "METAS"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl items-center justify-center ${tab === t ? "bg-white shadow-sm" : ""}`}
            >
              <StyledText className={`text-xs font-bold uppercase tracking-wide ${tab === t ? "text-zinc-900" : "text-zinc-400"}`}>
                {t === "EVOLUCAO" ? "Evolução" : t === "VISAO_GERAL" ? "Visão Geral" : "Metas"}
              </StyledText>
            </Pressable>
          ))}
        </StyledView>
      </StyledView>

      <StyledScrollView contentContainerClassName="p-6 gap-6" showsVerticalScrollIndicator={false}>
        {tab === "VISAO_GERAL" && (
          <Card className="p-6 rounded-3xl shadow-sm border-zinc-100 space-y-4" noPadding>
            <SectionTitle title="Informações Clínicas" />
            <KeyValueRow k="Data Nasc." v={formatDateBR(new Date(patient.dataNascimento))} />
            <KeyValueRow k="DIH" v={patient.dataInternacaoHospitalar ? formatDateBR(new Date(patient.dataInternacaoHospitalar)) : "-"} />
            <KeyValueRow k="DIUTI" v={patient.dataInternacaoUti ? formatDateBR(new Date(patient.dataInternacaoUti)) : "-"} />
            <KeyValueRow k="Previsão Alta" v={patient.previsaoAlta ? formatDateBR(new Date(patient.previsaoAlta)) : "-"} />
            <KeyValueRow k="Endereço" v="-" />

            <Divider className="my-2" />
            <SectionTitle title="Plano Atual (Último dia)" />
            <StyledText className="text-zinc-900 font-medium leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              {latestDay?.condutaDiaria || "Nenhuma conduta registrada."}
            </StyledText>
          </Card>
        )}

        {tab === "METAS" && (
          <Card className="p-6 rounded-3xl shadow-sm border-zinc-100 space-y-4" noPadding>
            <SectionTitle title="FAST HUG MAID" />
            {["Nutrição", "Sedação (RASS)", "Analgesia", "Cabeçeira Elevada", "Profilaxia TVP", "Profilaxia Úlcera", "Controle Glicêmico"].map((item, i) => (
              <View key={item} className="flex-row items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                <Text className="font-bold text-zinc-900">{item}</Text>
                <View className="flex-row gap-2">
                  <Button label="Não" variant="ghost" className="h-8 py-0 rounded-lg bg-zinc-50" onPress={() => { }} />
                  <Button label="Sim" variant="secondary" className="h-8 py-0 rounded-lg" onPress={() => { }} />
                </View>
              </View>
            ))}
            <Text className="text-zinc-400 text-xs text-center mt-4 font-medium uppercase tracking-wide">Checklist diário de segurança</Text>
          </Card>
        )}

        {tab === "EVOLUCAO" && selectedDay ? (
          <Card className="p-6 rounded-3xl shadow-sm border-zinc-100 space-y-6" noPadding>
            <StyledView className="flex-row items-center justify-between">
              <SectionTitle title={`Dia ${selectedDay.diaInternacaoUti} — ${formatISODate(selectedDay.data)}`} />
              <StyledView>
                {selectedDayIsRetro && !canEditSelectedDay && (
                  <Button label="Editar Retroativo" variant="destructive" onPress={() => setRetroOverrideDayId(selectedDay.id)} className="h-8 text-xs rounded-lg" />
                )}
              </StyledView>
            </StyledView>

            <StyledView className="flex-row gap-4">
              <Button label="Copiar Anterior" variant="secondary" onPress={copyPrevConduta} disabled={saving || !canEditSelectedDay} className="flex-1 rounded-xl h-12 bg-zinc-50" />
              <Button label="Calc. SAPS 3" variant="secondary" onPress={() => r.push("/saps3")} disabled={saving} className="flex-1 rounded-xl h-12 bg-zinc-50" />
            </StyledView>

            <StyledView className="flex-row gap-4 items-end">
              <Input
                containerClassName="flex-1"
                label="SAPS 3 (Score)"
                value={form.saps3}
                onChangeText={t => setForm(s => ({ ...s, saps3: t }))}
                placeholder="0"
                keyboardType="numeric"
                editable={canEditSelectedDay}
              />
            </StyledView>

            <Divider className="my-2" />
            <SectionTitle title="Diagnóstico (HD)" />
            <ChipsRow>
              <Button label="Texto Livre" variant={cidMode === "MANUAL" ? "primary" : "ghost"} onPress={() => setCidMode("MANUAL")} className="h-8 py-0 text-xs rounded-lg" />
              <Button label="Busca CID" variant={cidMode === "BUSCA" ? "primary" : "ghost"} onPress={() => setCidMode("BUSCA")} className="h-8 py-0 text-xs rounded-lg" />
            </ChipsRow>

            {cidMode === "MANUAL" ? (
              <Input
                label="Diagnóstico Principal"
                value={form.diagnosticoPrincipal}
                onChangeText={t => setForm(s => ({ ...s, diagnosticoPrincipal: t }))}
                placeholder="Choque séptico..."
                multiline
                editable={canEditSelectedDay}
              />
            ) : (
              <StyledView className="gap-2">
                <Input
                  label="Buscar CID"
                  value={cidQuery}
                  onChangeText={setCidQuery}
                  placeholder="Digite nome ou código..."
                />
                {cidResults.map(c => (
                  <Button
                    key={c.code}
                    label={`${c.code} - ${c.description}`}
                    variant="ghost"
                    onPress={() => {
                      setForm(s => ({ ...s, diagnosticoPrincipal: `${c.code} - ${c.description}` }));
                      setCidMode("MANUAL");
                      setCidQuery("");
                    }}
                    className="justify-start text-left h-auto py-2"
                  />
                ))}
              </StyledView>
            )}

            <Input
              label="Comorbidades / AP"
              value={form.comorbidades}
              onChangeText={t => setForm(s => ({ ...s, comorbidades: t }))}
              placeholder="HAS, DM2..."
              multiline
              editable={canEditSelectedDay}
            />

            <Divider className="my-2" />
            <SectionTitle title="Suporte e Evolução" />

            <StyledView className="flex-row gap-4">
              <Input containerClassName="flex-1" label="DVA" value={form.drogasVasoativasDescricao} onChangeText={t => setForm(s => ({ ...s, drogasVasoativasDescricao: t }))} placeholder="Noradrenalina..." editable={canEditSelectedDay} />
              <Input containerClassName="flex-1" label="Inotrópico" value={form.inotropicos} onChangeText={t => setForm(s => ({ ...s, inotropicos: t }))} placeholder="Dobutamina..." editable={canEditSelectedDay} />
            </StyledView>

            <Input label="Antibióticos (ATB)" value={form.antibioticos} onChangeText={t => setForm(s => ({ ...s, antibioticos: t }))} placeholder="Meropenem D3..." editable={canEditSelectedDay} />
            <Input label="Prévios (Histórico ATB)" value={form.previos} onChangeText={t => setForm(s => ({ ...s, previos: t }))} placeholder="Ceftriaxone (7d)..." multiline editable={canEditSelectedDay} />

            <Input label="Culturas" value={form.culturas} onChangeText={t => setForm(s => ({ ...s, culturas: t }))} placeholder="Hemocultura..." multiline editable={canEditSelectedDay} />

            <Input label="DUE (Diurese)" value={form.diurese} onChangeText={t => setForm(s => ({ ...s, diurese: t }))} placeholder="1500ml/24h..." editable={canEditSelectedDay} />

            <Input label="Dispositivos" value={form.dispositivos} onChangeText={t => setForm(s => ({ ...s, dispositivos: t }))} placeholder="CVC, SVD..." editable={canEditSelectedDay} />

            <Input label="Conduta Diária (CD)" value={form.condutaDiaria} onChangeText={t => setForm(s => ({ ...s, condutaDiaria: t }))} placeholder="Plano terapêutico..." multiline className="h-32 text-start p-4 bg-zinc-50 border-zinc-200" editable={canEditSelectedDay} />

            <Divider className="my-2" />
            <SectionTitle title="Áudio (Evolução Falada)" />
            <StyledView className="flex-row items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <StyledView className="flex-row items-center gap-4">
                <Pressable
                  onPress={recording ? stopRecording : startRecording}
                  className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
                    recording ? "bg-red-500 shadow-red-500/30" : "bg-black shadow-black/20"
                  }`}
                  disabled={audioBusy || (!canEditSelectedDay && !recording)}
                >
                  <StyledView className={`w-5 h-5 bg-white ${recording ? "rounded-sm" : "rounded-full"}`} />
                </Pressable>
                <StyledView>
                  <StyledText className="font-bold text-zinc-900 text-base">
                    {recording ? "Gravando..." : audioUri ? "Áudio Salvo" : "Gravar Evolução"}
                  </StyledText>
                  <StyledText className="text-zinc-500 text-xs">
                    {recording ? "Toque para parar" : audioUri ? "Toque para substituir" : "Toque para iniciar"}
                  </StyledText>
                </StyledView>
              </StyledView>

              {audioUri && !recording && (
                <StyledView className="flex-row gap-2">
                  <Button label={sound ? "Tocando..." : "Ouvir"} variant="secondary" onPress={() => playAudio(audioUri)} disabled={audioBusy} className="h-10 rounded-xl" />
                  <Button label="Excluir" variant="ghost" onPress={deleteAudio} disabled={audioBusy || !canEditSelectedDay} className="h-10 rounded-xl text-red-600" />
                </StyledView>
              )}
            </StyledView>

            <StyledView className="pt-6">
              <Button label={saving ? "Salvando..." : "Salvar Alterações"} onPress={() => saveDay(selectedDayIsRetro && canEditSelectedDay)} disabled={saving || (!canEditSelectedDay && !selectedDayIsRetro)} loading={saving} className="h-14 rounded-2xl shadow-md" />
              {selectedDayIsRetro && canEditSelectedDay && (
                <StyledText className="text-center text-xs text-red-700 mt-2 font-bold bg-red-50 p-2 rounded-lg self-center">⚠️ Editando dia retroativo (Override Ativo)</StyledText>
              )}
            </StyledView>
          </Card>
        ) : null}

        {days.length > 1 && tab === "EVOLUCAO" && (
          <StyledView className="mt-4 mb-8">
            <SectionTitle title="Histórico" />
            <StyledView className="gap-3 mt-2">
              {days.map(d => (
                <Button
                  key={d.id}
                  label={`Dia ${d.diaInternacaoUti} — ${formatISODate(d.data)}`}
                  variant={d.id === selectedDayId ? "primary" : "secondary"}
                  onPress={() => selectDay(d)}
                  className="justify-start h-12 rounded-xl bg-white border border-zinc-200 shadow-sm"
                />
              ))}
            </StyledView>
          </StyledView>
        )}
      </StyledScrollView>
    </Screen>
  );
}
