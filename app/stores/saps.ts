import { create } from "zustand";
import { Saps3Result } from "../src/modules/saps3/types";

type State = {
  saps3: number | null;
  saps3Result: Saps3Result | null;
};
type Actions = {
  setSaps3: (v: number | null) => void;
  setSaps3Result: (v: Saps3Result | null) => void;
  reset: () => void;
};

export const useSaps = create<State & Actions>((set) => ({
  saps3: null,
  saps3Result: null,
  setSaps3: (v) => set({ saps3: v }),
  setSaps3Result: (v) => set({ saps3Result: v, saps3: v ? v.scoreTotal : null }),
  reset: () => set({ saps3: null, saps3Result: null })
}));


