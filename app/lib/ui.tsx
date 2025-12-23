import { ReactNode, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle
} from "react-native";

export const theme = {
  colors: {
    bg: "#F6F8FC",
    bg2: "#EAF1FF",
    surface: "#FFFFFF",
    surface2: "#F2F5FB",
    surface3: "#EBF0FA",
    surface4: "#E4EAF6",
    border: "rgba(15,23,42,0.10)",
    text: "#0B1220",
    muted: "rgba(11,18,32,0.72)",
    subtle: "rgba(11,18,32,0.54)",
    primary: "#2F6BFF",
    success: "#16A56B",
    warning: "#F59E0B",
    danger: "#EF4444"
  },
  radii: { sm: 10, md: 14, lg: 18, xl: 24 },
  space: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 },
  font: {
    h1: 28,
    h2: 20,
    h3: 16,
    body: 15,
    small: 13
  }
} as const;

export function formatDateBR(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

export function formatISODate(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return formatDateBR(d);
}

export function calcAge(dateOfBirthISO: string | null | undefined) {
  if (!dateOfBirthISO) return null;
  const dob = new Date(dateOfBirthISO);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function Screen(props: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  if (props.scroll) {
    return (
      <View style={[styles.screen, props.style]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, props.contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {props.children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[styles.screen, styles.padded, props.style]}>
      <View style={props.contentStyle}>{props.children}</View>
    </View>
  );
}

export function AppHeader(props: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.headerCard, props.style]}>
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={styles.brandDot} />
            <Text style={styles.h1}>{props.title}</Text>
          </View>
          {props.subtitle ? <Text style={styles.subtle}>{props.subtitle}</Text> : null}
        </View>
        {props.right ? <View style={{ marginLeft: theme.space.md }}>{props.right}</View> : null}
      </View>
    </View>
  );
}

export function Card(props: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, props.style]}>{props.children}</View>;
}

export function Tag(props: { label: string; tone?: "default" | "primary" | "success" | "warning" | "danger" }) {
  const tone = props.tone ?? "default";
  const bg =
    tone === "primary"
      ? "rgba(47,107,255,0.10)"
      : tone === "success"
        ? "rgba(22,165,107,0.10)"
        : tone === "warning"
          ? "rgba(245,158,11,0.12)"
          : tone === "danger"
            ? "rgba(239,68,68,0.10)"
            : "rgba(15,23,42,0.06)";
  const border =
    tone === "primary"
      ? "rgba(47,107,255,0.24)"
      : tone === "success"
        ? "rgba(22,165,107,0.22)"
        : tone === "warning"
          ? "rgba(245,158,11,0.25)"
          : tone === "danger"
            ? "rgba(239,68,68,0.22)"
            : "rgba(15,23,42,0.08)";
  const fg =
    tone === "primary"
      ? theme.colors.primary
    : tone === "success"
        ? theme.colors.success
        : tone === "warning"
          ? theme.colors.warning
          : tone === "danger"
            ? theme.colors.danger
            : theme.colors.text;
  return (
    <View style={[styles.tag, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.tagText, { color: fg }]}>{props.label}</Text>
    </View>
  );
}

export function Button(props: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "neutral" | "success" | "danger";
  style?: StyleProp<ViewStyle>;
}) {
  const tone = props.tone ?? "primary";
  const bg =
    tone === "primary"
      ? theme.colors.primary
    : tone === "success"
      ? theme.colors.success
    : tone === "danger"
      ? theme.colors.danger
      : theme.colors.surface2;
  const borderColor =
    tone === "neutral"
      ? theme.colors.border
    : tone === "primary"
      ? "rgba(47,107,255,0.35)"
    : tone === "success"
      ? "rgba(22,165,107,0.35)"
      : "rgba(239,68,68,0.35)";
  const fg = tone === "neutral" ? theme.colors.text : "#FFFFFF";
  const webBgDisabled =
    Platform.OS === "web" && (props.disabled || props.loading) && tone !== "neutral"
      ? ({ backgroundImage: "none" } as any)
      : null;
  const webBg =
    Platform.OS === "web" && tone !== "neutral"
      ? ({
          backgroundImage:
            tone === "primary"
              ? "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.00) 48%), linear-gradient(135deg, #2F6BFF 0%, #2557FF 100%)"
              : tone === "success"
                ? "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.00) 55%), linear-gradient(135deg, #16A56B 0%, #0F8C59 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.00) 55%), linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
        } as any)
      : null;
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled || props.loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          opacity: props.disabled ? 0.45 : pressed ? 0.92 : 1,
          transform: pressed ? [{ translateY: 1 }] : [{ translateY: 0 }]
        },
        webBg,
        webBgDisabled,
        props.style
      ]}
    >
      {props.loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{props.label}</Text>}
    </Pressable>
  );
}

