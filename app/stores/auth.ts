import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type State = {
  token: string | null;
  hospitalId: string | null;
  hydrated: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  setToken: (t: string | null) => Promise<void>;
  setHospital: (id: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<State & Actions>((set) => ({
  token: null,
  hospitalId: null,
  hydrated: false,
  hydrate: async () => {
    const available = await SecureStore.isAvailableAsync();
    const token = available ? await SecureStore.getItemAsync("token") : (globalThis as any).localStorage?.getItem("token");
    const hospitalId = available
      ? await SecureStore.getItemAsync("hospitalId")
      : (globalThis as any).localStorage?.getItem("hospitalId");
    set({ token: token ?? null, hospitalId: hospitalId ?? null, hydrated: true });
  },
  setToken: async (t) => {
    const available = await SecureStore.isAvailableAsync();
    if (available) {
      if (t) await SecureStore.setItemAsync("token", t);
      else await SecureStore.deleteItemAsync("token");
    } else {
      if (t) (globalThis as any).localStorage?.setItem("token", t);
      else (globalThis as any).localStorage?.removeItem("token");
    }
    set({ token: t });
  },
  setHospital: async (id) => {
    const available = await SecureStore.isAvailableAsync();
    if (available) {
      if (id) await SecureStore.setItemAsync("hospitalId", id);
      else await SecureStore.deleteItemAsync("hospitalId");
    } else {
      if (id) (globalThis as any).localStorage?.setItem("hospitalId", id);
      else (globalThis as any).localStorage?.removeItem("hospitalId");
    }
    set({ hospitalId: id });
  },
  logout: async () => {
    const available = await SecureStore.isAvailableAsync();
    if (available) {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("hospitalId");
    } else {
      (globalThis as any).localStorage?.removeItem("token");
      (globalThis as any).localStorage?.removeItem("hospitalId");
    }
    set({ token: null, hospitalId: null });
  }
}));
