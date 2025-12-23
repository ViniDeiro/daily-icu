import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, useWindowDimensions, View } from "react-native";
import { api } from "../../lib/api";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useSaps } from "../../stores/saps";
import { useAuth } from "../../stores/auth";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import {
  AppHeader,
  Button,
  Card,
  ChipsRow,
  Divider,
  KeyValueRow,
  Screen,
  SectionTitle,
  Tag,
  calcAge,
  formatISODate,
  TextField,
  theme
} from "../../lib/ui";

type Day = {
  id: string;
  data: string;
  diaInternacaoUti: number;
  condutaDiaria: string | null;
  saps3?: number | null;
  diagnosticoPrincipal?: string | null;
  diagnosticosSecundarios?: string | null;
  comorbidades?: string | null;
  hda?: string | null;
  hpp?: string | null;
  muc?: string | null;
  neurologico?: string | null;
  respiratorio?: string | null;
  cardiovascular?: string | null;
  renal?: string | null;
  gastrointestinal?: string | null;
  infectologico?: string | null;
  exames?: string | null;
  drogasVasoativas?: boolean;
  drogasVasoativasDescricao?: string | null;
  ventilacaoMecanica?: boolean;
  viaAerea?: "IOT" | "TQT" | "NENHUMA";
  dispositivos?: string[];
};

type Patient = {
  id: string;
  nome: string;
  registroHospitalar: string;
  leito?: string | null;
  dataNascimento?: string | null;
  dataInternacaoHospitalar?: string | null;
  dataInternacaoUti?: string | null;
  previsaoAlta?: string | null;
  alergias?: string | null;
  setor?: string;
  baseClinica?: {
    diagnosticoPrincipal?: string | null;
    diagnosticosSecundarios?: string | null;
    comorbidades?: string | null;
    hda?: string | null;
    hpp?: string | null;
    muc?: string | null;
    saps3?: number | null;
    drogasVasoativas?: boolean;
    drogasVasoativasDescricao?: string | null;
    ventilacaoMecanica?: boolean;
    viaAerea?: "IOT" | "TQT" | "NENHUMA";
    dispositivos?: string[];
  } | null;
};

