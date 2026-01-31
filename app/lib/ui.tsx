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
    bg: "#F8FAFC", // Slate 50
    bg2: "#F1F5F9", // Slate 100
    surface: "#FFFFFF",
    surface2: "#F8FAFC", // Slate 50
    surface3: "#E2E8F0", // Slate 200
    surface4: "#CBD5E1", // Slate 300
    border: "#E2E8F0", // Slate 200
    text: "#0F172A", // Slate 900
    muted: "#64748B", // Slate 500
    subtle: "#94A3B8", // Slate 400
    primary: "#0EA5E9", // Sky 500 (Mais moderno/vibrante que o azul padrão)
    success: "#10B981", // Emerald 500
    warning: "#F59E0B", // Amber 500
    danger: "#EF4444" // Red 500
  },
  radii: { sm: 8, md: 12, lg: 16, xl: 24 },
  space: { xs: 6, sm: 12, md: 20, lg: 32, xl: 48, xxl: 64 },
  font: {
    h1: 32,
    h2: 24,
    h3: 18,
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
          : theme.colors.surface;
  const borderColor =
    tone === "neutral"
      ? theme.colors.border
      : "transparent";
  const fg = tone === "neutral" ? theme.colors.text : "#FFFFFF";
  
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled || props.loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          opacity: props.disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }]
        },
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
  type?: string; // Web only
}) {
  const [focused, setFocused] = useState(false);
  const editable = props.editable ?? true;
  const borderColor = useMemo(() => {
    if (!editable) return theme.colors.border;
    if (focused) return theme.colors.primary;
    return theme.colors.border;
  }, [focused, editable]);
  
  const focusRing = useMemo(() => {
    if (!focused) return null;
    return Platform.OS === "web"
      ? ({ boxShadow: `0 0 0 4px ${theme.colors.primary}15`, borderColor: theme.colors.primary } as any)
      : null;
  }, [focused]);

  const bg = editable ? (focused ? theme.colors.surface : theme.colors.bg2) : theme.colors.bg2;
  
  return (
    <View style={props.style}>
      <Text style={styles.label}>{props.label}</Text>
      <View
        style={[
          styles.inputWrap,
          { borderColor: focused ? theme.colors.primary : theme.colors.border, backgroundColor: bg },
          focusRing
        ]}
      >
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={theme.colors.subtle}
          secureTextEntry={props.secureTextEntry}
          keyboardType={props.keyboardType}
          multiline={props.multiline}
          editable={editable}
          onFocus={() => (editable ? setFocused(true) : null)}
          onBlur={() => setFocused(false)}
          {...({ type: props.type } as any)}
          style={[
            styles.input,
            props.multiline ? styles.textArea : null,
            !editable ? { opacity: 0.7 } : null
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
    backgroundColor: theme.colors.bg
  },
  padded: { padding: theme.space.lg },
  scrollContent: { padding: theme.space.lg, gap: theme.space.md },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    marginBottom: theme.space.md
  },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.primary
  },
  h1: { fontSize: theme.font.h1, color: theme.colors.text, fontWeight: "800", letterSpacing: -0.8 },
  h2: { fontSize: theme.font.h2, color: theme.colors.text, fontWeight: "700", letterSpacing: -0.5 },
  subtle: { color: theme.colors.subtle, marginTop: 4, fontSize: theme.font.body },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.space.lg,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)" } as any)
      : { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 })
  },
  label: { color: theme.colors.text, marginBottom: 6, fontSize: theme.font.small, fontWeight: "500" },
  inputWrap: {
    backgroundColor: theme.colors.surface,
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
    paddingVertical: 14,
    fontSize: theme.font.body,
    height: 52
  },
  textArea: { minHeight: 100, textAlignVertical: "top", height: "auto", paddingVertical: 12 },
  inputRight: { paddingRight: theme.space.md },
  button: {
    borderRadius: theme.radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    ...(Platform.OS === "web"
      ? ({ cursor: "pointer", transition: "all 0.15s ease-out" } as any)
      : null)
  },
  buttonText: { fontSize: theme.font.body, fontWeight: "600", letterSpacing: 0.3 },
  link: { color: theme.colors.primary, fontWeight: "600" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.space.sm },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent"
  },
  tagText: { fontSize: theme.font.small, fontWeight: "600" },
  kvRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.bg2 },
  kvKey: { color: theme.colors.muted, fontSize: theme.font.body },
  kvVal: { color: theme.colors.text, fontSize: theme.font.body, fontWeight: "500" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: theme.space.sm },
  segmentedWrap: {
    flexDirection: "row",
    backgroundColor: theme.colors.bg2,
    borderRadius: theme.radii.lg,
    padding: 4
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md
  },
  segmentedItemActive: {
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0 2px 4px 0 rgb(0 0 0 / 0.08)" } as any)
      : { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 })
  },
  segmentedText: { color: theme.colors.muted, fontSize: theme.font.small, fontWeight: "500" },
  segmentedTextActive: { color: theme.colors.text, fontWeight: "600" }
});
