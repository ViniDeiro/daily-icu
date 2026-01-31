import { create } from "zustand";

type State = {
  saps3: number | null;
};
type Actions = {
  setSaps3: (v: number | null) => void;
  reset: () => void;
};

export const useSaps = create<State & Actions>((set) => ({
  saps3: null,
  setSaps3: (v) => set({ saps3: v }),
  reset: () => set({ saps3: null })
}));

