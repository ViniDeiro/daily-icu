import { Saps3Input } from "./types";

export const initialSaps3Input: Saps3Input = {
  ageYears: 0,
  hospitalDaysBeforeICU: 0,
  locationBeforeICU: "WARD",
  comorbidities: {},
  vasoactiveBeforeICU: false,
  plannedAdmission: false,
  surgicalStatus: "NO_SURGERY",
  surgicalSite: "NONE_OR_OTHER",
  infection: {},
  reasons: {},
  gcs: 15,
  bilirubinMgDl: 0.5,
  temperatureC: 36.5,
  creatinineMgDl: 0.8,
  heartRateMax: 80,
  wbc: 8,
  wbcUnit: "G_L",
  phMin: 7.4,
  platelets: 250,
  plateletsUnit: "G_L",
  systolicBPMin: 120,
  ventilationMechanical: false,
  fio2Unit: "PERCENT"
};

export function isValidNumber(n: any): boolean {
  return typeof n === "number" && !isNaN(n) && isFinite(n);
}

export function parseNumber(s: string): number {
  return Number(s.replace(",", ".").trim());
}