export function TextField(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  multiline?: boolean;
  editable?: boolean;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [focused, setFocused] = useState(false);
  const editable = props.editable ?? true;
  const borderColor = useMemo(() => {
    if (!editable) return "rgba(15,23,42,0.07)";
    if (focused) return "rgba(47,107,255,0.55)";
    return theme.colors.border;
  }, [focused, editable]);
  const focusShadow = useMemo(() => {
    if (!focused) return null;
    return Platform.OS === "web"
      ? ({ boxShadow: "0px 18px 44px rgba(47,107,255,0.18)" } as any)
      : { shadowColor: "#2F6BFF", shadowOpacity: 0.14, shadowRadius: 12, elevation: 2 };
  }, [focused]);
  const bg = editable ? (focused ? theme.colors.surface : theme.colors.surface2) : theme.colors.surface3;
  return (
    <View style={props.style}>
      <Text style={styles.label}>{props.label}</Text>
      <View
        style={[
          styles.inputWrap,
          { borderColor, backgroundColor: bg },
          focusShadow
        ]}
      >
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor="rgba(11,18,32,0.35)"
          secureTextEntry={props.secureTextEntry}
          keyboardType={props.keyboardType}
          multiline={props.multiline}
          editable={editable}
          onFocus={() => (editable ? setFocused(true) : null)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            props.multiline ? styles.textArea : null,
            !editable ? { opacity: 0.78 } : null
          ]}
        />
        {props.right ? <View style={styles.inputRight}>{props.right}</View> : null}
      </View>
    </View>
  );
}

export function Segmented(props: {
  value: string;
  options: { key: string; label: string }[];
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmentedWrap, props.style]}>
      {props.options.map((o) => {
        const active = o.key === props.value;
        return (
          <Pressable
            key={o.key}
            onPress={() => props.onChange(o.key)}
            style={({ pressed }) => [
              styles.segmentedItem,
              active ? styles.segmentedItemActive : null,
              { opacity: pressed ? 0.92 : 1 }
            ]}
          >
            <Text style={[styles.segmentedText, active ? styles.segmentedTextActive : null]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function InlineLink(props: { label: string; onPress: () => void; style?: StyleProp<TextStyle> }) {
  return (
    <Pressable onPress={props.onPress} style={{ paddingVertical: 6 }}>
      <Text style={[styles.link, props.style]}>{props.label}</Text>
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function KeyValueRow(props: { k: string; v: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvKey}>{props.k}</Text>
      <Text style={styles.kvVal}>{props.v}</Text>
    </View>
  );
}

export function ChipsRow(props: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.chipsRow, props.style]}>{props.children}</View>;
}

export function SectionTitle(props: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.h2}>{props.title}</Text>
      {props.right ? <View style={{ marginLeft: theme.space.md }}>{props.right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    ...(Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(1100px 620px at 15% 0%, ${theme.colors.bg2} 0%, ${theme.colors.bg} 55%), radial-gradient(900px 560px at 92% 18%, rgba(47,107,255,0.12) 0%, rgba(47,107,255,0.00) 60%)`
        } as any)
      : null)
  },
  padded: { padding: theme.space.lg },
  scrollContent: { padding: theme.space.lg, gap: theme.space.md },
  headerCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: theme.space.lg,
    marginBottom: theme.space.md,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0px 20px 56px rgba(15,23,42,0.14)", backdropFilter: "blur(12px)" } as any)
      : { shadowColor: "#0B1220", shadowOpacity: 0.10, shadowRadius: 18, elevation: 6 })
  },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    ...(Platform.OS === "web" ? ({ boxShadow: `0px 0px 0px 6px rgba(47,107,255,0.14)` } as any) : null)
  },
  h1: { fontSize: theme.font.h1, color: theme.colors.text, fontWeight: "900", letterSpacing: 0.2 },
  h2: { fontSize: theme.font.h2, color: theme.colors.text, fontWeight: "800" },
  subtle: { color: theme.colors.subtle, marginTop: 4, fontSize: theme.font.small },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: theme.space.lg,
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0px 18px 52px rgba(15,23,42,0.12)" } as any)
      : { shadowColor: "#0B1220", shadowOpacity: 0.10, shadowRadius: 16, elevation: 5 })
  },
  label: { color: theme.colors.muted, marginBottom: 6, fontSize: theme.font.small, fontWeight: "600" },
  inputWrap: {
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    paddingHorizontal: theme.space.md,
    paddingVertical: 12,
    fontSize: theme.font.body
  },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  inputRight: { paddingRight: theme.space.md },
  button: {
    borderRadius: theme.radii.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...(Platform.OS === "web"
      ? ({ cursor: "pointer", boxShadow: "0px 10px 22px rgba(15,23,42,0.10)" } as any)
      : { shadowColor: "#0B1220", shadowOpacity: 0.10, shadowRadius: 10, elevation: 3 })
  },
  buttonText: { fontSize: theme.font.body, fontWeight: "700" },
  link: { color: theme.colors.primary, fontWeight: "700" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.space.sm },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)"
  },
  tagText: { fontSize: theme.font.small, fontWeight: "700" },
  kvRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 6 },
  kvKey: { color: theme.colors.muted, fontSize: theme.font.small },
  kvVal: { color: theme.colors.text, fontSize: theme.font.small, fontWeight: "700" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  segmentedWrap: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    padding: 4
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999
  },
  segmentedItemActive: {
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0px 10px 26px rgba(15,23,42,0.10)" } as any)
      : { shadowColor: "#0B1220", shadowOpacity: 0.10, shadowRadius: 10, elevation: 2 })
  },
  segmentedText: { color: theme.colors.muted, fontSize: theme.font.small, fontWeight: "800" },
  segmentedTextActive: { color: theme.colors.text }
});
