export type Saps3Region = 
  | "GLOBAL"
  | "CENTRAL_SOUTH_AMERICA"
  | "NORTH_AMERICA"
  | "NORTH_EUROPE"
  | "SOUTHERN_EUROPE"
  | "CENTRAL_WESTERN_EUROPE"
  | "EASTERN_EUROPE"
  | "AUSTRALASIA";

export interface Saps3Input {
  // Box I - Patient Characteristics
  ageYears: number;
  hospitalDaysBeforeICU: number; // 0 for <14, 1 for 14-27, 2 for >=28 but raw days is better for input
  locationBeforeICU: "OPERATING_ROOM" | "EMERGENCY_ROOM" | "OTHER_ICU" | "WARD" | "OTHER"; // Note: Sheet distinguishes Ward vs Other? Sheet says "Other" (8), "Other ICU" (7), "ER" (5). But UI usually has Ward. I will map Ward to Other or check sheet carefully. Sheet: "Location before ICU: OR (0), ER (5), Other ICU (7), Other (8)". I will keep WARD as option mapping to OTHER in logic if not explicit.
  
  comorbidities: {
    cancerTherapy?: boolean;
    metastaticCancer?: boolean;
    hematologicMalignancy?: boolean;
    chronicHF_NYHA4?: boolean;
    cirrhosis?: boolean;
    aids?: boolean;
  };
  
  vasoactiveBeforeICU?: boolean;

  // Box II - Reasons for ICU Admission
  plannedAdmission: boolean; // Planned (0) vs Unplanned (3)
  
  surgicalStatus: "ELECTIVE_SURGERY" | "EMERGENCY_SURGERY" | "NO_SURGERY";
  surgicalSite: "NONE_OR_OTHER" | "TRANSPLANT" | "TRAUMA" | "CARDIAC_SURGERY_CABG" | "NEUROSURGERY_OR_STROKE";
  
  infection: {
    nosocomial?: boolean;
    respiratory?: boolean;
  };

  reasons: {
    // Cardiovascular
    arrhythmia?: boolean;
    hypovolemicShockHemorrhagic?: boolean;
    hypovolemicShockNonHemorrhagic?: boolean;
    septicShock?: boolean;
    anaphylacticOrMixedOrUndefinedShock?: boolean;
    
    // Hepatic
    hepaticFailure?: boolean;
    
    // Digestive
    severePancreatitis?: boolean;
    acuteAbdomenOther?: boolean;
    
    // Neurological
    intracranialMassEffect?: boolean;
    focalNeurologicDeficit?: boolean;
    seizures?: boolean;
    alteredMentalState?: boolean; // Coma, stupor, delirium, confusion, agitation
  };

  // Box III - Physiology
  gcs: number;
  gcsEstimated?: boolean; // For sedated patients
  
  bilirubinMgDl: number;
  temperatureC: number;
  creatinineMgDl: number;
  heartRateMax: number;
  
  wbc: number;
  wbcUnit: "G_L" | "K_uL"; // G/L = 10^9/L, K/uL = 10^3/mm3. 1 G/L = 1 K/uL.
  
  phMin: number;
  
  platelets: number;
  plateletsUnit: "G_L" | "K_uL";
  
  systolicBPMin: number;
  
  // Oxygenation
  ventilationMechanical: boolean;
  pao2MmHg?: number;
  fio2?: number; 
  fio2Unit: "FRACTION" | "PERCENT"; // 0.21 - 1.0 or 21 - 100
}

export interface Saps3Result {
  scoreTotal: number;
  breakdown: Array<{ key: string; label: string; value: string; points: number }>;
  region: Saps3Region;
  logit: number;
  probability: number; // 0..1
  missingFields: string[];
}
