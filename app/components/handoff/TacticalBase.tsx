import React from "react";
import { View, Text, TextInput, StyleSheet, Platform, Pressable } from "react-native";
import { theme } from "../../lib/ui";

export const TacticalTheme = {
  colors: {
    bg: "#020617", // Slate 950
    surface: "#0F172A", // Slate 900
    border: "#1E293B", // Slate 800
    accent: "#22D3EE", // Cyan 400
    success: "#10B981", // Emerald 500
    warning: "#F59E0B", // Amber 500
    text: "#F8FAFC", // Slate 50
    muted: "#94A3B8", // Slate 400
  },
  radius: {
    xs: 2,
    sm: 4,
  }
};

export function TacticalField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  editable = true,
  keyboardType = "default",
  mono = true,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: "default" | "numeric";
  mono?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={tStyles.fieldContainer}>
      <Text style={tStyles.label}>{label.toUpperCase()}</Text>
      <View
        style={[
          tStyles.inputWrap,
          focused && { borderColor: TacticalTheme.colors.accent },
          !editable && { opacity: 0.6 }
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={TacticalTheme.colors.border}
          multiline={multiline}
          editable={editable}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            tStyles.input,
            mono && { fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" },
            multiline && { minHeight: 80, textAlignVertical: "top" }
          ]}
        />
      </View>
    </View>
  );
}

export function TacticalSection({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor?: string }) {
  return (
    <View style={tStyles.section}>
      <View style={[tStyles.sectionHeader, accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 3 } : null]}>
        <Text style={tStyles.sectionTitle}>{title.toUpperCase()}</Text>
        <View style={tStyles.headerDecoration} />
      </View>
      <View style={tStyles.sectionBody}>{children}</View>
    </View>
  );
}

const tStyles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: TacticalTheme.colors.muted,
    marginBottom: 4,
    letterSpacing: 1,
  },
  inputWrap: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.xs,
    minHeight: 44,
  },
  input: {
    flex: 1,
    color: TacticalTheme.colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  section: {
    backgroundColor: TacticalTheme.colors.surface,
    borderWidth: 1,
    borderColor: TacticalTheme.colors.border,
    borderRadius: TacticalTheme.radius.sm,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderBottomWidth: 1,
    borderBottomColor: TacticalTheme.colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: TacticalTheme.colors.text,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  headerDecoration: {
    width: 40,
    height: 2,
    backgroundColor: TacticalTheme.colors.border,
  },
  sectionBody: {
    padding: 16,
    gap: 8,
  },
});