export default function PatientDaily() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const hospitalId = useAuth((s) => s.hospitalId);
  const sapsCalc = useSaps((s) => s.saps3);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [tab, setTab] = useState<"DIARISTA" | "EQUIPE">("DIARISTA");
  const [retroOverrideDayId, setRetroOverrideDayId] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const lastSavedKeyRef = useRef<string | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= 1024;

  const selectedDay = days.find((d) => d.id === selectedDayId) ?? (days.length ? days[0] : null);
  const latestDay = days[0] ?? null;
  const selectedDayIsRetro = useMemo(() => {
    if (!selectedDay) return false;
    return new Date(selectedDay.data).toDateString() !== new Date().toDateString();
  }, [selectedDay?.id, selectedDay?.data]);
  const canEditSelectedDay = Boolean(selectedDay && (!selectedDayIsRetro || retroOverrideDayId === selectedDay.id));
  const [form, setForm] = useState<{
    condutaDiaria: string;
    saps3: string;
    diagnosticoPrincipal: string;
    diagnosticosSecundarios: string;
    comorbidades: string;
    hda: string;
    hpp: string;
    muc: string;
    neurologico: string;
    respiratorio: string;
    cardiovascular: string;
    renal: string;
    gastrointestinal: string;
    infectologico: string;
    exames: string;
    drogasVasoativas: boolean;
    drogasVasoativasDescricao: string;
    ventilacaoMecanica: boolean;
    viaAerea: "IOT" | "TQT" | "NENHUMA";
    dispositivos: string;
  }>({
    condutaDiaria: "",
    saps3: "",
    diagnosticoPrincipal: "",
    diagnosticosSecundarios: "",
    comorbidades: "",
    hda: "",
    hpp: "",
    muc: "",
    neurologico: "",
    respiratorio: "",
    cardiovascular: "",
    renal: "",
    gastrointestinal: "",
    infectologico: "",
    exames: "",
    drogasVasoativas: false,
    drogasVasoativasDescricao: "",
    ventilacaoMecanica: false,
    viaAerea: "NENHUMA",
    dispositivos: ""
  });

  function loadFromDay(day: Day) {
    setForm({
      condutaDiaria: day.condutaDiaria ?? "",
      saps3: day.saps3 != null ? String(day.saps3) : "",
      diagnosticoPrincipal: day.diagnosticoPrincipal ?? "",
      diagnosticosSecundarios: day.diagnosticosSecundarios ?? "",
      comorbidades: day.comorbidades ?? "",
      hda: day.hda ?? "",
      hpp: day.hpp ?? "",
      muc: day.muc ?? "",
      neurologico: day.neurologico ?? "",
      respiratorio: day.respiratorio ?? "",
      cardiovascular: day.cardiovascular ?? "",
      renal: day.renal ?? "",
      gastrointestinal: day.gastrointestinal ?? "",
      infectologico: day.infectologico ?? "",
      exames: day.exames ?? "",
      drogasVasoativas: Boolean(day.drogasVasoativas),
      drogasVasoativasDescricao: day.drogasVasoativasDescricao ?? "",
      ventilacaoMecanica: Boolean(day.ventilacaoMecanica),
      viaAerea: (day.viaAerea as any) ?? "NENHUMA",
      dispositivos: Array.isArray(day.dispositivos) ? day.dispositivos.join(", ") : ""
    });
    lastSavedKeyRef.current = null;
    setAutosaveStatus("idle");
  }

  async function loadAudioUriForDay(dayId: string | null) {
    if (!dayId) {
      setAudioUri(null);
      return;
    }
    const available = await SecureStore.isAvailableAsync();
    const stored = available
      ? await SecureStore.getItemAsync(`audio:${dayId}`)
      : (globalThis as any).localStorage?.getItem(`audio:${dayId}`);
    setAudioUri(stored ?? null);
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [pRes, dRes] = await Promise.all([api.get(`/patients/${id}`), api.get(`/patients/${id}/days`)]);
      setPatient(pRes.data);
      const list: Day[] = dRes.data;
      setDays(list);
      const day = list[0] ?? null;
      if (day) {
        setSelectedDayId(day.id);
        loadFromDay(day);
        await loadAudioUriForDay(day.id);
      }
    } catch {
      setError("Não foi possível carregar o paciente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hydrated || !token || !hospitalId || !id) return;
    loadAll();
  }, [hydrated, token, hospitalId, id]);

  useEffect(() => {
    if (!hydrated || !token || !hospitalId || !id) return;
    if (selectedDay) loadFromDay(selectedDay);
    setRetroOverrideDayId(null);
    loadAudioUriForDay(selectedDay?.id ?? null);
  }, [hydrated, token, hospitalId, id, selectedDayId]);

  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      setSound((s) => {
        if (s) s.unloadAsync();
        return null;
      });
      setRecording((rec) => {
        if (rec) rec.stopAndUnloadAsync();
        return null;
      });
    };
  }, []);

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
  if (!id) return <Redirect href="/patients" />;

  async function createToday() {
    setSaving(true);
    setError(null);
    try {
      await api.post(`/patients/${id}/days`, { data: new Date().toISOString(), condutaDiaria: "" });
      await loadAll();
    } catch {
      setError("Não foi possível criar o dia de hoje.");
    } finally {
      setSaving(false);
    }
  }

  async function copyPrevConduta() {
    if (!selectedDay) return;
    try {
      const res = await api.post(`/patients/${id}/days/${selectedDay.id}/copy-conduta`);
      setForm((s) => ({ ...s, condutaDiaria: res.data.conduta || "" }));
    } catch {
      setError("Falha ao copiar conduta anterior.");
    }
  }

  async function saveDay(override: boolean, opts?: { silent?: boolean }) {
    if (!selectedDay) return;
    setSaving(true);
    if (!opts?.silent) setError(null);
    const dispositivos = form.dispositivos
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const saps3 = form.saps3.trim() ? Number(form.saps3) : null;
    try {
      const q = override ? "?override=true" : "";
      const res = await api.put(`/patients/${id}/days/${selectedDay.id}${q}`, {
        condutaDiaria: form.condutaDiaria,
        saps3: saps3 == null || Number.isNaN(saps3) ? null : saps3,
        diagnosticoPrincipal: form.diagnosticoPrincipal,
        diagnosticosSecundarios: form.diagnosticosSecundarios,
        comorbidades: form.comorbidades,
        hda: form.hda || null,
        hpp: form.hpp || null,
        muc: form.muc || null,
        neurologico: form.neurologico || null,
        respiratorio: form.respiratorio || null,
        cardiovascular: form.cardiovascular || null,
        renal: form.renal || null,
        gastrointestinal: form.gastrointestinal || null,
        infectologico: form.infectologico || null,
        exames: form.exames || null,
        drogasVasoativas: form.drogasVasoativas,
        drogasVasoativasDescricao: form.drogasVasoativasDescricao || null,
        ventilacaoMecanica: form.ventilacaoMecanica,
        viaAerea: form.viaAerea,
        dispositivos
      });
      setDays((prev) => prev.map((d) => (d.id === selectedDay.id ? { ...d, ...res.data } : d)));
      setAutosaveStatus("saved");
    } catch (e: any) {
      const status = e?.response?.status;
      if (!opts?.silent) {
        if (status === 409) setError("Edição retroativa bloqueada. Use “Salvar (override)” se necessário.");
        else setError("Não foi possível salvar.");
      }
      setAutosaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!selectedDay) return;
    if (tab !== "DIARISTA") return;
    if (saving || loading) return;
    if (selectedDayIsRetro) return;
    if (!canEditSelectedDay) return;

    const dispositivos = form.dispositivos
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const saps3 = form.saps3.trim() ? Number(form.saps3) : null;
    const key = JSON.stringify({
      dayId: selectedDay.id,
      condutaDiaria: form.condutaDiaria,
      saps3: saps3 == null || Number.isNaN(saps3) ? null : saps3,
      diagnosticoPrincipal: form.diagnosticoPrincipal,
      diagnosticosSecundarios: form.diagnosticosSecundarios,
      comorbidades: form.comorbidades,
      hda: form.hda,
      hpp: form.hpp,
      muc: form.muc,
      neurologico: form.neurologico,
      respiratorio: form.respiratorio,
      cardiovascular: form.cardiovascular,
      renal: form.renal,
      gastrointestinal: form.gastrointestinal,
      infectologico: form.infectologico,
      exames: form.exames,
      drogasVasoativas: form.drogasVasoativas,
      drogasVasoativasDescricao: form.drogasVasoativasDescricao,
      ventilacaoMecanica: form.ventilacaoMecanica,
      viaAerea: form.viaAerea,
      dispositivos
    });
    if (lastSavedKeyRef.current === key) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      setAutosaveStatus("saving");
      await saveDay(false, { silent: true });
      lastSavedKeyRef.current = key;
    }, 700);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    tab,
    selectedDay?.id,
    selectedDayIsRetro,
    canEditSelectedDay,
    form,
    saving,
    loading
  ]);

  function calcDaysSince(iso: string | null | undefined) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    return Math.max(0, Math.floor(diffMs / 86_400_000));
  }

  async function ensureAudioPermissions() {
    const perm = await Audio.requestPermissionsAsync();
    return perm.granted;
  }

  async function startRecording() {
    if (!selectedDay) return;
    if (!canEditSelectedDay) return;
    setAudioBusy(true);
    try {
      const ok = await ensureAudioPermissions();
      if (!ok) {
        setError("Permissão de microfone negada.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch {
      setError("Falha ao iniciar gravação.");
    } finally {
      setAudioBusy(false);
    }
  }

  async function stopRecording() {
    if (!selectedDay) return;
    if (!recording) return;
    setAudioBusy(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) return;
      const target = `${FileSystem.documentDirectory ?? ""}audio-${selectedDay.id}.m4a`;
      await FileSystem.deleteAsync(target, { idempotent: true });
      await FileSystem.moveAsync({ from: uri, to: target });
      const available = await SecureStore.isAvailableAsync();
      if (available) await SecureStore.setItemAsync(`audio:${selectedDay.id}`, target);
      else (globalThis as any).localStorage?.setItem(`audio:${selectedDay.id}`, target);
      setAudioUri(target);
    } catch {
      setError("Falha ao finalizar gravação.");
    } finally {
      setAudioBusy(false);
    }
  }

  async function playAudio(uri: string) {
    setAudioBusy(true);
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      const created = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      setSound(created.sound);
      created.sound.setOnPlaybackStatusUpdate((st) => {
        if ((st as any)?.didJustFinish) {
          created.sound.unloadAsync();
          setSound(null);
        }
      });
    } catch {
      setError("Falha ao reproduzir áudio.");
    } finally {
      setAudioBusy(false);
    }
  }

  async function stopAudio() {
    if (!sound) return;
    setAudioBusy(true);
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    } finally {
      setAudioBusy(false);
    }
  }

  async function deleteAudio() {
    if (!selectedDay) return;
    setAudioBusy(true);
    try {
      const available = await SecureStore.isAvailableAsync();
      const key = `audio:${selectedDay.id}`;
      const stored = available ? await SecureStore.getItemAsync(key) : (globalThis as any).localStorage?.getItem(key);
      if (stored) {
        await FileSystem.deleteAsync(stored, { idempotent: true });
      }
      if (available) await SecureStore.deleteItemAsync(key);
      else (globalThis as any).localStorage?.removeItem(key);
      setAudioUri(null);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    } catch {
      setError("Falha ao remover áudio.");
    } finally {
      setAudioBusy(false);
    }
  }

  return (
    <Screen scroll contentStyle={{ maxWidth: isWide ? 1180 : 980, width: "100%", alignSelf: "center" }}>
      <AppHeader
        title="Paciente"
        subtitle={patient ? `${patient.nome} • Reg. ${patient.registroHospitalar}` : "Carregando…"}
        right={<Button label="Voltar" tone="neutral" onPress={() => r.back()} />}
      />

      {loading ? (
        <Card>
          <Text style={{ color: theme.colors.muted }}>Carregando…</Text>
        </Card>
      ) : error ? (
        <Card>
          <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{error}</Text>
          <View style={{ height: theme.space.md }} />
          <Button label="Tentar novamente" onPress={loadAll} />
        </Card>
      ) : (
        <>
          <View
            style={
              isWide
                ? { flexDirection: "row", alignItems: "flex-start", gap: theme.space.md }
                : { gap: theme.space.md }
            }
          >
            <View style={isWide ? { width: 360, flexShrink: 0, gap: theme.space.md } : { gap: theme.space.md }}>
              {patient ? (
                <Card style={{ gap: theme.space.md }}>
                  <SectionTitle title="Resumo" />
                  <ChipsRow>
                    {calcAge(patient.dataNascimento) != null ? <Tag label={`${calcAge(patient.dataNascimento)} anos`} /> : <Tag label="Idade -" />}
                    {patient.leito ? <Tag label={`Leito ${patient.leito}`} /> : <Tag label="Leito -" />}
                    <Tag label={`DIUTI: ${formatISODate(patient.dataInternacaoUti ?? null)}`} />
                    <Tag label={`DIH: ${formatISODate(patient.dataInternacaoHospitalar ?? null)}`} />
                    {patient.previsaoAlta ? <Tag label={`Previsão alta: ${formatISODate(patient.previsaoAlta)}`} tone="success" /> : null}
                    {patient.alergias ? <Tag label={`Alergias: ${patient.alergias}`} tone="warning" /> : null}
                    {patient.setor ? <Tag label={patient.setor} tone="primary" /> : null}
                  </ChipsRow>
                  <Divider />
                  <KeyValueRow k="Dias no diário" v={String(days.length)} />
                  {!days.length ? <Button label="Criar dia de hoje" onPress={createToday} loading={saving} /> : null}
                </Card>
              ) : null}

              <Card style={{ gap: theme.space.md }}>
                <SectionTitle title="Abas" />
                <ChipsRow>
                  <Button label="Diarista" tone={tab === "DIARISTA" ? "primary" : "neutral"} onPress={() => setTab("DIARISTA")} />
                  <Button label="Equipe" tone={tab === "EQUIPE" ? "primary" : "neutral"} onPress={() => setTab("EQUIPE")} />
                  {tab === "DIARISTA" ? (
                    <Tag
                      label={
                        autosaveStatus === "saving"
                          ? "Salvando…"
                          : autosaveStatus === "saved"
                            ? "Salvo"
                            : autosaveStatus === "error"
                              ? "Falha ao salvar"
                              : "Autosave"
                      }
                      tone={autosaveStatus === "error" ? "danger" : autosaveStatus === "saved" ? "success" : "default"}
                    />
                  ) : null}
                </ChipsRow>
              </Card>

              <Card style={{ gap: theme.space.md }}>
                <SectionTitle title="Dias" right={<Button label="Novo dia" tone="neutral" onPress={createToday} disabled={saving} />} />
                <ChipsRow>
                  {days.map((d) => {
                    const selected = (selectedDay?.id ?? null) === d.id;
                    return (
                      <View key={d.id}>
                        <Button
                          label={`${formatISODate(d.data)} • D${d.diaInternacaoUti}`}
                          tone={selected ? "primary" : "neutral"}
                          onPress={() => setSelectedDayId(d.id)}
                        />
                      </View>
                    );
                  })}
                </ChipsRow>
              </Card>
            </View>

            <View style={isWide ? { flex: 1, minWidth: 0 } : null}>
              {tab === "EQUIPE" ? (
            <Card style={{ gap: theme.space.md }}>
              <SectionTitle title="Passagem de plantão (Equipe)" />
              <Text style={{ color: theme.colors.subtle }}>
                Aba somente leitura: exibe sempre a informação mais recente registrada no Diário.
              </Text>

              <Divider />
              <SectionTitle title="Identificação" />
              <KeyValueRow k="Nome" v={patient?.nome ?? "-"} />
              <KeyValueRow k="Leito" v={patient?.leito ?? "-"} />
              <KeyValueRow k="Idade" v={calcAge(patient?.dataNascimento) != null ? `${calcAge(patient?.dataNascimento)} anos` : "-"} />
              <KeyValueRow k="Data" v={formatISODate(new Date().toISOString())} />
              <KeyValueRow
                k="DIH"
                v={
                  patient?.dataInternacaoHospitalar
                    ? `${formatISODate(patient.dataInternacaoHospitalar)} • D${calcDaysSince(patient.dataInternacaoHospitalar) ?? "-"}`
                    : "-"
                }
              />
              <KeyValueRow
                k="D.UTI"
                v={patient?.dataInternacaoUti ? `${formatISODate(patient.dataInternacaoUti)} • D${calcDaysSince(patient.dataInternacaoUti) ?? "-"}` : "-"}
              />
              <KeyValueRow k="Previsão de alta" v={formatISODate(patient?.previsaoAlta ?? null)} />
              <KeyValueRow k="Alergias" v={patient?.alergias ?? "-"} />

              <Divider />
              <SectionTitle title="Histórico clínico" />
              <TextField
                label="HDA"
                value={(latestDay?.hda ?? patient?.baseClinica?.hda ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="HPP"
                value={(latestDay?.hpp ?? patient?.baseClinica?.hpp ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="MUC"
                value={(latestDay?.muc ?? patient?.baseClinica?.muc ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Diagnóstico principal"
                value={(latestDay?.diagnosticoPrincipal ?? patient?.baseClinica?.diagnosticoPrincipal ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Diagnósticos secundários"
                value={(latestDay?.diagnosticosSecundarios ?? patient?.baseClinica?.diagnosticosSecundarios ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Comorbidades"
                value={(latestDay?.comorbidades ?? patient?.baseClinica?.comorbidades ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <KeyValueRow
                k="SAPS 3"
                v={
                  latestDay?.saps3 != null
                    ? String(latestDay.saps3)
                    : patient?.baseClinica?.saps3 != null
                      ? String(patient.baseClinica.saps3)
                      : "-"
                }
              />

              <Divider />
              <SectionTitle title="Análise por sistemas" />
              <TextField
                label="Neurológico"
                value={(latestDay?.neurologico ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Respiratório"
                value={(latestDay?.respiratorio ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Cardiovascular"
                value={(latestDay?.cardiovascular ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Renal"
                value={(latestDay?.renal ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Gastrointestinal"
                value={(latestDay?.gastrointestinal ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Infectológico"
                value={(latestDay?.infectologico ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />
              <TextField
                label="Exames"
                value={(latestDay?.exames ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />

              <Divider />
              <SectionTitle title="Suportes" />
              <KeyValueRow
                k="Ventilação mecânica"
                v={
                  latestDay?.ventilacaoMecanica != null
                    ? latestDay.ventilacaoMecanica
                      ? "Sim"
                      : "Não"
                    : patient?.baseClinica?.ventilacaoMecanica != null
                      ? patient.baseClinica.ventilacaoMecanica
                        ? "Sim"
                        : "Não"
                      : "-"
                }
              />
              <KeyValueRow
                k="Drogas vasoativas"
                v={
                  latestDay?.drogasVasoativas != null
                    ? latestDay.drogasVasoativas
                      ? `Sim${latestDay.drogasVasoativasDescricao ? ` (${latestDay.drogasVasoativasDescricao})` : ""}`
                      : "Não"
                    : patient?.baseClinica?.drogasVasoativas != null
                      ? patient.baseClinica.drogasVasoativas
                        ? `Sim${patient.baseClinica.drogasVasoativasDescricao ? ` (${patient.baseClinica.drogasVasoativasDescricao})` : ""}`
                        : "Não"
                      : "-"
                }
              />
              <KeyValueRow
                k="Via aérea"
                v={
                  (latestDay?.viaAerea ??
                    patient?.baseClinica?.viaAerea ??
                    "-") as string
                }
              />
              <KeyValueRow
                k="Dispositivos"
                v={
                  (latestDay?.dispositivos?.length
                    ? latestDay.dispositivos.join(", ")
                    : patient?.baseClinica?.dispositivos?.length
                      ? patient.baseClinica.dispositivos.join(", ")
                      : "-") as string
                }
              />

              <Divider />
              <SectionTitle title="Plano atual" />
              <TextField
                label="Última conduta"
                value={(latestDay?.condutaDiaria ?? "-") as string}
                onChangeText={() => {}}
                multiline
                editable={false}
              />

              <Divider />
              <SectionTitle title="Áudio do cliente" />
              <Text style={{ color: theme.colors.subtle }}>Disponível apenas no dispositivo onde foi gravado.</Text>
              {latestDay ? (
                <View style={{ flexDirection: "row", gap: theme.space.sm }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Ouvir"
                      tone="neutral"
                      onPress={async () => {
                        const available = await SecureStore.isAvailableAsync();
                        const stored = available
                          ? await SecureStore.getItemAsync(`audio:${latestDay.id}`)
                          : (globalThis as any).localStorage?.getItem(`audio:${latestDay.id}`);
                        if (stored) await playAudio(stored);
                        else setError("Sem áudio para o último dia.");
                      }}
                      disabled={audioBusy}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Parar" tone="neutral" onPress={stopAudio} disabled={audioBusy || !sound} />
                  </View>
                </View>
              ) : (
                <Text style={{ color: theme.colors.muted }}>Sem dia registrado ainda.</Text>
              )}
            </Card>
              ) : selectedDay ? (
            <Card style={{ gap: theme.space.md }}>
              <SectionTitle title={`Evolução — ${formatISODate(selectedDay.data)}`} />
              <Text style={{ color: theme.colors.subtle }}>
                Dia {selectedDay.diaInternacaoUti} • Use “Salvar (override)” somente se precisar editar retroativo.
              </Text>

              <View style={{ flexDirection: "row", gap: theme.space.sm }}>
                <View style={{ flex: 1 }}>
                  <Button label="Copiar conduta anterior" tone="neutral" onPress={copyPrevConduta} disabled={saving} />
                </View>
                <View style={{ width: 140 }}>
                  <Button label="SAPS 3" tone="neutral" onPress={() => r.push("/saps3")} disabled={saving} />
                </View>
              </View>

              {selectedDayIsRetro && !canEditSelectedDay ? (
                <>
                  <Tag label="Dia anterior (somente leitura)" tone="warning" />
                  <Button label="Editar retroativo" tone="danger" onPress={() => setRetroOverrideDayId(selectedDay.id)} disabled={saving} />
                </>
              ) : null}

              <View style={{ flexDirection: "row", gap: theme.space.sm, alignItems: "flex-end" }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="SAPS 3"
                    value={form.saps3}
                    onChangeText={(t) => setForm((s) => ({ ...s, saps3: t }))}
                    placeholder="Ex.: 78"
                    keyboardType="numeric"
                    editable={canEditSelectedDay}
                  />
                </View>
                <View style={{ width: 160 }}>
                  <Button
                    label={sapsCalc != null ? `Usar ${sapsCalc}` : "Usar calc."}
                    tone="neutral"
                    onPress={() => setForm((s) => ({ ...s, saps3: sapsCalc != null ? String(sapsCalc) : s.saps3 }))}
                    disabled={saving || sapsCalc == null || !canEditSelectedDay}
                  />
                </View>
              </View>

              <TextField
                label="Diagnóstico principal (HD)"
                value={form.diagnosticoPrincipal}
                onChangeText={(t) => setForm((s) => ({ ...s, diagnosticoPrincipal: t }))}
                placeholder="Ex.: Choque séptico foco pulmonar"
                editable={canEditSelectedDay}
              />

              <TextField
                label="Diagnósticos secundários"
                value={form.diagnosticosSecundarios}
                onChangeText={(t) => setForm((s) => ({ ...s, diagnosticosSecundarios: t }))}
                placeholder="Ex.: IRA KDIGO III; Pneumonia aspirativa…"
                multiline
                editable={canEditSelectedDay}
              />

              <TextField
                label="Comorbidades / AP"
                value={form.comorbidades}
                onChangeText={(t) => setForm((s) => ({ ...s, comorbidades: t }))}
                placeholder="Ex.: Parkinson; HAS…"
                multiline
                editable={canEditSelectedDay}
              />

              <SectionTitle title="Histórico clínico" />
              <TextField
                label="HDA"
                value={form.hda}
                onChangeText={(t) => setForm((s) => ({ ...s, hda: t }))}
                placeholder="História da doença atual"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="HPP"
                value={form.hpp}
                onChangeText={(t) => setForm((s) => ({ ...s, hpp: t }))}
                placeholder="História patológica pregressa"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="MUC"
                value={form.muc}
                onChangeText={(t) => setForm((s) => ({ ...s, muc: t }))}
                placeholder="Notas relevantes"
                multiline
                editable={canEditSelectedDay}
              />

              <SectionTitle title="Análise por sistemas" />
              <TextField
                label="Neurológico"
                value={form.neurologico}
                onChangeText={(t) => setForm((s) => ({ ...s, neurologico: t }))}
                placeholder="Resumo do sistema neurológico"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="Respiratório"
                value={form.respiratorio}
                onChangeText={(t) => setForm((s) => ({ ...s, respiratorio: t }))}
                placeholder="Resumo do sistema respiratório"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="Cardiovascular"
                value={form.cardiovascular}
                onChangeText={(t) => setForm((s) => ({ ...s, cardiovascular: t }))}
                placeholder="Resumo do sistema cardiovascular"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="Renal"
                value={form.renal}
                onChangeText={(t) => setForm((s) => ({ ...s, renal: t }))}
                placeholder="Resumo do sistema renal"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="Gastrointestinal"
                value={form.gastrointestinal}
                onChangeText={(t) => setForm((s) => ({ ...s, gastrointestinal: t }))}
                placeholder="Resumo do sistema gastrointestinal"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="Infectológico"
                value={form.infectologico}
                onChangeText={(t) => setForm((s) => ({ ...s, infectologico: t }))}
                placeholder="Resumo do sistema infectológico"
                multiline
                editable={canEditSelectedDay}
              />
              <TextField
                label="Exames"
                value={form.exames}
                onChangeText={(t) => setForm((s) => ({ ...s, exames: t }))}
                placeholder="Exames relevantes do dia"
                multiline
                editable={canEditSelectedDay}
              />

              <SectionTitle title="Suporte" />
              <ChipsRow>
                <Button
                  label={form.drogasVasoativas ? "DVA: Sim" : "DVA: Não"}
                  tone={form.drogasVasoativas ? "primary" : "neutral"}
                  onPress={() => setForm((s) => ({ ...s, drogasVasoativas: !s.drogasVasoativas }))}
                  disabled={saving || !canEditSelectedDay}
                />
                <Button
                  label={form.ventilacaoMecanica ? "VM: Sim" : "VM: Não"}
                  tone={form.ventilacaoMecanica ? "primary" : "neutral"}
                  onPress={() => setForm((s) => ({ ...s, ventilacaoMecanica: !s.ventilacaoMecanica }))}
                  disabled={saving || !canEditSelectedDay}
                />
              </ChipsRow>
              {form.drogasVasoativas ? (
                <TextField
                  label="DVA (descrição)"
                  value={form.drogasVasoativasDescricao}
                  onChangeText={(t) => setForm((s) => ({ ...s, drogasVasoativasDescricao: t }))}
                  placeholder="Ex.: Noradrenalina"
                  editable={canEditSelectedDay}
                />
              ) : null}

              <SectionTitle title="Via aérea" />
              <ChipsRow>
                {(["NENHUMA", "IOT", "TQT"] as const).map((v) => (
                  <Button
                    key={v}
                    label={v}
                    tone={form.viaAerea === v ? "primary" : "neutral"}
                    onPress={() => setForm((s) => ({ ...s, viaAerea: v }))}
                    disabled={saving || !canEditSelectedDay}
                  />
                ))}
              </ChipsRow>

              <TextField
                label="Dispositivos (separados por vírgula)"
                value={form.dispositivos}
                onChangeText={(t) => setForm((s) => ({ ...s, dispositivos: t }))}
                placeholder="Ex.: CVC VSCD, SVD, SNE"
                editable={canEditSelectedDay}
              />

              <TextField
                label="Conduta diária (CD)"
                value={form.condutaDiaria}
                onChangeText={(t) => setForm((s) => ({ ...s, condutaDiaria: t }))}
                placeholder="Plano do dia, medidas, pendências…"
                multiline
                editable={canEditSelectedDay}
              />

              <SectionTitle title="Áudio do cliente" />
              <ChipsRow>
                {recording ? (
                  <Button label="Parar gravação" tone="danger" onPress={stopRecording} disabled={audioBusy || saving} />
                ) : (
                  <Button label="Gravar" tone="neutral" onPress={startRecording} disabled={audioBusy || saving || !canEditSelectedDay} />
                )}
                {audioUri ? (
                  <>
                    <Button label={sound ? "Tocando…" : "Ouvir"} tone="neutral" onPress={() => playAudio(audioUri)} disabled={audioBusy} />
                    <Button label="Parar" tone="neutral" onPress={stopAudio} disabled={audioBusy || !sound} />
                    <Button label="Remover" tone="danger" onPress={deleteAudio} disabled={audioBusy || saving || !canEditSelectedDay} />
                  </>
                ) : (
                  <Tag label="Sem áudio" />
                )}
              </ChipsRow>

              {error ? <Text style={{ color: theme.colors.danger, fontWeight: "800" }}>{error}</Text> : null}

              <View style={{ flexDirection: "row", gap: theme.space.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Salvar"
                    onPress={() => saveDay(false)}
                    loading={saving}
                    disabled={!canEditSelectedDay || selectedDayIsRetro}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Salvar (override)" tone="danger" onPress={() => saveDay(true)} loading={saving} />
                </View>
              </View>
            </Card>
              ) : null}
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}
