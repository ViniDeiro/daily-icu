import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHandoff } from "../../stores/handoff";
import {
  HandoffData,
  SPECIALTY_LABELS,
  SPECIALTY_ICONS,
  HandoffSection,
} from "../../src/modules/handoff/types";
import { SECTION_COMPONENTS } from "../../components/handoff/HandoffSections";
import { TacticalTheme } from "../../components/handoff/TacticalBase";

const ALL_SECTIONS: HandoffSection[] = [
  "header", "history", "subjective", "nursingControls", "hemodialysis", "fluidBalance",
  "labs", "gasometry", "devices", "neuro", "respiratory", "cardiovascular",
  "abdominalNutri", "renal", "infectious", "others", "scales", "planoDia",
];

export default function HandoffViewPage() {
  const { patientId, patientName } = useLocalSearchParams<{
    patientId: string;
    patientName?: string;
  }>();
  const router = useRouter();

  const hydrated = useHandoff((s) => s.hydrated);
  const hydrateHandoff = useHandoff((s) => s.hydrate);
  const getEntriesForPatient = useHandoff((s) => s.getEntriesForPatient);
  const getMergedData = useHandoff((s) => s.getMergedData);
  const exportCSV = useHandoff((s) => s.exportCSV);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (!hydrated) hydrateHandoff();
  }, [hydrated]);

  if (!hydrated) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={TacticalTheme.colors.accent} />
      </View>
    );
  }

  const entries = getEntriesForPatient(patientId as string, selectedDate);
  const mergedData = getMergedData(patientId as string, selectedDate);
  const filledSpecialties = [...new Set(entries.map((e) => e.specialty))];

  const allEntries = getEntriesForPatient(patientId as string);
  const allDates = [...new Set(allEntries.map((e) => e.date))].sort((a, b) => b.localeCompare(a));

  const handleExport = async () => {
    const csv = exportCSV(patientId as string, selectedDate);
    if (!csv) return Alert.alert("VOID_DATA", "Nenhum dado disponível.");
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `REPORT_${patientId}_${selectedDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      try { await Share.share({ message: csv, title: `REPORT_${selectedDate}` }); } catch {}
    }
  };

  const hasData = Object.keys(mergedData).length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.consoleHeader}>
        <Pressable onPress={() => router.back()} style={styles.backNode}>
          <Text style={styles.backText}>[ESC] CLOSE</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.consoleTitle}>CLINICAL_STATUS_REPORT</Text>
          <Text style={styles.consoleSubtitle}>{patientName?.toUpperCase() ?? "UNKNOWN_PATIENT"} // ID: {patientId?.slice(0,8)}</Text>
        </View>
        <Pressable onPress={handleExport} style={styles.actionNode}>
          <Text style={styles.actionText}>EXPORT_DATA</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {allDates.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
            {allDates.map((d) => (
              <Pressable key={d} onPress={() => setSelectedDate(d)} style={[styles.dateNode, d === selectedDate && styles.dateNodeActive]}>
                <Text style={[styles.dateText, d === selectedDate && styles.dateTextActive]}>{d.split("-").reverse().join("/")}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.statusGrid}>
          <View style={styles.statusPanel}>
            <Text style={styles.panelLabel}>CONTRIBUTOR_NODES_ONLINE</Text>
            <View style={styles.contribGrid}>
              {filledSpecialties.length > 0 ? filledSpecialties.map((s) => (
                <View key={s} style={styles.nodeStatusBox}>
                  <Text style={styles.nodeIcon}>{SPECIALTY_ICONS[s]}</Text>
                  <Text style={styles.nodeLabel}>{SPECIALTY_LABELS[s].toUpperCase()}</Text>
                  <View style={styles.activeLed} />
                </View>
              )) : <Text style={styles.emptyText}>NO_ACTIVE_NODES_FOUND</Text>}
            </View>
          </View>
        </View>

        {hasData ? (
          ALL_SECTIONS.map((sectionKey) => {
            const Component = SECTION_COMPONENTS[sectionKey];
            if (!Component) return null;
            if (!checkSectionHasData(sectionKey, mergedData)) return null;
            return <Component key={sectionKey} data={mergedData} onChange={() => {}} readOnly />;
          })
        ) : (
          <View style={styles.voidPanel}>
            <Text style={styles.voidTitle}>VOID_DATA_MATRIX</Text>
            <Text style={styles.voidSubtitle}>Nenhum registro encontrado para esta data.</Text>
          </View>
        )}

        {entries.length > 0 && (
          <View style={styles.logSection}>
            <Text style={styles.logHeading}>SESSION_LOG_TRAIL</Text>
            {entries.sort((a,b) => b.filledAt.localeCompare(a.filledAt)).map((e) => (
              <View key={e.id} style={styles.logEntry}>
                <View style={styles.logDot} />
                <Text style={styles.logTime}>{new Date(e.filledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text>
                <Text style={styles.logSpec}>{SPECIALTY_LABELS[e.specialty].toUpperCase()}</Text>
                <Text style={styles.logStatus}>COMMITTED {Object.keys(e.data).length}CH</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function checkSectionHasData(section: HandoffSection, data: Partial<HandoffData>): boolean {
  const sectionFieldMap: Record<HandoffSection, (keyof HandoffData)[]> = {
    header: ["fa", "paciente", "idade", "alergias", "hd", "leito", "dih", "dUti", "prevAlta"],
    history: ["hda", "hpp", "muc"],
    subjective: ["subjetivo", "exameFisico", "impressaoGeral", "evolucao", "dignoNota"],
    nursingControls: ["pamMin", "pamMax", "fc", "fr", "temp", "sat", "dextro1", "dextro2", "drenos"],
    hemodialysis: ["hemodialiseData", "hemodialiseTempo", "hemodialisePerdas"],
    fluidBalance: ["diureseValor", "hmd", "bh", "ultimaEvacuacao"],
    labs: ["hemoglobina", "hematocrito", "leucocitos", "plaquetas", "pcr", "ureia", "creatinina", "sodio", "potassio", "calcio", "magnesio", "albumina", "troponina", "cpk", "ckmb", "lactato"],
    gasometry: ["gasHorario", "gasPh", "gasPaco2", "gasPao2", "gasHco3", "gasBe"],
    cultures: [], imaging: [],
    devices: ["dispositivos"],
    neuro: ["sedoanalgesia", "glasgow", "rass", "pupilas"],
    respiratory: ["ventilacao", "modo", "fio2", "peep", "pcVcPs"],
    cardiovascular: ["dvas", "pamMmhg", "fcCardio", "tec"],
    abdominalNutri: ["dieta", "dietaVia", "dietaVazaoAtual", "dietaVazaoMeta"],
    renal: ["balancoHidricoNeutro", "reposicaoEletrolitica", "diureseMlKgH", "planoDialitico"],
    infectious: ["febre", "atbs", "desescalonarAtb", "culturasChecadas"],
    others: ["lppLocal", "peleAdmissao", "cabeceira30", "ims"],
    scales: ["braden", "morse", "fugulin", "pps", "saps3"],
    planoDia: ["planoDia"],
  };
  const fields = sectionFieldMap[section] ?? [];
  return fields.some((f) => {
    const val = data[f];
    if (val == null) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TacticalTheme.colors.bg },
  center: { justifyContent: "center", alignItems: "center" },
  consoleHeader: {
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: TacticalTheme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backNode: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.xs,
  },
  backText: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: TacticalTheme.colors.muted,
  },
  consoleTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: TacticalTheme.colors.text,
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  consoleSubtitle: {
    fontSize: 10,
    color: TacticalTheme.colors.accent,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 2,
  },
  actionNode: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    borderWidth: 1,
    borderColor: TacticalTheme.colors.accent,
    borderRadius: TacticalTheme.radius.xs,
  },
  actionText: {
    fontSize: 9,
    fontWeight: "900",
    color: TacticalTheme.colors.accent,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  content: { padding: 20, gap: 16 },
  datesRow: { gap: 8, marginBottom: 8 },
  dateNode: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.xs,
  },
  dateNodeActive: {
    borderColor: TacticalTheme.colors.accent,
    backgroundColor: "rgba(34, 211, 238, 0.05)",
  },
  dateText: {
    fontSize: 10,
    color: TacticalTheme.colors.muted,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  dateTextActive: { color: TacticalTheme.colors.accent, fontWeight: "800" },
  statusGrid: { marginBottom: 8 },
  statusPanel: {
    padding: 16,
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    backgroundColor: TacticalTheme.colors.surface,
    borderRadius: TacticalTheme.radius.xs,
  },
  panelLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: TacticalTheme.colors.muted,
    letterSpacing: 1,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  contribGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  nodeStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
  },
  nodeIcon: { fontSize: 16 },
  nodeLabel: { fontSize: 9, fontWeight: "700", color: TacticalTheme.colors.text },
  activeLed: { width: 4, height: 4, borderRadius: 9, backgroundColor: TacticalTheme.colors.success },
  emptyText: { fontSize: 10, color: TacticalTheme.colors.muted, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  voidPanel: {
    paddingVertical: 60,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.xs,
  },
  voidTitle: { fontSize: 14, fontWeight: "900", color: TacticalTheme.colors.muted, letterSpacing: 2, marginBottom: 8, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  voidSubtitle: { fontSize: 12, color: TacticalTheme.colors.border, textAlign: "center" },
  logSection: { marginTop: 12, gap: 8 },
  logHeading: { fontSize: 10, fontWeight: "900", color: TacticalTheme.colors.muted, letterSpacing: 1, marginBottom: 4, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: TacticalTheme.colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: TacticalTheme.colors.border,
  },
  logDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: TacticalTheme.colors.muted },
  logTime: { fontSize: 10, color: TacticalTheme.colors.muted, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  logSpec: { flex: 1, fontSize: 10, fontWeight: "800", color: TacticalTheme.colors.text },
  logStatus: { fontSize: 9, color: TacticalTheme.colors.accent, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
});

