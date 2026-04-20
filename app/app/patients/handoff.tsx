import { useState, useCallback, useEffect } from "react";
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
import { useAuth } from "../../stores/auth";
import {
  Specialty,
  SPECIALTY_LABELS,
  SPECIALTY_ICONS,
  SPECIALTY_SECTIONS,
  HandoffData,
} from "../../src/modules/handoff/types";
import { SECTION_COMPONENTS } from "../../components/handoff/HandoffSections";
import { TacticalTheme } from "../../components/handoff/TacticalBase";
import { theme } from "../../lib/ui";

const ALL_SPECIALTIES: Specialty[] = [
  "intensivista",
  "enfermeiro",
  "fisioterapeuta",
  "farmaceutico",
  "nutricionista",
];

export default function HandoffPage() {
  const { patientId, patientName } = useLocalSearchParams<{
    patientId: string;
    patientName?: string;
  }>();
  const router = useRouter();
  const hydrated = useHandoff((s) => s.hydrated);
  const hydrateHandoff = useHandoff((s) => s.hydrate);
  const addEntry = useHandoff((s) => s.addEntry);
  const getEntriesForPatient = useHandoff((s) => s.getEntriesForPatient);
  const exportCSV = useHandoff((s) => s.exportCSV);

  const [step, setStep] = useState<"select" | "form">("select");
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState<Partial<HandoffData>>({});
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!hydrated) hydrateHandoff();
  }, [hydrated]);

  const handleFieldChange = useCallback(
    (key: keyof HandoffData, value: any) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSelectSpecialty = (spec: Specialty) => {
    setSelectedSpecialty(spec);
    setFormData({ paciente: patientName ?? "" });
    setStep("form");
  };

  const handleSubmit = async () => {
    if (!selectedSpecialty || !patientId) return;
    setSaving(true);
    try {
      await addEntry(
        patientId as string,
        today,
        selectedSpecialty,
        SPECIALTY_LABELS[selectedSpecialty],
        formData
      );
      Alert.alert(
        "ENTRY_COMMITTED",
        "Dados da passagem de plantão salvos no sistema.",
        [{ text: "CONFIRMAR", onPress: () => { setStep("select"); setSelectedSpecialty(null); setFormData({}); } }]
      );
    } catch (e) {
      Alert.alert("FAULT_DETECTION", "Falha ao sincronizar dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const csv = exportCSV(patientId as string);
    if (!csv) return Alert.alert("VOID_DATA", "Nenhum dado disponível.");
    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `HANDOFF_${patientId}_${today}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      try { await Share.share({ message: csv, title: `HANDOFF_${today}` }); } catch {}
    }
  };

  const handleViewTable = () => {
    router.push(`/patients/handoff-view?patientId=${patientId}&patientName=${encodeURIComponent(patientName ?? "")}`);
  };

  if (!hydrated) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={TacticalTheme.colors.accent} />
      </View>
    );
  }

  const existingEntries = getEntriesForPatient(patientId as string, today);
  const filledSpecialties = [...new Set(existingEntries.map((e) => e.specialty))];

  if (step === "select") {
    return (
      <View style={styles.container}>
        <View style={styles.consoleHeader}>
          <Pressable onPress={() => router.back()} style={styles.backNode}>
            <Text style={styles.backText}>[ESC] CANCEL</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.consoleTitle}>TACTICAL_ACCESS_CONSOLE</Text>
            <Text style={styles.consoleSubtitle}>{patientName ?? "UNKNOWN_PATIENT"} // ID: {patientId?.slice(0,8)}</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        <ScrollView contentContainerStyle={styles.consoleBody}>
          <View style={styles.sysInfoCard}>
            <Text style={styles.sysLabel}>SYSTEM_READY_FOR_COMMUNICATION</Text>
            <Text style={styles.sysDate}>{new Date().toLocaleDateString("pt-BR")} // {new Date().toLocaleTimeString("pt-BR")}</Text>
            {filledSpecialties.length > 0 && (
              <View style={styles.filledRow}>
                <Text style={styles.filledLabel}>COMMITTED_NODES:</Text>
                <View style={styles.nodesRow}>
                  {filledSpecialties.map((s) => (
                    <View key={s} style={styles.nodeTag}>
                      <Text style={styles.nodeTagText}>{SPECIALTY_LABELS[s].toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          <Text style={styles.sectionHeading}>SELECT ACCESS NODE</Text>
          <View style={styles.specGrid}>
            {ALL_SPECIALTIES.map((spec) => {
              const isFilled = filledSpecialties.includes(spec);
              return (
                <Pressable
                  key={spec}
                  style={({ pressed }) => [
                    styles.nodeCard,
                    isFilled && styles.nodeCardFilled,
                    pressed && { backgroundColor: "rgba(34, 211, 238, 0.1)" }
                  ]}
                  onPress={() => handleSelectSpecialty(spec)}
                >
                  <View style={styles.nodeIconWrap}>
                    <Text style={styles.nodeIconText}>{SPECIALTY_ICONS[spec]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nodeLabel}>{SPECIALTY_LABELS[spec].toUpperCase()}</Text>
                    <Text style={styles.nodeStatus}>{isFilled ? "STATUS: COMMITTED" : "STATUS: PENDING"}</Text>
                  </View>
                  <View style={styles.nodeChevron}>
                    <Text style={styles.chevronText}>{">"}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footerActions}>
            <Pressable style={styles.tacticalBtn} onPress={handleViewTable}>
              <Text style={styles.tacticalBtnText}>📋 RELATÓRIO CONSOLIDADO</Text>
            </Pressable>
            <Pressable style={[styles.tacticalBtn, { borderLeftWidth: 0 }]} onPress={handleExport}>
              <Text style={styles.tacticalBtnText}>📤 EXPORT_DATA</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  const sections = selectedSpecialty ? SPECIALTY_SECTIONS[selectedSpecialty] : [];

  return (
    <View style={styles.container}>
      <View style={styles.consoleHeader}>
        <Pressable onPress={() => { setStep("select"); setSelectedSpecialty(null); }} style={styles.backNode}>
          <Text style={styles.backText}>[ESC] BACK</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.consoleTitle}>{SPECIALTY_LABELS[selectedSpecialty!].toUpperCase()}_INPUT_INTERFACE</Text>
          <Text style={styles.consoleSubtitle}>{patientName ?? "PATIENT"} // SESSION_ACTIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
        {sections.map((sectionKey) => {
          const Component = SECTION_COMPONENTS[sectionKey];
          return Component ? <Component key={sectionKey} data={formData} onChange={handleFieldChange} /> : null;
        })}

        <View style={styles.submitSection}>
          <Pressable disabled={saving} style={[styles.commitBtn, saving && { opacity: 0.5 }]} onPress={handleSubmit}>
            {saving ? <ActivityIndicator size="small" color={TacticalTheme.colors.bg} /> : <Text style={styles.commitBtnText}>COMMIT_CHANGES_TO_CENTRAL_TABLE</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
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
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: TacticalTheme.colors.accent,
    shadowColor: TacticalTheme.colors.accent,
    shadowRadius: 4,
    shadowOpacity: 0.8,
  },
  consoleBody: { padding: 20, gap: 16 },
  sysInfoCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.2)",
    backgroundColor: "rgba(34, 211, 238, 0.05)",
    borderRadius: TacticalTheme.radius.xs,
  },
  sysLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: TacticalTheme.colors.accent,
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  sysDate: {
    fontSize: 10,
    color: TacticalTheme.colors.muted,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 4,
  },
  filledRow: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(34, 211, 238, 0.1)", paddingTop: 8 },
  filledLabel: { fontSize: 8, color: TacticalTheme.colors.muted, marginBottom: 4 },
  nodesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  nodeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 2,
  },
  nodeTagText: { fontSize: 8, color: TacticalTheme.colors.success, fontWeight: "800" },
  sectionHeading: {
    fontSize: 10,
    fontWeight: "900",
    color: TacticalTheme.colors.muted,
    letterSpacing: 1,
    marginTop: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  specGrid: { gap: 8 },
  nodeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: TacticalTheme.colors.surface,
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.xs,
    gap: 16,
  },
  nodeCardFilled: { borderColor: TacticalTheme.colors.success, backgroundColor: "rgba(16, 185, 129, 0.02)" },
  nodeIconWrap: { width: 44, height: 44, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 2 },
  nodeIconText: { fontSize: 24 },
  nodeLabel: { fontSize: 13, fontWeight: "800", color: TacticalTheme.colors.text, letterSpacing: 0.5 },
  nodeStatus: { fontSize: 9, color: TacticalTheme.colors.muted, marginTop: 2, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
  nodeChevron: { opacity: 0.3 },
  chevronText: { color: TacticalTheme.colors.text, fontSize: 16 },
  footerActions: { flexDirection: "row", marginTop: 16, borderTopWidth: 1, borderTopColor: TacticalTheme.colors.border, borderRadius: TacticalTheme.radius.xs, overflow: "hidden" },
  tacticalBtn: { flex: 1, paddingVertical: 14, alignItems: "center", backgroundColor: TacticalTheme.colors.surface, borderWidth: 1, borderColor: TacticalTheme.colors.border },
  tacticalBtnText: { fontSize: 10, fontWeight: "800", color: TacticalTheme.colors.text, letterSpacing: 1 },
  formBody: { padding: 20, paddingBottom: 60 },
  submitSection: { marginTop: 8, marginBottom: 40 },
  commitBtn: {
    backgroundColor: TacticalTheme.colors.accent,
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: TacticalTheme.radius.xs,
  },
  commitBtnText: { color: TacticalTheme.colors.bg, fontWeight: "900", fontSize: 11, letterSpacing: 1.5 },
});

