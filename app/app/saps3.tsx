import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { Redirect, useRouter } from "expo-router";
import { useSaps } from "../stores/saps";
import { useAuth } from "../stores/auth";
import { Button, Card, Input, Screen, KeyValueRow, ChipsRow, Divider } from "../components/ui";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

function Chip(props: { label: string; active: boolean; onPress: () => void; tone?: "default" | "warning" }) {
  const base = "px-4 py-2 rounded-full border border-transparent shadow-sm";
  const activeClass = props.tone === 'warning' ? "bg-amber-100 border-amber-300" : "bg-primary-100 border-primary-300";
  const inactiveClass = "bg-white border-zinc-200";
  const textBase = "text-xs font-bold uppercase tracking-wide";
  const textActive = props.tone === 'warning' ? "text-amber-700" : "text-primary-700";
  const textInactive = "text-zinc-600";

  return (
    <StyledPressable
      onPress={props.onPress}
      className={`${base} ${props.active ? activeClass : inactiveClass}`}
    >
      <StyledText className={`${textBase} ${props.active ? textActive : textInactive}`}>{props.label}</StyledText>
    </StyledPressable>
  );
}

export default function Saps3() {
  const r = useRouter();
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);
  const [tab, setTab] = useState<"BASICO" | "COMORB" | "FISIO" | "MOTIVO">("BASICO");

  // State definitions
  const [idade, setIdade] = useState("");
  const [losHospital, setLosHospital] = useState("");
  const [locPreIcu, setLocPreIcu] = useState<"NA" | "ER" | "OTHER_ICU" | "WARD">("NA");
  const [vasoPreIcu, setVasoPreIcu] = useState(false);
  const [planned, setPlanned] = useState<"NA" | "PLANNED" | "UNPLANNED">("NA");
  const [surgical, setSurgical] = useState<"NA" | "SCHEDULED" | "NO_SURGERY" | "EMERGENCY">("NA");
  const [infection, setInfection] = useState<"NA" | "NONE" | "NOSOCOMIAL" | "RESPIRATORY">("NA");

  const [cancerTherapy, setCancerTherapy] = useState(false);
  const [chronicHf, setChronicHf] = useState(false);
  const [hematologicCancer, setHematologicCancer] = useState(false);
  const [cirrhosis, setCirrhosis] = useState(false);
  const [aids, setAids] = useState(false);
  const [metastaticCancer, setMetastaticCancer] = useState(false);

  const [gcs, setGcs] = useState("");
  const [bilirubin, setBilirubin] = useState("");
  const [tempC, setTempC] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [hr, setHr] = useState("");
  const [leukocytes, setLeukocytes] = useState("");
  const [ph, setPh] = useState("");
  const [platelets, setPlatelets] = useState("");
  const [sbp, setSbp] = useState("");
  const [mv, setMv] = useState<"NA" | "NO" | "YES">("NA");
  const [pao2, setPao2] = useState("");
  const [fio2, setFio2] = useState("");

  const [admissionReason, setAdmissionReason] = useState<
    | "NONE"
    | "CARDIO_RHYTHM_DISTURB"
    | "NEURO_SEIZURES"
    | "HYPOVOLEMIC_SHOCK"
    | "SEPTIC_SHOCK"
    | "ANAPHYL_MIXED_SHOCK"
    | "NEURO_COMA_DELIRIUM"
    | "NEURO_FOCAL_DEFICIT"
    | "NEURO_MASS_EFFECT"
    | "DIGESTIVE_ACUTE_ABDOMEN"
    | "DIGESTIVE_SEVERE_PANCREATITIS"
    | "HEPATIC_LIVER_FAILURE"
  >("NONE");

  const [resultado, setResultado] = useState<number | null>(null);
  const [mortalidade, setMortalidade] = useState<number | null>(null);
  const setSaps3 = useSaps((s) => s.setSaps3);

  if (!hydrated) {
    return (
      <Screen className="justify-center items-center">
        <ActivityIndicator color="black" />
      </Screen>
    );
  }
  if (!token) return <Redirect href="/(auth)/login" />;

  function toNum(v: string) {
    const n = Number(String(v).replace(",", ".").trim());
    return Number.isFinite(n) ? n : null;
  }

  function normFiO2(v: string) {
    const n = toNum(v);
    if (n == null) return null;
    if (n <= 0) return null;
    if (n > 1) return n / 100;
    return n;
  }

  function saps3Score() {
    let points = 0;

    const age = toNum(idade);
    if (age != null) {
      if (age < 40) points += 0;
      else if (age <= 59) points += 5;
      else if (age <= 69) points += 9;
      else if (age <= 74) points += 13;
      else if (age <= 79) points += 15;
      else points += 18;
    }

    const los = toNum(losHospital);
    if (los != null) {
      if (los < 1) points += 0;
      else if (los <= 13) points += 4;
      else if (los <= 27) points += 6;
      else points += 7;
    }

    if (locPreIcu === "ER") points += 5;
    if (locPreIcu === "OTHER_ICU") points += 7;
    if (locPreIcu === "WARD") points += 8;

    if (vasoPreIcu) points += 3;

    if (planned === "UNPLANNED") points += 3;

    if (surgical === "NO_SURGERY") points += 5;
    if (surgical === "EMERGENCY") points += 6;

    if (infection === "NOSOCOMIAL") points += 4;
    if (infection === "RESPIRATORY") points += 5;

    if (cancerTherapy) points += 3;
    if (chronicHf) points += 6;
    if (hematologicCancer) points += 6;
    if (cirrhosis) points += 8;
    if (aids) points += 8;
    if (metastaticCancer) points += 11;

    const gcsN = toNum(gcs);
    if (gcsN != null) {
      if (gcsN >= 13) points += 0;
      else if (gcsN >= 7) points += 2;
      else if (gcsN >= 5) points += 7;
      else points += 15;
    }

    const bili = toNum(bilirubin);
    if (bili != null) {
      if (bili < 2) points += 0;
      else if (bili < 6) points += 4;
      else points += 5;
    }

    const t = toNum(tempC);
    if (t != null) {
      if (t < 35) points += 7;
    }

    const cr = toNum(creatinine);
    if (cr != null) {
      if (cr < 1.2) points += 0;
      else if (cr < 2) points += 2;
      else if (cr < 3.5) points += 7;
      else points += 8;
    }

    const hrN = toNum(hr);
    if (hrN != null) {
      if (hrN < 120) points += 0;
      else if (hrN < 160) points += 5;
      else points += 7;
    }

    const wbc = toNum(leukocytes);
    if (wbc != null) {
      if (wbc >= 15) points += 2;
    }

    const phN = toNum(ph);
    if (phN != null) {
      if (phN <= 7.25) points += 3;
    }

    const pl = toNum(platelets);
    if (pl != null) {
      if (pl >= 100) points += 0;
      else if (pl >= 50) points += 5;
      else if (pl >= 20) points += 8;
      else points += 13;
    }

    const sbpN = toNum(sbp);
    if (sbpN != null) {
      if (sbpN >= 120) points += 0;
      else if (sbpN >= 70) points += 3;
      else if (sbpN >= 40) points += 8;
      else points += 11;
    }

    const pao2N = toNum(pao2);
    const fio2N = normFiO2(fio2);
    const isMv = mv === "YES";
    if (pao2N != null) {
      if (!isMv) {
        if (pao2N < 60) points += 5;
      } else if (fio2N != null) {
        const ratio = pao2N / fio2N;
        if (ratio < 100) points += 11;
        else points += 7;
      }
    }

    // Reasons
    if (admissionReason === "CARDIO_RHYTHM_DISTURB") points += -5;
    if (admissionReason === "NEURO_SEIZURES") points += -4;
    if (admissionReason === "HYPOVOLEMIC_SHOCK") points += 3;
    if (admissionReason === "SEPTIC_SHOCK") points += 5;
    if (admissionReason === "ANAPHYL_MIXED_SHOCK") points += 5;
    if (admissionReason === "NEURO_COMA_DELIRIUM") points += 4;
    if (admissionReason === "NEURO_FOCAL_DEFICIT") points += 7;
    if (admissionReason === "NEURO_MASS_EFFECT") points += 10;
    if (admissionReason === "DIGESTIVE_ACUTE_ABDOMEN") points += 3;
    if (admissionReason === "DIGESTIVE_SEVERE_PANCREATITIS") points += 9;
    if (admissionReason === "HEPATIC_LIVER_FAILURE") points += 6;

    const withOffset = points + 16;
    return Math.max(0, Math.round(withOffset));
  }

  function saps3Mortality(score: number) {
    const logit = -32.6659 + 7.3068 * Math.log(score + 20.5958);
    const p = 1 / (1 + Math.exp(-logit));
    return p;
  }

  function calcular() {
    const score = saps3Score();
    setResultado(score);
    setMortalidade(saps3Mortality(score) * 100);
  }

  function usarValor() {
    if (resultado != null) setSaps3(resultado);
    r.back();
  }

  const pao2fio2Preview = useMemo(() => {
    const pao2N = toNum(pao2);
    const fio2N = normFiO2(fio2);
    if (pao2N == null || fio2N == null || fio2N <= 0) return null;
    return pao2N / fio2N;
  }, [pao2, fio2]);

  return (
    <Screen className="px-6 py-6" contentContainerClassName="max-w-xl w-full self-center">
      <StyledView className="flex-row items-center justify-between mb-8">
        <StyledView>
          <StyledText className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">SAPS 3</StyledText>
          <StyledText className="text-zinc-500 text-sm font-medium">Calculadora de Admissão</StyledText>
        </StyledView>
        <Button label="VOLTAR" variant="ghost" onPress={() => r.back()} className="h-10 px-4" />
      </StyledView>

      <Card className="space-y-8 p-6">
        <ChipsRow>
          <Chip label="Básico" active={tab === "BASICO"} onPress={() => setTab("BASICO")} />
          <Chip label="Comorb." active={tab === "COMORB"} onPress={() => setTab("COMORB")} />
          <Chip label="Fisiologia" active={tab === "FISIO"} onPress={() => setTab("FISIO")} />
          <Chip label="Motivo" active={tab === "MOTIVO"} onPress={() => setTab("MOTIVO")} />
        </ChipsRow>

        <Divider />

        {tab === "BASICO" ? (
          <StyledView className="space-y-6">
            <Input label="Idade (anos)" value={idade} onChangeText={setIdade} keyboardType="numeric" placeholder="Ex.: 73" />
            <Input
              label="Dias no hospital antes da UTI"
              value={losHospital}
              onChangeText={setLosHospital}
              keyboardType="numeric"
              placeholder="Ex.: 4"
            />

            <StyledView className="space-y-3">
              <StyledText className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Local antes da UTI</StyledText>
              <ChipsRow>
                <Chip label="N/A" active={locPreIcu === "NA"} onPress={() => setLocPreIcu("NA")} />
                <Chip label="P.S." active={locPreIcu === "ER"} onPress={() => setLocPreIcu("ER")} />
                <Chip label="Outra UTI" active={locPreIcu === "OTHER_ICU"} onPress={() => setLocPreIcu("OTHER_ICU")} />
                <Chip label="Enfermaria" active={locPreIcu === "WARD"} onPress={() => setLocPreIcu("WARD")} />
              </ChipsRow>
            </StyledView>

            <StyledView className="space-y-3">
              <StyledText className="text-zinc-500 text-xs uppercase font-bold tracking-wider">DVA antes da UTI</StyledText>
              <ChipsRow>
                <Chip label="Não" active={!vasoPreIcu} onPress={() => setVasoPreIcu(false)} />
                <Chip label="Sim" active={vasoPreIcu} onPress={() => setVasoPreIcu(true)} />
              </ChipsRow>
            </StyledView>

            <StyledView className="space-y-3">
              <StyledText className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Admissão planejada?</StyledText>
              <ChipsRow>
                <Chip label="N/A" active={planned === "NA"} onPress={() => setPlanned("NA")} />
                <Chip label="Sim" active={planned === "PLANNED"} onPress={() => setPlanned("PLANNED")} />
                <Chip label="Não" active={planned === "UNPLANNED"} onPress={() => setPlanned("UNPLANNED")} />
              </ChipsRow>
            </StyledView>

            <StyledView className="space-y-3">
              <StyledText className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Status cirúrgico</StyledText>
              <ChipsRow>
                <Chip label="N/A" active={surgical === "NA"} onPress={() => setSurgical("NA")} />
                <Chip label="Eletiva" active={surgical === "SCHEDULED"} onPress={() => setSurgical("SCHEDULED")} />
                <Chip label="Não cirúrgico" active={surgical === "NO_SURGERY"} onPress={() => setSurgical("NO_SURGERY")} />
                <Chip label="Urgência" active={surgical === "EMERGENCY"} onPress={() => setSurgical("EMERGENCY")} />
              </ChipsRow>
            </StyledView>

            <StyledView className="space-y-3">
              <StyledText className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Infecção aguda</StyledText>
              <ChipsRow>
                <Chip label="N/A" active={infection === "NA"} onPress={() => setInfection("NA")} />
                <Chip label="Nenhuma" active={infection === "NONE"} onPress={() => setInfection("NONE")} />
                <Chip label="Nosocomial" active={infection === "NOSOCOMIAL"} onPress={() => setInfection("NOSOCOMIAL")} />
                <Chip label="Respiratória" active={infection === "RESPIRATORY"} onPress={() => setInfection("RESPIRATORY")} />
              </ChipsRow>
            </StyledView>
          </StyledView>
        ) : null}

        {tab === "COMORB" ? (
          <StyledView className="space-y-6">
            <ChipsRow>
              <Chip label="Terapia oncológica" active={cancerTherapy} onPress={() => setCancerTherapy((s) => !s)} tone="warning" />
              <Chip label="ICC NYHA IV" active={chronicHf} onPress={() => setChronicHf((s) => !s)} tone="warning" />
              <Chip
                label="Neoplasia hematológica"
                active={hematologicCancer}
                onPress={() => setHematologicCancer((s) => !s)}
                tone="warning"
              />
              <Chip label="Cirrose" active={cirrhosis} onPress={() => setCirrhosis((s) => !s)} tone="warning" />
              <Chip label="AIDS" active={aids} onPress={() => setAids((s) => !s)} tone="warning" />
              <Chip
                label="Câncer metastático"
                active={metastaticCancer}
                onPress={() => setMetastaticCancer((s) => !s)}
                tone="warning"
              />
            </ChipsRow>
          </StyledView>
        ) : null}

        {tab === "FISIO" ? (
          <StyledView className="space-y-6">
            <Input label="GCS (mín.)" value={gcs} onChangeText={setGcs} keyboardType="numeric" placeholder="Ex.: 7" />
            <Input label="Bilirrubina (mg/dL)" value={bilirubin} onChangeText={setBilirubin} keyboardType="numeric" placeholder="Ex.: 3.2" />
            <Input label="Temp (°C)" value={tempC} onChangeText={setTempC} keyboardType="numeric" placeholder="Ex.: 36.4" />
            <Input label="Creatinina (mg/dL)" value={creatinine} onChangeText={setCreatinine} keyboardType="numeric" placeholder="Ex.: 1.6" />
            <Input label="FC (bpm)" value={hr} onChangeText={setHr} keyboardType="numeric" placeholder="Ex.: 128" />
            <Input label="Leucócitos (G/L)" value={leukocytes} onChangeText={setLeukocytes} keyboardType="numeric" placeholder="Ex.: 18" />
            <Input label="pH" value={ph} onChangeText={setPh} keyboardType="numeric" placeholder="Ex.: 7.22" />
            <Input label="Plaquetas (G/L)" value={platelets} onChangeText={setPlatelets} keyboardType="numeric" placeholder="Ex.: 72" />
            <Input label="PAS (mmHg)" value={sbp} onChangeText={setSbp} keyboardType="numeric" placeholder="Ex.: 84" />

            <StyledView className="space-y-3">
              <StyledText className="text-zinc-500 text-xs uppercase font-bold tracking-wider">Ventilação mecânica?</StyledText>
              <ChipsRow>
                <Chip label="N/A" active={mv === "NA"} onPress={() => setMv("NA")} />
                <Chip label="Não" active={mv === "NO"} onPress={() => setMv("NO")} />
                <Chip label="Sim" active={mv === "YES"} onPress={() => setMv("YES")} />
              </ChipsRow>
            </StyledView>

            <Input label="PaO₂ (mmHg)" value={pao2} onChangeText={setPao2} keyboardType="numeric" placeholder="Ex.: 68" />
            <Input label="FiO₂ (0–1 ou %)" value={fio2} onChangeText={setFio2} keyboardType="numeric" placeholder="Ex.: 0.4 ou 40" />
            <KeyValueRow k="PaO₂/FiO₂" v={pao2fio2Preview != null ? String(Math.round(pao2fio2Preview)) : "-"} />
          </StyledView>
        ) : null}

        {tab === "MOTIVO" ? (
          <StyledView className="space-y-6">
            <ChipsRow>
              <Chip label="Nenhum/Outro" active={admissionReason === "NONE"} onPress={() => setAdmissionReason("NONE")} />
              <Chip label="Arritmia" active={admissionReason === "CARDIO_RHYTHM_DISTURB"} onPress={() => setAdmissionReason("CARDIO_RHYTHM_DISTURB")} />
              <Chip label="Convulsões" active={admissionReason === "NEURO_SEIZURES"} onPress={() => setAdmissionReason("NEURO_SEIZURES")} />
              <Chip label="Choque hipovolêmico" active={admissionReason === "HYPOVOLEMIC_SHOCK"} onPress={() => setAdmissionReason("HYPOVOLEMIC_SHOCK")} />
              <Chip label="Choque séptico" active={admissionReason === "SEPTIC_SHOCK"} onPress={() => setAdmissionReason("SEPTIC_SHOCK")} />
              <Chip label="Choque anafil./misto" active={admissionReason === "ANAPHYL_MIXED_SHOCK"} onPress={() => setAdmissionReason("ANAPHYL_MIXED_SHOCK")} />
              <Chip label="Coma/delirium" active={admissionReason === "NEURO_COMA_DELIRIUM"} onPress={() => setAdmissionReason("NEURO_COMA_DELIRIUM")} />
              <Chip label="Déficit focal" active={admissionReason === "NEURO_FOCAL_DEFICIT"} onPress={() => setAdmissionReason("NEURO_FOCAL_DEFICIT")} />
              <Chip label="Efeito de massa" active={admissionReason === "NEURO_MASS_EFFECT"} onPress={() => setAdmissionReason("NEURO_MASS_EFFECT")} />
              <Chip label="Abdome agudo" active={admissionReason === "DIGESTIVE_ACUTE_ABDOMEN"} onPress={() => setAdmissionReason("DIGESTIVE_ACUTE_ABDOMEN")} />
              <Chip label="Pancreatite grave" active={admissionReason === "DIGESTIVE_SEVERE_PANCREATITIS"} onPress={() => setAdmissionReason("DIGESTIVE_SEVERE_PANCREATITIS")} />
              <Chip label="Falência hepática" active={admissionReason === "HEPATIC_LIVER_FAILURE"} onPress={() => setAdmissionReason("HEPATIC_LIVER_FAILURE")} />
            </ChipsRow>
          </StyledView>
        ) : null}

        <Divider />

        <StyledView className="space-y-4">
          <Button label="CALCULAR" onPress={calcular} size="lg" />
          <StyledView className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <KeyValueRow k="Resultado SAPS 3" v={resultado != null ? String(resultado) : "-"} />
            <KeyValueRow k="Mortalidade estimada" v={mortalidade != null ? `${mortalidade.toFixed(1)}%` : "-"} />
          </StyledView>
          <Button label="Usar este valor" onPress={usarValor} disabled={resultado == null} variant="secondary" />
        </StyledView>
      </Card>
    </Screen>
  );
}
