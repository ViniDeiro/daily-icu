import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, View, Alert, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { styled } from "nativewind";
import { api } from "../../lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSaps } from "../../stores/saps";
import { useAuth } from "../../stores/auth";
import { Audio } from "expo-av";
import * as SecureStore from "expo-secure-store";
import {
  Button,
  Card,
  ChipsRow,
  Divider,
  KeyValueRow,
  Screen,
  SectionTitle,
  FormField,
  Pill,
  TopBar,
  SegmentedControl
} from "../../components/ui";
import { calcAge, formatDateBR, formatISODate } from "../../lib/format";

const StyledView = styled(View);
const StyledText = styled(Text); // Assuming Text needs import or we use FormField mostly

// Types ... (Reuse existing types or import if shared)
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
  saps3Atual?: number;
  mortalidadeEstimada?: number;
  dataInternacaoUti?: string;
  dataInternacaoHospitalar?: string;
  previsaoAlta?: string;
  alergias?: string;
};

import { Text } from "react-native";

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
  const [tabIndex, setTabIndex] = useState(0); // 0: Evolução, 1: Visão Geral, 2: Metas

  const [form, setForm] = useState({
    saps3: "",
    condutaDiaria: "",
    diagnosticoPrincipal: "",
    peso: "",
    comorbidades: "",
    drogasVasoativasDescricao: "",
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

  useEffect(() => {
    if (token && id) loadPatient();
  }, [token, id]);

  useEffect(() => {
    if (sapsStore != null) {
      setForm((s) => ({ ...s, saps3: String(sapsStore) }));
    }
  }, [sapsStore]);

  const sapsResultRef = useRef<any>(null);
  const sapsStoreResult = useSaps(s => s.saps3Result);
  
  useEffect(() => {
      if (sapsStoreResult) {
          sapsResultRef.current = sapsStoreResult;
          setForm(s => ({ ...s, saps3: String(sapsStoreResult.scoreTotal) }));
          resetSaps();
      }
  }, [sapsStoreResult]);

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
        Alert.alert("Erro", "Erro ao carregar paciente");
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
      inotropicos: d.inotropicos || "",
      antibioticos: d.antibioticos || "",
      previos: d.previos || "",
      culturas: d.culturas || "",
      diurese: d.diurese || "",
      dispositivos: d.dispositivos || ""
    });
    checkAudio(d.id);
  }

  const selectedDay = days.find((d) => d.id === selectedDayId);
  const latestDay = days.length > 0 ? days[0] : null;
  const isLatest = selectedDay?.id === latestDay?.id;
  const selectedDayIsRetro = !isLatest;
  const canEditSelectedDay = isLatest || (selectedDayIsRetro && retroOverrideDayId === selectedDay?.id);

  // Audio functions (omitted detail for brevity, same as before)
  async function checkAudio(dayId: string) {
    setAudioUri(null);
    try {
      const available = await SecureStore.isAvailableAsync();
      if (available) {
        const uri = await SecureStore.getItemAsync(`audio:${dayId}`);
        if (uri) setAudioUri(uri);
      }
    } catch { }
  }
  async function startRecording() {
    try {
        if (permissionResponse?.status !== "granted") await requestPermission();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: r } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(r);
    } catch {}
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
        if (available) await SecureStore.setItemAsync(`audio:${selectedDayId}`, uri);
    }
    setAudioBusy(false);
  }
  async function playAudio(uri: string) {
    setAudioBusy(true);
    try {
        const { sound: s } = await Audio.Sound.createAsync({ uri });
        setSound(s);
        await s.playAsync();
        s.setOnPlaybackStatusUpdate(st => { if (s.isLoaded && st.didJustFinish) { setSound(undefined); setAudioBusy(false); }});
    } catch { setAudioBusy(false); }
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
        saps3: form.saps3 ? Number(form.saps3) : null,
        saps3Result: sapsResultRef.current
      });
      const d = await api.get(`/patients/${id}/days`);
      setDays(d.data);
      Alert.alert("Sucesso", "Dados salvos.");
      setRetroOverrideDayId(null);
    } catch {
      Alert.alert("Erro", "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function copyPrevConduta() {
    const idx = days.findIndex(d => d.id === selectedDayId);
    if (idx < days.length - 1) {
      const prev = days[idx + 1];
      setForm(s => ({ ...s, condutaDiaria: prev.condutaDiaria || "" }));
    }
  }

  if (loading || !patient) return <Screen className="bg-slate-50"><ActivityIndicator /></Screen>;

  return (
    <Screen className="bg-slate-50">
      <TopBar title={patient.nome.split(" ")[0]} subtitle={`Leito ${patient.leito || "-"} • Reg ${patient.registroHospitalar}`} back />
      
      <StyledView className="px-6 py-4">
        <Card noPadding className="p-4 mb-4 flex-row flex-wrap gap-2">
            <Pill label={`${calcAge(patient.dataNascimento)} Anos`} variant="neutral" />
            <Pill label={patient.setor || "UTI"} variant="neutral" />
            {patient.alergias && <Pill label={`Alergia: ${patient.alergias}`} variant="critical" />}
            {patient.saps3Atual != null && <Pill label={`SAPS: ${patient.saps3Atual}`} variant="warning" />}
            {patient.mortalidadeEstimada != null && <Pill label={`Risco: ${patient.mortalidadeEstimada.toFixed(1)}%`} variant="critical" />}
        </Card>

        <StyledView className="mb-3">
            <Pressable
              onPress={() => r.push(`/patients/handoff?patientId=${id}&patientName=${encodeURIComponent(patient.nome)}`)}
              className="bg-emerald-500 rounded-xl p-4 flex-row items-center justify-center gap-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <StyledText className="text-white text-base font-bold">📋 Passagem de Plantão</StyledText>
            </Pressable>
        </StyledView>

        <SegmentedControl 
            values={["Evolução", "Visão Geral", "Metas"]} 
            selectedIndex={tabIndex} 
            onChange={setTabIndex} 
        />
      </StyledView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerClassName="px-6 pb-12 gap-6" showsVerticalScrollIndicator={false}>
        
        {tabIndex === 1 && (
            <Card className="space-y-4" noPadding>
                <StyledView className="p-6">
                    <SectionTitle title="Dados Clínicos" />
                    <KeyValueRow k="Nascimento" v={formatDateBR(new Date(patient.dataNascimento))} />
                    <KeyValueRow k="Admissão Hosp" v={patient.dataInternacaoHospitalar ? formatDateBR(new Date(patient.dataInternacaoHospitalar)) : "-"} />
                    <KeyValueRow k="Admissão UTI" v={patient.dataInternacaoUti ? formatDateBR(new Date(patient.dataInternacaoUti)) : "-"} />
                    <KeyValueRow k="Previsão Alta" v={patient.previsaoAlta ? formatDateBR(new Date(patient.previsaoAlta)) : "-"} />
                </StyledView>
                <Divider />
                <StyledView className="p-6">
                    <SectionTitle title="Plano Terapêutico (Último)" />
                    <StyledText className="text-slate-700 leading-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {latestDay?.condutaDiaria || "Sem registro."}
                    </StyledText>
                </StyledView>
            </Card>
        )}

        {tabIndex === 2 && (
            <Card className="p-6 space-y-4" noPadding>
                <SectionTitle title="FAST HUG MAID" />
                {["Nutrição", "Sedação", "Analgesia", "Cabeceira Elevada", "Prof. TVP", "Prof. Úlcera", "Glicemia"].map(item => (
                    <StyledView key={item} className="flex-row justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <StyledText className="font-bold text-slate-700">{item}</StyledText>
                        <StyledView className="flex-row gap-2">
                            <Button label="Não" variant="ghost" className="h-8 py-0 bg-slate-50" />
                            <Button label="Sim" variant="secondary" className="h-8 py-0" />
                        </StyledView>
                    </StyledView>
                ))}
            </Card>
        )}

        {tabIndex === 0 && selectedDay && (
            <>
                <StyledView className="flex-row items-center justify-between">
                    <SectionTitle title={`Dia ${selectedDay.diaInternacaoUti} • ${formatISODate(selectedDay.data)}`} />
                    {selectedDayIsRetro && !canEditSelectedDay && (
                        <Button label="Editar Retroativo" variant="critical" onPress={() => setRetroOverrideDayId(selectedDay.id)} className="h-8 px-3 text-xs" />
                    )}
                </StyledView>

                {/* Actions */}
                <StyledView className="flex-row gap-3">
                    <Button label="Copiar Anterior" variant="secondary" onPress={copyPrevConduta} disabled={!canEditSelectedDay} className="flex-1 rounded-xl h-12" />
                    <Button label="Calc. SAPS 3" variant="secondary" onPress={() => r.push("/saps3")} disabled={saving} className="flex-1 rounded-xl h-12" />
                </StyledView>

                {/* Score */}
                <Card noPadding className="p-4 flex-row items-center justify-between">
                    <StyledText className="font-bold text-slate-500 uppercase text-xs">SAPS 3 Score</StyledText>
                    <FormField 
                        value={form.saps3} 
                        onChangeText={t => setForm(s => ({...s, saps3: t}))} 
                        keyboardType="numeric" 
                        placeholder="0" 
                        className="h-10 w-24 text-center border-slate-200" 
                        editable={canEditSelectedDay}
                    />
                </Card>

                {/* Diagnóstico */}
                <Card noPadding className="space-y-4">
                    <StyledView className="p-6 pb-4">
                        <StyledView className="flex-row justify-between items-center mb-4">
                            <SectionTitle title="Diagnóstico (HD)" />
                            <ChipsRow>
                                <Pressable onPress={() => setCidMode("MANUAL")}><Pill label="Manual" variant={cidMode === "MANUAL" ? "primary" : "neutral"} /></Pressable>
                                <Pressable onPress={() => setCidMode("BUSCA")}><Pill label="CID-10" variant={cidMode === "BUSCA" ? "primary" : "neutral"} /></Pressable>
                            </ChipsRow>
                        </StyledView>
                        
                        {cidMode === "MANUAL" ? (
                            <FormField multiline value={form.diagnosticoPrincipal} onChangeText={t => setForm(s => ({...s, diagnosticoPrincipal: t}))} placeholder="Descreva o diagnóstico..." editable={canEditSelectedDay} />
                        ) : (
                            <StyledView className="gap-2">
                                <FormField value={cidQuery} onChangeText={setCidQuery} placeholder="Buscar CID..." />
                                {cidResults.map(c => (
                                    <Button key={c.code} label={`${c.code} - ${c.description}`} variant="ghost" onPress={() => {
                                        setForm(s => ({...s, diagnosticoPrincipal: `${c.code} - ${c.description}`}));
                                        setCidMode("MANUAL");
                                    }} className="justify-start h-auto py-2" />
                                ))}
                            </StyledView>
                        )}
                        <StyledView className="mt-4">
                            <FormField label="Comorbidades" multiline value={form.comorbidades} onChangeText={t => setForm(s => ({...s, comorbidades: t}))} placeholder="HAS, DM, etc..." editable={canEditSelectedDay} />
                        </StyledView>
                    </StyledView>
                </Card>

                {/* Suporte */}
                <Card noPadding className="p-6 space-y-4">
                    <SectionTitle title="Suporte Hemodinâmico" />
                    <StyledView className="flex-row gap-4">
                        <FormField containerClassName="flex-1 min-w-0" label="DVA" value={form.drogasVasoativasDescricao} onChangeText={t => setForm(s => ({...s, drogasVasoativasDescricao: t}))} placeholder="Nora..." editable={canEditSelectedDay} />
                        <FormField containerClassName="flex-1 min-w-0" label="Inotrópico" value={form.inotropicos} onChangeText={t => setForm(s => ({...s, inotropicos: t}))} placeholder="Dobu..." editable={canEditSelectedDay} />
                    </StyledView>
                </Card>

                {/* Infecto */}
                <Card noPadding className="p-6 space-y-4">
                    <SectionTitle title="Infectologia" />
                    <FormField label="ATB Atual" value={form.antibioticos} onChangeText={t => setForm(s => ({...s, antibioticos: t}))} placeholder="Mero D3..." editable={canEditSelectedDay} />
                    <FormField label="ATB Prévios" value={form.previos} onChangeText={t => setForm(s => ({...s, previos: t}))} placeholder="Cefepime..." multiline editable={canEditSelectedDay} />
                    <FormField label="Culturas" value={form.culturas} onChangeText={t => setForm(s => ({...s, culturas: t}))} placeholder="Hemocultura pendente..." multiline editable={canEditSelectedDay} />
                </Card>

                {/* Balanço */}
                <Card noPadding className="p-6 space-y-4">
                    <SectionTitle title="Balanço & Dispositivos" />
                    <FormField label="Diurese/BH" value={form.diurese} onChangeText={t => setForm(s => ({...s, diurese: t}))} placeholder="1500ml..." editable={canEditSelectedDay} />
                    <FormField label="Dispositivos" value={form.dispositivos} onChangeText={t => setForm(s => ({...s, dispositivos: t}))} placeholder="CVC, SVD..." editable={canEditSelectedDay} />
                </Card>

                {/* Conduta */}
                <Card noPadding className="p-6 space-y-4">
                    <SectionTitle title="Conduta & Plano" />
                    <FormField value={form.condutaDiaria} onChangeText={t => setForm(s => ({...s, condutaDiaria: t}))} placeholder="Descreva o plano terapêutico..." multiline numberOfLines={6} className="min-h-[150px]" editable={canEditSelectedDay} />
                </Card>

                {/* Audio */}
                <Card noPadding className="p-4 flex-row items-center justify-between">
                    <StyledView className="flex-row items-center gap-3">
                        <Pressable onPress={recording ? stopRecording : startRecording} className={`w-12 h-12 rounded-full items-center justify-center ${recording ? "bg-red-500" : "bg-slate-900"}`} disabled={audioBusy || (!canEditSelectedDay && !recording)}>
                            <StyledView className={`w-4 h-4 bg-white ${recording ? "rounded-sm" : "rounded-full"}`} />
                        </Pressable>
                        <StyledView>
                            <StyledText className="font-bold text-slate-900">{recording ? "Gravando..." : audioUri ? "Áudio Gravado" : "Gravar Áudio"}</StyledText>
                            <StyledText className="text-[10px] text-slate-400 font-bold uppercase">{recording ? "Toque para parar" : "Toque para iniciar"}</StyledText>
                        </StyledView>
                    </StyledView>
                    {audioUri && !recording && (
                        <StyledView className="flex-row gap-2">
                            <Button label={sound ? "🔊" : "▶️"} variant="ghost" onPress={() => playAudio(audioUri)} disabled={audioBusy} className="h-10 w-10 px-0" />
                            <Button label="🗑️" variant="ghost" onPress={deleteAudio} disabled={audioBusy || !canEditSelectedDay} className="h-10 w-10 px-0 text-red-500" />
                        </StyledView>
                    )}
                </Card>

                <StyledView className="pb-8">
                    <Button label={saving ? "Salvando..." : "Salvar Alterações"} onPress={() => saveDay(selectedDayIsRetro && canEditSelectedDay)} disabled={saving || (!canEditSelectedDay && !selectedDayIsRetro)} loading={saving} className="h-14 rounded-2xl shadow-lg shadow-primary-900/20" />
                    {selectedDayIsRetro && canEditSelectedDay && <StyledText className="text-center text-xs text-red-600 font-bold mt-2">⚠️ Editando dia anterior</StyledText>}
                </StyledView>

                {/* History */}
                <StyledView>
                    <SectionTitle title="Histórico" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pb-4">
                        {days.map(d => (
                            <Button 
                                key={d.id} 
                                label={`Dia ${d.diaInternacaoUti}\n${formatISODate(d.data)}`} 
                                variant={d.id === selectedDayId ? "primary" : "secondary"} 
                                onPress={() => selectDay(d)} 
                                className="h-16 px-4 rounded-xl justify-center" 
                            />
                        ))}
                    </ScrollView>
                </StyledView>
            </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
