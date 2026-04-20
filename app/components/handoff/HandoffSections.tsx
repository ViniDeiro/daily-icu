import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { HandoffData, HandoffSection, SECTION_LABELS } from "../../src/modules/handoff/types";
import { TacticalField, TacticalSection, TacticalTheme } from "./TacticalBase";

type SectionProps = {
  data: Partial<HandoffData>;
  onChange: (key: keyof HandoffData, value: any) => void;
  readOnly?: boolean;
};

function SectionWrapper({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor?: string }) {
  return (
    <TacticalSection title={title} accentColor={accentColor}>
      {children}
    </TacticalSection>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={sStyles.row}>{children}</View>;
}

function FieldWrap({ flex, children }: { flex?: number; children: React.ReactNode }) {
  return <View style={{ flex: flex ?? 1, minWidth: 0 }}>{children}</View>;
}

export function HeaderSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.header} accentColor="#B6D7A8">
      <Row>
        <FieldWrap flex={1}>
          <TacticalField label="FA" value={data.fa ?? ""} onChangeText={(v) => onChange("fa", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap flex={2}>
          <TacticalField label="Paciente" value={data.paciente ?? ""} onChangeText={(v) => onChange("paciente", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Idade" value={data.idade ?? ""} onChangeText={(v) => onChange("idade", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Leito" value={data.leito ?? ""} onChangeText={(v) => onChange("leito", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Alergias" value={data.alergias ?? ""} onChangeText={(v) => onChange("alergias", v)} editable={!readOnly} />
      <TacticalField label="HD (Hipótese Diagnóstica)" value={data.hd ?? ""} onChangeText={(v) => onChange("hd", v)} multiline editable={!readOnly} />
      <Row>
        <FieldWrap>
          <TacticalField label="DIH" value={data.dih ?? ""} onChangeText={(v) => onChange("dih", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="D.UTI" value={data.dUti ?? ""} onChangeText={(v) => onChange("dUti", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Prev. Alta" value={data.prevAlta ?? ""} onChangeText={(v) => onChange("prevAlta", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
    </SectionWrapper>
  );
}

export function HistorySection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.history} accentColor="#A4C2F4">
      <TacticalField label="HDA" value={data.hda ?? ""} onChangeText={(v) => onChange("hda", v)} multiline editable={!readOnly} />
      <TacticalField label="HPP" value={data.hpp ?? ""} onChangeText={(v) => onChange("hpp", v)} multiline editable={!readOnly} />
      <TacticalField label="MUC" value={data.muc ?? ""} onChangeText={(v) => onChange("muc", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export function SubjectiveSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.subjective} accentColor="#D9EAD3">
      <TacticalField label="Subjetivo (QX: Paciente, Familiar, Equipe)" value={data.subjetivo ?? ""} onChangeText={(v) => onChange("subjetivo", v)} multiline editable={!readOnly} />
      <TacticalField label="Exame Físico Alterado" value={data.exameFisico ?? ""} onChangeText={(v) => onChange("exameFisico", v)} multiline editable={!readOnly} />
      <Row>
        <FieldWrap>
          <TacticalField label="Impressão Geral" value={data.impressaoGeral ?? ""} onChangeText={(v) => onChange("impressaoGeral", v)} placeholder="BEG/REG/MEG" editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Evolução" value={data.evolucao ?? ""} onChangeText={(v) => onChange("evolucao", v)} placeholder="Fav/Est/Desf" editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Por quê?" value={data.evolucaoPorque ?? ""} onChangeText={(v) => onChange("evolucaoPorque", v)} multiline editable={!readOnly} />
      <TacticalField label="Digno de Nota" value={data.dignoNota ?? ""} onChangeText={(v) => onChange("dignoNota", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export function NursingControlsSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.nursingControls} accentColor="#FFD966">
      <Row>
        <FieldWrap>
          <TacticalField label="PAM Mín" value={data.pamMin ?? ""} onChangeText={(v) => onChange("pamMin", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="PAM Máx" value={data.pamMax ?? ""} onChangeText={(v) => onChange("pamMax", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="FC" value={data.fc ?? ""} onChangeText={(v) => onChange("fc", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="FR" value={data.fr ?? ""} onChangeText={(v) => onChange("fr", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Temp" value={data.temp ?? ""} onChangeText={(v) => onChange("temp", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="SAT" value={data.sat ?? ""} onChangeText={(v) => onChange("sat", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Dextro" value={data.dextro1 ?? ""} onChangeText={(v) => onChange("dextro1", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Dextro 2" value={data.dextro2 ?? ""} onChangeText={(v) => onChange("dextro2", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Drenos" value={data.drenos ?? ""} onChangeText={(v) => onChange("drenos", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export function HemodialysisSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.hemodialysis} accentColor="#CFE2F3">
      <Row>
        <FieldWrap>
          <TacticalField label="Data" value={data.hemodialiseData ?? ""} onChangeText={(v) => onChange("hemodialiseData", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Tempo" value={data.hemodialiseTempo ?? ""} onChangeText={(v) => onChange("hemodialiseTempo", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Perdas" value={data.hemodialisePerdas ?? ""} onChangeText={(v) => onChange("hemodialisePerdas", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
    </SectionWrapper>
  );
}

export function FluidBalanceSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.fluidBalance} accentColor="#CFE2F3">
      <Row>
        <FieldWrap>
          <TacticalField label="Diurese" value={data.diureseValor ?? ""} onChangeText={(v) => onChange("diureseValor", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="HMD" value={data.hmd ?? ""} onChangeText={(v) => onChange("hmd", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="BH" value={data.bh ?? ""} onChangeText={(v) => onChange("bh", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Última Evacuação" value={data.ultimaEvacuacao ?? ""} onChangeText={(v) => onChange("ultimaEvacuacao", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
    </SectionWrapper>
  );
}

export function LabsSection({ data, onChange, readOnly }: SectionProps) {
  const labFields: { label: string; keyOntem: keyof HandoffData; keyHoje: keyof HandoffData }[] = [
    { label: "Hemoglobina", keyOntem: "hemoglobina", keyHoje: "hemoglobinaHoje" },
    { label: "Hematócrito", keyOntem: "hematocrito", keyHoje: "hematocritoHoje" },
    { label: "Leucócitos", keyOntem: "leucocitos", keyHoje: "leucocitosHoje" },
    { label: "Plaquetas", keyOntem: "plaquetas", keyHoje: "plaquetasHoje" },
    { label: "PCR", keyOntem: "pcr", keyHoje: "pcrHoje" },
    { label: "Uréia", keyOntem: "ureia", keyHoje: "ureiaHoje" },
    { label: "Creatinina", keyOntem: "creatinina", keyHoje: "creatininaHoje" },
    { label: "Sódio", keyOntem: "sodio", keyHoje: "sodioHoje" },
    { label: "Potássio", keyOntem: "potassio", keyHoje: "potassioHoje" },
    { label: "Cálcio", keyOntem: "calcio", keyHoje: "calcioHoje" },
    { label: "Magnésio", keyOntem: "magnesio", keyHoje: "magnesioHoje" },
    { label: "Albumina", keyOntem: "albumina", keyHoje: "albuminaHoje" },
    { label: "Troponina", keyOntem: "troponina", keyHoje: "troponinaHoje" },
    { label: "CPK", keyOntem: "cpk", keyHoje: "cpkHoje" },
    { label: "CKMB", keyOntem: "ckmb", keyHoje: "ckmbHoje" },
    { label: "Lactato", keyOntem: "lactato", keyHoje: "lactatoHoje" },
    { label: "Outros", keyOntem: "outrosLabs", keyHoje: "outrosLabsHoje" },
  ];

  return (
    <SectionWrapper title={SECTION_LABELS.labs} accentColor="#EA9999">
      <View style={sStyles.labHeaderRow}>
        <Text style={[sStyles.labHeaderCell, { flex: 2 }]}>Exame</Text>
        <Text style={sStyles.labHeaderCell}>Ontem</Text>
        <Text style={sStyles.labHeaderCell}>Hoje</Text>
      </View>
      {labFields.map((f) => (
        <Row key={f.label}>
          <View style={{ flex: 2, justifyContent: "center" }}>
            <Text style={sStyles.labLabel}>{f.label}</Text>
          </View>
          <FieldWrap>
            <TacticalField label="" value={(data[f.keyOntem] as string) ?? ""} onChangeText={(v) => onChange(f.keyOntem, v)} placeholder="-" editable={!readOnly} />
          </FieldWrap>
          <FieldWrap>
            <TacticalField label="" value={(data[f.keyHoje] as string) ?? ""} onChangeText={(v) => onChange(f.keyHoje, v)} placeholder="-" editable={!readOnly} />
          </FieldWrap>
        </Row>
      ))}
      <TacticalField label="Labs Hoje (texto livre)" value={data.labsHoje ?? ""} onChangeText={(v) => onChange("labsHoje", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export function GasometrySection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.gasometry} accentColor="#EA9999">
      <TacticalField label="Horário Coleta" value={data.gasHorario ?? ""} onChangeText={(v) => onChange("gasHorario", v)} editable={!readOnly} />
      <Row>
        <FieldWrap>
          <TacticalField label="pH" value={data.gasPh ?? ""} onChangeText={(v) => onChange("gasPh", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="PaCO2" value={data.gasPaco2 ?? ""} onChangeText={(v) => onChange("gasPaco2", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="PaO2" value={data.gasPao2 ?? ""} onChangeText={(v) => onChange("gasPao2", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="HCO3" value={data.gasHco3 ?? ""} onChangeText={(v) => onChange("gasHco3", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="BE" value={data.gasBe ?? ""} onChangeText={(v) => onChange("gasBe", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="SatO2" value={data.gasSatO2 ?? ""} onChangeText={(v) => onChange("gasSatO2", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="I/O" value={data.gasIo ?? ""} onChangeText={(v) => onChange("gasIo", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="GAP CO2" value={data.gasGapCo2 ?? ""} onChangeText={(v) => onChange("gasGapCo2", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
    </SectionWrapper>
  );
}

export function DevicesSection({ data, onChange, readOnly }: SectionProps) {
  const dispositivos = data.dispositivos ?? [{}];

  const updateRow = (idx: number, key: string, value: string) => {
    const updated = [...dispositivos];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange("dispositivos", updated);
  };

  const addRow = () => {
    onChange("dispositivos", [...dispositivos, {}]);
  };

  return (
    <SectionWrapper title={SECTION_LABELS.devices} accentColor="#D5A6BD">
      {dispositivos.map((d, i) => (
        <View key={i} style={sStyles.arrayRow}>
          <Text style={sStyles.arrayRowIndex}>#{i + 1}</Text>
          <Row>
            <FieldWrap>
              <TacticalField label="Tipo" value={d.tipo ?? ""} onChangeText={(v) => updateRow(i, "tipo", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Sítio" value={d.sitio ?? ""} onChangeText={(v) => updateRow(i, "sitio", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
          <Row>
            <FieldWrap>
              <TacticalField label="N°/RIMA" value={d.rimaNum ?? ""} onChangeText={(v) => updateRow(i, "rimaNum", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Inserção" value={d.insercao ?? ""} onChangeText={(v) => updateRow(i, "insercao", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Retirada" value={d.retirada ?? ""} onChangeText={(v) => updateRow(i, "retirada", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
        </View>
      ))}
      {!readOnly && (
        <Text style={sStyles.addRowBtn} onPress={addRow}>+ Adicionar Dispositivo</Text>
      )}
    </SectionWrapper>
  );
}

export function NeuroSection({ data, onChange, readOnly }: SectionProps) {
  const sedos = data.sedoanalgesia ?? [{}];

  const updateRow = (idx: number, key: string, value: string) => {
    const updated = [...sedos];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange("sedoanalgesia", updated);
  };

  const addRow = () => {
    onChange("sedoanalgesia", [...sedos, {}]);
  };

  return (
    <SectionWrapper title={SECTION_LABELS.neuro} accentColor="#B4A7D6">
      <Text style={sStyles.subTitle}>Sedoanalgesia</Text>
      {sedos.map((s, i) => (
        <View key={i} style={sStyles.arrayRow}>
          <Row>
            <FieldWrap flex={2}>
              <TacticalField label="Droga" value={s.droga ?? ""} onChangeText={(v) => updateRow(i, "droga", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Vazão" value={s.vazao ?? ""} onChangeText={(v) => updateRow(i, "vazao", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
          <Row>
            <FieldWrap>
              <TacticalField label="Início" value={s.inicio ?? ""} onChangeText={(v) => updateRow(i, "inicio", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Fim" value={s.fim ?? ""} onChangeText={(v) => updateRow(i, "fim", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
        </View>
      ))}
      {!readOnly && (
        <Text style={sStyles.addRowBtn} onPress={addRow}>+ Adicionar Sedoanalgesia</Text>
      )}

      <View style={sStyles.divider} />
      <Row>
        <FieldWrap>
          <TacticalField label="Glasgow" value={data.glasgow ?? ""} onChangeText={(v) => onChange("glasgow", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="RASS" value={data.rass ?? ""} onChangeText={(v) => onChange("rass", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Pupilas" value={data.pupilas ?? ""} onChangeText={(v) => onChange("pupilas", v)} editable={!readOnly} />
      <TacticalField label="Despertar Diário/RASS<-2" value={data.despertarDiarioRass ?? ""} onChangeText={(v) => onChange("despertarDiarioRass", v)} editable={!readOnly} />
      <TacticalField label="Rodízio de Sedação?" value={data.rodizioSedacao ?? ""} onChangeText={(v) => onChange("rodizioSedacao", v)} editable={!readOnly} />
      <TacticalField label="Avaliação Dor/Analgesia" value={data.avaliacaoDor ?? ""} onChangeText={(v) => onChange("avaliacaoDor", v)} editable={!readOnly} />
    </SectionWrapper>
  );
}

export function RespiratorySection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.respiratory} accentColor="#93C47D">
      <Row>
        <FieldWrap flex={2}>
          <TacticalField label="Ventilação" value={data.ventilacao ?? ""} onChangeText={(v) => onChange("ventilacao", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="RIMA" value={data.rima ?? ""} onChangeText={(v) => onChange("rima", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Modo" value={data.modo ?? ""} onChangeText={(v) => onChange("modo", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="FR" value={data.frResp ?? ""} onChangeText={(v) => onChange("frResp", v)} keyboardType="numeric" editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="FiO2" value={data.fio2 ?? ""} onChangeText={(v) => onChange("fio2", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="PEEP" value={data.peep ?? ""} onChangeText={(v) => onChange("peep", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="PC/VC/PS" value={data.pcVcPs ?? ""} onChangeText={(v) => onChange("pcVcPs", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Fluxo" value={data.fluxo ?? ""} onChangeText={(v) => onChange("fluxo", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Rel I:E" value={data.relacaoIE ?? ""} onChangeText={(v) => onChange("relacaoIE", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Tosse" value={data.tosse ?? ""} onChangeText={(v) => onChange("tosse", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Ppico" value={data.ppico ?? ""} onChangeText={(v) => onChange("ppico", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Pplatô" value={data.pplato ?? ""} onChangeText={(v) => onChange("pplato", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="IRRS/Tobin" value={data.irrsTobin ?? ""} onChangeText={(v) => onChange("irrsTobin", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="DP" value={data.dp ?? ""} onChangeText={(v) => onChange("dp", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Protocolo de Desmame" value={data.protocoloDesmame ?? ""} onChangeText={(v) => onChange("protocoloDesmame", v)} editable={!readOnly} />
      <TacticalField label="Data de Prona" value={data.dataProna ?? ""} onChangeText={(v) => onChange("dataProna", v)} editable={!readOnly} />
      <Text style={sStyles.subTitle}>Pcuff</Text>
      <Row>
        <FieldWrap>
          <TacticalField label="Manhã" value={data.pcuffManha ?? ""} onChangeText={(v) => onChange("pcuffManha", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Tarde" value={data.pcuffTarde ?? ""} onChangeText={(v) => onChange("pcuffTarde", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Noite" value={data.pcuffNoite ?? ""} onChangeText={(v) => onChange("pcuffNoite", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Text style={sStyles.subTitle}>Observações</Text>
      <Row>
        <FieldWrap>
          <TacticalField label="Manhã" value={data.obsRespManha ?? ""} onChangeText={(v) => onChange("obsRespManha", v)} multiline editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Tarde" value={data.obsRespTarde ?? ""} onChangeText={(v) => onChange("obsRespTarde", v)} multiline editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Noite" value={data.obsRespNoite ?? ""} onChangeText={(v) => onChange("obsRespNoite", v)} multiline editable={!readOnly} />
        </FieldWrap>
      </Row>
    </SectionWrapper>
  );
}

export function CardiovascularSection({ data, onChange, readOnly }: SectionProps) {
  const dvasList = data.dvas ?? [{}];

  const updateRow = (idx: number, key: string, value: string) => {
    const updated = [...dvasList];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange("dvas", updated);
  };

  const addRow = () => {
    onChange("dvas", [...dvasList, {}]);
  };

  return (
    <SectionWrapper title={SECTION_LABELS.cardiovascular} accentColor="#F4CCCC">
      <Text style={sStyles.subTitle}>DVAs</Text>
      {dvasList.map((d, i) => (
        <View key={i} style={sStyles.arrayRow}>
          <Row>
            <FieldWrap flex={2}>
              <TacticalField label="DVA" value={d.droga ?? ""} onChangeText={(v) => updateRow(i, "droga", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Vazão" value={d.vazao ?? ""} onChangeText={(v) => updateRow(i, "vazao", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
          <Row>
            <FieldWrap>
              <TacticalField label="Início" value={d.inicio ?? ""} onChangeText={(v) => updateRow(i, "inicio", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Fim" value={d.fim ?? ""} onChangeText={(v) => updateRow(i, "fim", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
        </View>
      ))}
      {!readOnly && (
        <Text style={sStyles.addRowBtn} onPress={addRow}>+ Adicionar DVA</Text>
      )}
      <View style={sStyles.divider} />
      <Row>
        <FieldWrap>
          <TacticalField label="PAM/mmHg" value={data.pamMmhg ?? ""} onChangeText={(v) => onChange("pamMmhg", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="FC" value={data.fcCardio ?? ""} onChangeText={(v) => onChange("fcCardio", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="TEC" value={data.tec ?? ""} onChangeText={(v) => onChange("tec", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Estável HMD" value={data.estavelHmd ?? ""} onChangeText={(v) => onChange("estavelHmd", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Reduzir DVAs" value={data.reduzirDvas ?? ""} onChangeText={(v) => onChange("reduzirDvas", v)} editable={!readOnly} />
      <TacticalField label="Alterações ECG" value={data.alteracoesEcg ?? ""} onChangeText={(v) => onChange("alteracoesEcg", v)} editable={!readOnly} />
    </SectionWrapper>
  );
}

export function AbdominalNutriSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.abdominalNutri} accentColor="#FFE599">
      <Row>
        <FieldWrap flex={2}>
          <TacticalField label="Dieta" value={data.dieta ?? ""} onChangeText={(v) => onChange("dieta", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Via" value={data.dietaVia ?? ""} onChangeText={(v) => onChange("dietaVia", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Vazão Atual" value={data.dietaVazaoAtual ?? ""} onChangeText={(v) => onChange("dietaVazaoAtual", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Vazão Meta" value={data.dietaVazaoMeta ?? ""} onChangeText={(v) => onChange("dietaVazaoMeta", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Atingiu Meta 2000 kcal?" value={data.atingiuMeta2000 ?? ""} onChangeText={(v) => onChange("atingiuMeta2000", v)} editable={!readOnly} />
      <TacticalField label="Glicemia (alvo 80-180 mg/dl)?" value={data.glicemiaAlvo ?? ""} onChangeText={(v) => onChange("glicemiaAlvo", v)} editable={!readOnly} />
      <TacticalField label="Evacuação Normal?" value={data.evacuacaoNormal ?? ""} onChangeText={(v) => onChange("evacuacaoNormal", v)} editable={!readOnly} />
      <TacticalField label="Profilaxia Úlceras Gástricas?" value={data.profilaxiaUlcera ?? ""} onChangeText={(v) => onChange("profilaxiaUlcera", v)} editable={!readOnly} />
      <Row>
        <FieldWrap>
          <TacticalField label="Água" value={data.agua ?? ""} onChangeText={(v) => onChange("agua", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Peso" value={data.peso ?? ""} onChangeText={(v) => onChange("peso", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Altura" value={data.altura ?? ""} onChangeText={(v) => onChange("altura", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="OBS" value={data.obsNutri ?? ""} onChangeText={(v) => onChange("obsNutri", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export function RenalSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.renal} accentColor="#D9D2E9">
      <TacticalField label="Balanço Hídrico Neutro?" value={data.balancoHidricoNeutro ?? ""} onChangeText={(v) => onChange("balancoHidricoNeutro", v)} editable={!readOnly} />
      <TacticalField label="Reposição Eletrolítica?" value={data.reposicaoEletrolitica ?? ""} onChangeText={(v) => onChange("reposicaoEletrolitica", v)} editable={!readOnly} />
      <TacticalField label="Diurese > 0,5 ml/Kg/H?" value={data.diureseMlKgH ?? ""} onChangeText={(v) => onChange("diureseMlKgH", v)} editable={!readOnly} />
      <TacticalField label="Plano Dialítico" value={data.planoDialitico ?? ""} onChangeText={(v) => onChange("planoDialitico", v)} multiline editable={!readOnly} />
      <TacticalField label="Início de Diálise" value={data.inicioDialise ?? ""} onChangeText={(v) => onChange("inicioDialise", v)} editable={!readOnly} />
      <TacticalField label="OBS" value={data.obsRenal ?? ""} onChangeText={(v) => onChange("obsRenal", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export function InfectiousSection({ data, onChange, readOnly }: SectionProps) {
  const atbList = data.atbs ?? [{}];

  const updateRow = (idx: number, key: string, value: string) => {
    const updated = [...atbList];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange("atbs", updated);
  };

  const addRow = () => {
    onChange("atbs", [...atbList, {}]);
  };

  return (
    <SectionWrapper title={SECTION_LABELS.infectious} accentColor="#FCE5CD">
      <TacticalField label="Febre?" value={data.febre ?? ""} onChangeText={(v) => onChange("febre", v)} editable={!readOnly} />
      <Text style={sStyles.subTitle}>Antibióticos</Text>
      {atbList.map((a, i) => (
        <View key={i} style={sStyles.arrayRow}>
          <Row>
            <FieldWrap flex={2}>
              <TacticalField label="ATB" value={a.atb ?? ""} onChangeText={(v) => updateRow(i, "atb", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Início" value={a.inicio ?? ""} onChangeText={(v) => updateRow(i, "inicio", v)} editable={!readOnly} />
            </FieldWrap>
            <FieldWrap>
              <TacticalField label="Fim" value={a.fim ?? ""} onChangeText={(v) => updateRow(i, "fim", v)} editable={!readOnly} />
            </FieldWrap>
          </Row>
        </View>
      ))}
      {!readOnly && (
        <Text style={sStyles.addRowBtn} onPress={addRow}>+ Adicionar ATB</Text>
      )}
      <View style={sStyles.divider} />
      <TacticalField label="Desescalonar ATB?" value={data.desescalonarAtb ?? ""} onChangeText={(v) => onChange("desescalonarAtb", v)} editable={!readOnly} />
      <TacticalField label="Culturas Checadas?" value={data.culturasChecadas ?? ""} onChangeText={(v) => onChange("culturasChecadas", v)} editable={!readOnly} />
      <TacticalField label="Deve Desinvadir Dispositivos?" value={data.desinvadirDispositivos ?? ""} onChangeText={(v) => onChange("desinvadirDispositivos", v)} editable={!readOnly} />
      <TacticalField label="Profilaxia TVP?" value={data.profilaxiaTvp ?? ""} onChangeText={(v) => onChange("profilaxiaTvp", v)} editable={!readOnly} />
      <TacticalField label="Se não, motivo:" value={data.profilaxiaTvpMotivo ?? ""} onChangeText={(v) => onChange("profilaxiaTvpMotivo", v)} editable={!readOnly} />
    </SectionWrapper>
  );
}

export function OthersSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.others} accentColor="#C9DAF8">
      <Row>
        <FieldWrap>
          <TacticalField label="LPP Local" value={data.lppLocal ?? ""} onChangeText={(v) => onChange("lppLocal", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Estágio" value={data.lppEstagio ?? ""} onChangeText={(v) => onChange("lppEstagio", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="Pele Admissão" value={data.peleAdmissao ?? ""} onChangeText={(v) => onChange("peleAdmissao", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="Pele Evolução" value={data.peleEvolucao ?? ""} onChangeText={(v) => onChange("peleEvolucao", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <TacticalField label="Cabeceira 30°" value={data.cabeceira30 ?? ""} onChangeText={(v) => onChange("cabeceira30", v)} editable={!readOnly} />
      <TacticalField label="Oftalmoproteção" value={data.oftalmoproteção ?? ""} onChangeText={(v) => onChange("oftalmoproteção", v)} editable={!readOnly} />
      <TacticalField label="Mudança de Decúbito" value={data.mudancaDecubito ?? ""} onChangeText={(v) => onChange("mudancaDecubito", v)} editable={!readOnly} />
      <TacticalField label="Curativo" value={data.curativo ?? ""} onChangeText={(v) => onChange("curativo", v)} editable={!readOnly} />
      <TacticalField label="IMS (Escala Mobilidade)" value={data.ims ?? ""} onChangeText={(v) => onChange("ims", v)} editable={!readOnly} />
    </SectionWrapper>
  );
}

export function ScalesSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.scales} accentColor="#B6D7A8">
      <Row>
        <FieldWrap>
          <TacticalField label="BRADEN" value={data.braden ?? ""} onChangeText={(v) => onChange("braden", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="MORSE" value={data.morse ?? ""} onChangeText={(v) => onChange("morse", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="FUGULIN" value={data.fugulin ?? ""} onChangeText={(v) => onChange("fugulin", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="PPS" value={data.pps ?? ""} onChangeText={(v) => onChange("pps", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
      <Row>
        <FieldWrap>
          <TacticalField label="SAPS3" value={data.saps3 ?? ""} onChangeText={(v) => onChange("saps3", v)} editable={!readOnly} />
        </FieldWrap>
        <FieldWrap>
          <TacticalField label="TX.MORT%" value={data.txMort ?? ""} onChangeText={(v) => onChange("txMort", v)} editable={!readOnly} />
        </FieldWrap>
      </Row>
    </SectionWrapper>
  );
}

export function PlanoDiaSection({ data, onChange, readOnly }: SectionProps) {
  return (
    <SectionWrapper title={SECTION_LABELS.planoDia} accentColor="#A4C2F4">
      <TacticalField label="Plano do Dia" value={data.planoDia ?? ""} onChangeText={(v) => onChange("planoDia", v)} multiline editable={!readOnly} />
    </SectionWrapper>
  );
}

export const SECTION_COMPONENTS: Record<HandoffSection, React.FC<SectionProps>> = {
  header: HeaderSection,
  history: HistorySection,
  subjective: SubjectiveSection,
  nursingControls: NursingControlsSection,
  hemodialysis: HemodialysisSection,
  fluidBalance: FluidBalanceSection,
  labs: LabsSection,
  gasometry: GasometrySection,
  cultures: DevicesSection, // reused structure
  imaging: DevicesSection,
  devices: DevicesSection,
  neuro: NeuroSection,
  respiratory: RespiratorySection,
  cardiovascular: CardiovascularSection,
  abdominalNutri: AbdominalNutriSection,
  renal: RenalSection,
  infectious: InfectiousSection,
  others: OthersSection,
  scales: ScalesSection,
  planoDia: PlanoDiaSection,
};

const sStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: TacticalTheme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  labHeaderRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: TacticalTheme.colors.border,
  },
  labHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    color: TacticalTheme.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  labLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TacticalTheme.colors.text,
  },
  arrayRow: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.xs,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  arrayRowIndex: {
    fontSize: 10,
    fontWeight: "800",
    color: TacticalTheme.colors.muted,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  addRowBtn: {
    fontSize: 12,
    fontWeight: "800",
    color: TacticalTheme.colors.accent,
    textAlign: "center",
    paddingVertical: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: TacticalTheme.colors.border,
    marginVertical: 16,
    opacity: 0.5,
  },
});
