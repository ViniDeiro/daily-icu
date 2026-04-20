import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { styled } from "nativewind";
import { Saps3Input, Saps3Region } from "./types";
import { initialSaps3Input, parseNumber } from "./validators";
import { Input, Button, ChipsRow, Card } from "../../../components/ui";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface Props {
  initialData?: Partial<Saps3Input>;
  onCalculate: (data: Saps3Input, region: Saps3Region) => void;
  loading?: boolean;
}

function Section({ title, expanded, onPress, children }: any) {
    return (
        <StyledView className="mb-4 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <StyledTouchableOpacity 
                onPress={onPress} 
                className={`flex-row items-center justify-between p-5 ${expanded ? "bg-slate-50" : "bg-white"}`}
                activeOpacity={0.7}
            >
                <StyledText className="text-lg font-bold text-slate-800">{title}</StyledText>
                <StyledText className="text-slate-400 font-bold text-xl">{expanded ? "-" : "+"}</StyledText>
            </StyledTouchableOpacity>
            {expanded && (
                <StyledView className="p-5 space-y-6 border-t border-slate-100">
                    {children}
                </StyledView>
            )}
        </StyledView>
    )
}

function BooleanToggle({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) {
    return (
        <StyledTouchableOpacity 
            onPress={() => onChange(!value)}
            className={`flex-row items-center justify-between p-3 rounded-xl border ${value ? "bg-primary-50 border-primary-200" : "bg-white border-slate-200"}`}
        >
            <StyledText className={`font-bold text-sm ${value ? "text-primary-700" : "text-slate-600"}`}>{label}</StyledText>
            <StyledView className={`w-5 h-5 rounded-full border items-center justify-center ${value ? "bg-primary-500 border-primary-500" : "border-slate-300"}`}>
                {value && <StyledView className="w-2 h-2 bg-white rounded-full" />}
            </StyledView>
        </StyledTouchableOpacity>
    )
}

export function Saps3Form({ initialData, onCalculate, loading }: Props) {
  const [form, setForm] = useState<Saps3Input>({ ...initialSaps3Input, ...initialData });
  const [region, setRegion] = useState<Saps3Region>("CENTRAL_SOUTH_AMERICA");
  
  // UI State
  const [expanded, setExpanded] = useState<"BOX1" | "BOX2" | "BOX3">("BOX1");

  function toggle(section: "BOX1" | "BOX2" | "BOX3") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(expanded === section ? section : section); // Keep open or switch? User requested accordions. Typically one open or multiple. Let's allow switching.
      setExpanded(section);
  }

  function update(key: keyof Saps3Input, value: any) {
      setForm(s => ({ ...s, [key]: value }));
  }

  function updateNested(parent: "comorbidities" | "infection" | "reasons", key: string, value: any) {
      setForm(s => ({
          ...s,
          [parent]: {
              ...s[parent],
              [key]: value
          }
      }));
  }

  return (
    <StyledView className="flex-1">
        <StyledView className="mb-4">
             <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Modelo de Calibração</StyledText>
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {[
                    { l: "América Latina", v: "CENTRAL_SOUTH_AMERICA" },
                    { l: "Global", v: "GLOBAL" },
                    { l: "América do Norte", v: "NORTH_AMERICA" },
                    { l: "Europa (Sul)", v: "SOUTHERN_EUROPE" },
                    { l: "Australasia", v: "AUSTRALASIA" },
                ].map((r: any) => (
                    <StyledTouchableOpacity 
                        key={r.v}
                        onPress={() => setRegion(r.v)}
                        className={`px-4 py-2 rounded-full border ${region === r.v ? "bg-primary-600 border-primary-600" : "bg-white border-slate-200"}`}
                    >
                        <StyledText className={`text-xs font-bold ${region === r.v ? "text-white" : "text-slate-600"}`}>{r.l}</StyledText>
                    </StyledTouchableOpacity>
                ))}
             </ScrollView>
        </StyledView>

        <Section title="Box I: Características" expanded={expanded === "BOX1"} onPress={() => toggle("BOX1")}>
            <Input 
                label="Idade (anos)" 
                value={String(form.ageYears || "")} 
                onChangeText={t => update("ageYears", parseNumber(t))} 
                keyboardType="numeric" 
                placeholder="Ex: 65"
            />
            
            <Input 
                label="Tempo Hosp. Prévio (dias)" 
                value={String(form.hospitalDaysBeforeICU || "")} 
                onChangeText={t => update("hospitalDaysBeforeICU", parseNumber(t))} 
                keyboardType="numeric" 
                placeholder="Dias antes da UTI"
            />

            <StyledView>
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Origem do Paciente</StyledText>
                <ChipsRow>
                    <Button label="Enfermaria" variant={form.locationBeforeICU === "WARD" ? "primary" : "secondary"} onPress={() => update("locationBeforeICU", "WARD")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="PS/Emergência" variant={form.locationBeforeICU === "EMERGENCY_ROOM" ? "primary" : "secondary"} onPress={() => update("locationBeforeICU", "EMERGENCY_ROOM")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="C. Cirúrgico" variant={form.locationBeforeICU === "OPERATING_ROOM" ? "primary" : "secondary"} onPress={() => update("locationBeforeICU", "OPERATING_ROOM")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Outra UTI" variant={form.locationBeforeICU === "OTHER_ICU" ? "primary" : "secondary"} onPress={() => update("locationBeforeICU", "OTHER_ICU")} className="h-8 py-0 px-3 text-xs" />
                </ChipsRow>
            </StyledView>

            <StyledView className="space-y-2">
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comorbidades</StyledText>
                <BooleanToggle label="Terapia Oncológica" value={!!form.comorbidities.cancerTherapy} onChange={v => updateNested("comorbidities", "cancerTherapy", v)} />
                <BooleanToggle label="Câncer Metastático" value={!!form.comorbidities.metastaticCancer} onChange={v => updateNested("comorbidities", "metastaticCancer", v)} />
                <BooleanToggle label="Neoplasia Hematológica" value={!!form.comorbidities.hematologicMalignancy} onChange={v => updateNested("comorbidities", "hematologicMalignancy", v)} />
                <BooleanToggle label="ICC (NYHA IV)" value={!!form.comorbidities.chronicHF_NYHA4} onChange={v => updateNested("comorbidities", "chronicHF_NYHA4", v)} />
                <BooleanToggle label="Cirrose" value={!!form.comorbidities.cirrhosis} onChange={v => updateNested("comorbidities", "cirrhosis", v)} />
                <BooleanToggle label="AIDS" value={!!form.comorbidities.aids} onChange={v => updateNested("comorbidities", "aids", v)} />
            </StyledView>
            
            <BooleanToggle label="Uso de Drogas Vasoativas Pré-UTI" value={!!form.vasoactiveBeforeICU} onChange={v => update("vasoactiveBeforeICU", v)} />
        </Section>

        <Section title="Box II: Admissão" expanded={expanded === "BOX2"} onPress={() => toggle("BOX2")}>
            <StyledView>
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Admissão</StyledText>
                <ChipsRow>
                    <Button label="Planejada" variant={form.plannedAdmission ? "primary" : "secondary"} onPress={() => update("plannedAdmission", true)} className="h-8 py-0 px-4" />
                    <Button label="Não Planejada" variant={!form.plannedAdmission ? "primary" : "secondary"} onPress={() => update("plannedAdmission", false)} className="h-8 py-0 px-4" />
                </ChipsRow>
            </StyledView>

            <StyledView>
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Cirúrgico</StyledText>
                <ChipsRow>
                    <Button label="Não Cirúrgico" variant={form.surgicalStatus === "NO_SURGERY" ? "primary" : "secondary"} onPress={() => update("surgicalStatus", "NO_SURGERY")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Eletiva" variant={form.surgicalStatus === "ELECTIVE_SURGERY" ? "primary" : "secondary"} onPress={() => update("surgicalStatus", "ELECTIVE_SURGERY")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Urgência" variant={form.surgicalStatus === "EMERGENCY_SURGERY" ? "primary" : "secondary"} onPress={() => update("surgicalStatus", "EMERGENCY_SURGERY")} className="h-8 py-0 px-3 text-xs" />
                </ChipsRow>
            </StyledView>

            <StyledView>
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sítio Cirúrgico (se aplicável)</StyledText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    <Button label="Nenhum/Outro" variant={form.surgicalSite === "NONE_OR_OTHER" ? "primary" : "secondary"} onPress={() => update("surgicalSite", "NONE_OR_OTHER")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Neuro/AVC" variant={form.surgicalSite === "NEUROSURGERY_OR_STROKE" ? "primary" : "secondary"} onPress={() => update("surgicalSite", "NEUROSURGERY_OR_STROKE")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Cardíaca (CABG)" variant={form.surgicalSite === "CARDIAC_SURGERY_CABG" ? "primary" : "secondary"} onPress={() => update("surgicalSite", "CARDIAC_SURGERY_CABG")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Trauma" variant={form.surgicalSite === "TRAUMA" ? "primary" : "secondary"} onPress={() => update("surgicalSite", "TRAUMA")} className="h-8 py-0 px-3 text-xs" />
                    <Button label="Transplante" variant={form.surgicalSite === "TRANSPLANT" ? "primary" : "secondary"} onPress={() => update("surgicalSite", "TRANSPLANT")} className="h-8 py-0 px-3 text-xs" />
                </ScrollView>
            </StyledView>

            <StyledView className="space-y-2">
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infecções</StyledText>
                <BooleanToggle label="Infecção Nosocomial" value={!!form.infection.nosocomial} onChange={v => updateNested("infection", "nosocomial", v)} />
                <BooleanToggle label="Infecção Respiratória" value={!!form.infection.respiratory} onChange={v => updateNested("infection", "respiratory", v)} />
            </StyledView>

            <StyledView className="space-y-2">
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivos Cardiovasculares</StyledText>
                <BooleanToggle label="Arritmia" value={!!form.reasons.arrhythmia} onChange={v => updateNested("reasons", "arrhythmia", v)} />
                <BooleanToggle label="Choque Hipovol. Hemorrágico" value={!!form.reasons.hypovolemicShockHemorrhagic} onChange={v => updateNested("reasons", "hypovolemicShockHemorrhagic", v)} />
                <BooleanToggle label="Choque Hipovol. Não-Hemorr." value={!!form.reasons.hypovolemicShockNonHemorrhagic} onChange={v => updateNested("reasons", "hypovolemicShockNonHemorrhagic", v)} />
                <BooleanToggle label="Choque Séptico" value={!!form.reasons.septicShock} onChange={v => updateNested("reasons", "septicShock", v)} />
                <BooleanToggle label="Choque Anafil./Misto" value={!!form.reasons.anaphylacticOrMixedOrUndefinedShock} onChange={v => updateNested("reasons", "anaphylacticOrMixedOrUndefinedShock", v)} />
            </StyledView>
            
            <StyledView className="space-y-2">
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivos Neurológicos</StyledText>
                <BooleanToggle label="Coma/Delirium/Estado Mental" value={!!form.reasons.alteredMentalState} onChange={v => updateNested("reasons", "alteredMentalState", v)} />
                <BooleanToggle label="Déficit Focal" value={!!form.reasons.focalNeurologicDeficit} onChange={v => updateNested("reasons", "focalNeurologicDeficit", v)} />
                <BooleanToggle label="Efeito de Massa Intracraniano" value={!!form.reasons.intracranialMassEffect} onChange={v => updateNested("reasons", "intracranialMassEffect", v)} />
                <BooleanToggle label="Convulsões" value={!!form.reasons.seizures} onChange={v => updateNested("reasons", "seizures", v)} />
            </StyledView>

            <StyledView className="space-y-2">
                <StyledText className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivos Digestivos/Hepáticos</StyledText>
                <BooleanToggle label="Falência Hepática" value={!!form.reasons.hepaticFailure} onChange={v => updateNested("reasons", "hepaticFailure", v)} />
                <BooleanToggle label="Pancreatite Grave" value={!!form.reasons.severePancreatitis} onChange={v => updateNested("reasons", "severePancreatitis", v)} />
                <BooleanToggle label="Abdome Agudo (Outro)" value={!!form.reasons.acuteAbdomenOther} onChange={v => updateNested("reasons", "acuteAbdomenOther", v)} />
            </StyledView>
        </Section>

        <Section title="Box III: Fisiologia" expanded={expanded === "BOX3"} onPress={() => toggle("BOX3")}>
            <StyledText className="text-xs text-slate-400 font-medium mb-4 italic">
                Nota: Utilize os piores valores das primeiras 1 hora de admissão.
            </StyledText>

            <Input label="GCS (3-15)" value={String(form.gcs || "")} onChangeText={t => update("gcs", parseNumber(t))} keyboardType="numeric" />
            <Input label="Bilirrubina Total (mg/dL)" value={String(form.bilirubinMgDl || "")} onChangeText={t => update("bilirubinMgDl", parseNumber(t))} keyboardType="numeric" />
            <Input label="Temperatura Axilar (°C)" value={String(form.temperatureC || "")} onChangeText={t => update("temperatureC", parseNumber(t))} keyboardType="numeric" />
            <Input label="Creatinina (mg/dL)" value={String(form.creatinineMgDl || "")} onChangeText={t => update("creatinineMgDl", parseNumber(t))} keyboardType="numeric" />
            <Input label="Frequência Cardíaca (bpm)" value={String(form.heartRateMax || "")} onChangeText={t => update("heartRateMax", parseNumber(t))} keyboardType="numeric" />
            
            <StyledView className="flex-row gap-4">
                <Input containerClassName="flex-1" label="Leucócitos (G/L)" value={String(form.wbc || "")} onChangeText={t => update("wbc", parseNumber(t))} keyboardType="numeric" />
                <Input containerClassName="flex-1" label="pH (Menor)" value={String(form.phMin || "")} onChangeText={t => update("phMin", parseNumber(t))} keyboardType="numeric" />
            </StyledView>

            <StyledView className="flex-row gap-4">
                <Input containerClassName="flex-1" label="Plaquetas (G/L)" value={String(form.platelets || "")} onChangeText={t => update("platelets", parseNumber(t))} keyboardType="numeric" />
                <Input containerClassName="flex-1" label="PAS (Menor mmHg)" value={String(form.systolicBPMin || "")} onChangeText={t => update("systolicBPMin", parseNumber(t))} keyboardType="numeric" />
            </StyledView>

            <StyledView className="space-y-4 pt-2">
                <BooleanToggle label="Ventilação Mecânica?" value={!!form.ventilationMechanical} onChange={v => update("ventilationMechanical", v)} />
                
                <StyledView className="flex-row gap-4">
                    <Input containerClassName="flex-1" label="PaO2 (mmHg)" value={String(form.pao2MmHg || "")} onChangeText={t => update("pao2MmHg", parseNumber(t))} keyboardType="numeric" />
                    <Input containerClassName="flex-1" label="FiO2 (%)" value={String(form.fio2 || "")} onChangeText={t => update("fio2", parseNumber(t))} keyboardType="numeric" />
                </StyledView>
            </StyledView>
        </Section>

        <Button label="CALCULAR SAPS 3" onPress={() => onCalculate(form, region)} loading={loading} className="mb-8" />
    </StyledView>
  );
}
