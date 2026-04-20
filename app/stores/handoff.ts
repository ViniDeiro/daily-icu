import { create } from "zustand";
import { Platform } from "react-native";
import {
  HandoffEntry,
  HandoffData,
  Specialty,
  SECTION_LABELS,
  HandoffSection,
  SPECIALTY_SECTIONS,
} from "../src/modules/handoff/types";

const STORAGE_KEY = "handoff_entries";

async function loadFromStorage(): Promise<HandoffEntry[]> {
  try {
    if (Platform.OS === "web") {
      const raw = (globalThis as any).localStorage?.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    const SecureStore = require("expo-secure-store");
    const available = await SecureStore.isAvailableAsync();
    if (!available) return [];
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveToStorage(entries: HandoffEntry[]): Promise<void> {
  try {
    const raw = JSON.stringify(entries);
    if (Platform.OS === "web") {
      (globalThis as any).localStorage?.setItem(STORAGE_KEY, raw);
      return;
    }
    const SecureStore = require("expo-secure-store");
    const available = await SecureStore.isAvailableAsync();
    if (available) {
      await SecureStore.setItemAsync(STORAGE_KEY, raw);
    }
  } catch (e) {
    console.error("Failed to save handoff entries", e);
  }
}

function generateId(): string {
  return `ho-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type HandoffState = {
  entries: HandoffEntry[];
  hydrated: boolean;
};

type HandoffActions = {
  hydrate: () => Promise<void>;
  addEntry: (
    patientId: string,
    date: string,
    specialty: Specialty,
    filledBy: string,
    data: Partial<HandoffData>
  ) => Promise<void>;
  getEntriesForPatient: (patientId: string, date?: string) => HandoffEntry[];
  getMergedData: (patientId: string, date?: string) => Partial<HandoffData>;
  exportCSV: (patientId?: string, date?: string) => string;
  clearEntries: () => Promise<void>;
};

export const useHandoff = create<HandoffState & HandoffActions>((set, get) => ({
  entries: [],
  hydrated: false,

  hydrate: async () => {
    const entries = await loadFromStorage();
    set({ entries, hydrated: true });
  },

  addEntry: async (patientId, date, specialty, filledBy, data) => {
    const entry: HandoffEntry = {
      id: generateId(),
      patientId,
      date,
      specialty,
      filledBy,
      filledAt: new Date().toISOString(),
      data,
    };
    const entries = [...get().entries, entry];
    set({ entries });
    await saveToStorage(entries);
  },

  getEntriesForPatient: (patientId, date) => {
    return get().entries.filter(
      (e) =>
        e.patientId === patientId &&
        (!date || e.date === date)
    );
  },

  getMergedData: (patientId, date) => {
    const entries = get().getEntriesForPatient(patientId, date);
    const merged: Partial<HandoffData> = {};
    const sorted = [...entries].sort(
      (a, b) => new Date(a.filledAt).getTime() - new Date(b.filledAt).getTime()
    );
    for (const entry of sorted) {
      Object.assign(merged, entry.data);
    }
    return merged;
  },

  exportCSV: (patientId, date) => {
    const entries = patientId
      ? get().getEntriesForPatient(patientId, date)
      : get().entries;

    if (entries.length === 0) return "";

    const allKeys = new Set<string>();
    for (const e of entries) {
      Object.keys(e.data).forEach((k) => allKeys.add(k));
    }

    const metaHeaders = [
      "ID",
      "Paciente ID",
      "Data",
      "Especialidade",
      "Preenchido por",
      "Preenchido em",
    ];
    const dataHeaders = Array.from(allKeys);
    const headers = [...metaHeaders, ...dataHeaders];

    const rows = entries.map((e) => {
      const meta = [
        e.id,
        e.patientId,
        e.date,
        e.specialty,
        e.filledBy,
        e.filledAt,
      ];
      const data = dataHeaders.map((k) => {
        const val = (e.data as any)[k];
        if (val == null) return "";
        if (Array.isArray(val)) return JSON.stringify(val);
        return String(val);
      });
      return [...meta, ...data];
    });

    const csvRows = [
      headers.map(escapeCSV).join(","),
      ...rows.map((r) => r.map(escapeCSV).join(",")),
    ];
    return csvRows.join("\n");
  },

  clearEntries: async () => {
    set({ entries: [] });
    await saveToStorage([]);
  },
}));

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
