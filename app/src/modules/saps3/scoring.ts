import { Saps3Input, Saps3Result, Saps3Region } from "./types";
import { calculateProbability } from "./probability";

function getPointsBox1(input: Saps3Input): { points: number; items: any[] } {
  let p = 0;
  const items: any[] = [];

  // Age
  const age = input.ageYears;
  let ageP = 0;
  if (age < 40) ageP = 0;
  else if (age <= 59) ageP = 5;
  else if (age <= 69) ageP = 9;
  else if (age <= 74) ageP = 13;
  else if (age <= 79) ageP = 15;
  else ageP = 18;
  p += ageP;
  items.push({ key: "age", label: "Idade", value: `${age} anos`, points: ageP });

  // Comorbidities
  const c = input.comorbidities;
  if (c.cancerTherapy) { p += 3; items.push({ key: "cancerTherapy", label: "Terapia Oncológica", value: "Sim", points: 3 }); }
  if (c.metastaticCancer) { p += 11; items.push({ key: "metastaticCancer", label: "Câncer Metastático", value: "Sim", points: 11 }); }
  if (c.hematologicMalignancy) { p += 6; items.push({ key: "hematologicMalignancy", label: "Neoplasia Hematológica", value: "Sim", points: 6 }); }
  if (c.chronicHF_NYHA4) { p += 6; items.push({ key: "chronicHF", label: "ICC (NYHA IV)", value: "Sim", points: 6 }); }
  if (c.cirrhosis) { p += 8; items.push({ key: "cirrhosis", label: "Cirrose", value: "Sim", points: 8 }); }
  if (c.aids) { p += 8; items.push({ key: "aids", label: "AIDS", value: "Sim", points: 8 }); }

  // Length of stay before ICU
  // Note: user input is days. Sheet: <14 (0), 14-27 (6), >=28 (7)
  // But wait, the sheet often refers to "days in hospital".
  const los = input.hospitalDaysBeforeICU;
  let losP = 0;
  if (los < 14) losP = 0;
  else if (los < 28) losP = 6;
  else losP = 7;
  p += losP;
  if (losP > 0) items.push({ key: "los", label: "Tempo Hosp. Prévio", value: `${los} dias`, points: losP });

  // Location
  // OR (0), ER (5), Other ICU (7), Other (8)
  // Input: "OPERATING_ROOM" | "EMERGENCY_ROOM" | "OTHER_ICU" | "WARD" | "OTHER"
  let locP = 0;
  switch (input.locationBeforeICU) {
    case "OPERATING_ROOM": locP = 0; break;
    case "EMERGENCY_ROOM": locP = 5; break;
    case "OTHER_ICU": locP = 7; break;
    case "WARD": locP = 8; break; // Ward counts as Other
    case "OTHER": locP = 8; break;
  }
  p += locP;
  items.push({ key: "location", label: "Origem", value: input.locationBeforeICU, points: locP });

  // Vasoactive drugs
  if (input.vasoactiveBeforeICU) {
    p += 3;
    items.push({ key: "vasoactive", label: "Drogas Vasoativas (Pré-UTI)", value: "Sim", points: 3 });
  }

  return { points: p, items };
}

function getPointsBox2(input: Saps3Input): { points: number; items: any[] } {
  let p = 0;
  const items: any[] = [];

  // Planned/Unplanned
  // Unplanned admission: 3
  if (!input.plannedAdmission) {
    p += 3;
    items.push({ key: "unplanned", label: "Admissão Não Planejada", value: "Sim", points: 3 });
  }

  // Surgical Status
  // Scheduled (Elective) 0, Emergency 6, No surgery 5
  let surgP = 0;
  if (input.surgicalStatus === "EMERGENCY_SURGERY") surgP = 6;
  else if (input.surgicalStatus === "NO_SURGERY") surgP = 5;
  p += surgP;
  items.push({ key: "surgicalStatus", label: "Status Cirúrgico", value: input.surgicalStatus, points: surgP });

  // Anatomical Site
  // Transplant -11, Trauma -8, Cardiac -6, Neuro 5, Other 0
  let siteP = 0;
  if (input.surgicalSite === "TRANSPLANT") siteP = -11;
  else if (input.surgicalSite === "TRAUMA") siteP = -8;
  else if (input.surgicalSite === "CARDIAC_SURGERY_CABG") siteP = -6;
  else if (input.surgicalSite === "NEUROSURGERY_OR_STROKE") siteP = 5;
  p += siteP;
  if (siteP !== 0) items.push({ key: "surgicalSite", label: "Sítio Cirúrgico", value: input.surgicalSite, points: siteP });

  // Infection
  if (input.infection.nosocomial) {
    p += 4;
    items.push({ key: "infNosocomial", label: "Infecção Nosocomial", value: "Sim", points: 4 });
  }
  if (input.infection.respiratory) {
    p += 5;
    items.push({ key: "infRespiratory", label: "Infecção Respiratória", value: "Sim", points: 5 });
  }

  // Reasons
  const r = input.reasons;
  
  // Cardio
  if (r.arrhythmia) { p += -5; items.push({ key: "arrhythmia", label: "Arritmia", value: "Sim", points: -5 }); }
  
  // Shock rules:
  // Hypovolemic hemorrhagic: 3
  // Hypovolemic non-hemorrhagic: 3
  // Septic: 5
  // Anaphylactic/Mixed: 5
  // Note: Sheet says "Hypovolemic shock (hemorrhagic or non-hemorrhagic) = 3". If both? Usually distinct categories.
  if (r.hypovolemicShockHemorrhagic) { p += 3; items.push({ key: "hypoShockH", label: "Choque Hipovol. Hemorrágico", value: "Sim", points: 3 }); }
  if (r.hypovolemicShockNonHemorrhagic) { p += 3; items.push({ key: "hypoShockNH", label: "Choque Hipovol. Não-Hemorr.", value: "Sim", points: 3 }); }
  if (r.septicShock) { p += 5; items.push({ key: "septicShock", label: "Choque Séptico", value: "Sim", points: 5 }); }
  if (r.anaphylacticOrMixedOrUndefinedShock) { p += 5; items.push({ key: "otherShock", label: "Choque Anafil./Misto", value: "Sim", points: 5 }); }

  // Hepatic
  if (r.hepaticFailure) { p += 6; items.push({ key: "hepaticFailure", label: "Falência Hepática", value: "Sim", points: 6 }); }

  // Digestive
  // Acute abdomen other (3), Severe pancreatitis (9)
  if (r.acuteAbdomenOther) { p += 3; items.push({ key: "acuteAbdomen", label: "Abdome Agudo (Outro)", value: "Sim", points: 3 }); }
  if (r.severePancreatitis) { p += 9; items.push({ key: "pancreatitis", label: "Pancreatite Grave", value: "Sim", points: 9 }); }

  // Neuro
  if (r.intracranialMassEffect) { p += 10; items.push({ key: "massEffect", label: "Efeito de Massa", value: "Sim", points: 10 }); }
  if (r.focalNeurologicDeficit) { p += 7; items.push({ key: "focalDeficit", label: "Déficit Focal", value: "Sim", points: 7 }); }
  if (r.seizures) { p += -4; items.push({ key: "seizures", label: "Convulsões", value: "Sim", points: -4 }); }
  if (r.alteredMentalState) { p += 4; items.push({ key: "alteredMental", label: "Estado Mental Alterado (Coma/Delirium)", value: "Sim", points: 4 }); }

  return { points: p, items };
}

function getPointsBox3(input: Saps3Input): { points: number; items: any[] } {
  let p = 0;
  const items: any[] = [];

  // GCS
  // 3-4 (15), 5 (10), 6 (7), 7-12 (2), >=13 (0)
  // If sedated, use estimated
  const gcs = input.gcs;
  let gcsP = 0;
  if (gcs <= 4) gcsP = 15;
  else if (gcs === 5) gcsP = 10;
  else if (gcs === 6) gcsP = 7;
  else if (gcs <= 12) gcsP = 2;
  else gcsP = 0;
  
  if (gcsP > 0) items.push({ key: "gcs", label: "GCS", value: String(gcs), points: gcsP });
  p += gcsP;

  // Bilirubin
  // <2 (0), 2-5.9 (4), >=6 (5)
  const bili = input.bilirubinMgDl;
  let biliP = 0;
  if (bili >= 6) biliP = 5;
  else if (bili >= 2) biliP = 4;
  p += biliP;
  if (biliP > 0) items.push({ key: "bilirubin", label: "Bilirrubina", value: String(bili), points: biliP });

  // Temperature
  // <35 (7), >=35 (0)
  if (input.temperatureC < 35) {
    p += 7;
    items.push({ key: "temp", label: "Temperatura", value: String(input.temperatureC), points: 7 });
  }

  // Creatinine
  // <1.2 (0), 1.2-1.99 (2), 2-3.49 (7), >=3.5 (8)
  const cr = input.creatinineMgDl;
  let crP = 0;
  if (cr >= 3.5) crP = 8;
  else if (cr >= 2) crP = 7;
  else if (cr >= 1.2) crP = 2;
  p += crP;
  if (crP > 0) items.push({ key: "creatinine", label: "Creatinina", value: String(cr), points: crP });

  // HR
  // <120 (0), 120-159 (5), >=160 (7)
  const hr = input.heartRateMax;
  let hrP = 0;
  if (hr >= 160) hrP = 7;
  else if (hr >= 120) hrP = 5;
  p += hrP;
  if (hrP > 0) items.push({ key: "hr", label: "Frequência Cardíaca", value: String(hr), points: hrP });

  // WBC
  // <15 (0), >=15 (2)
  // Ensure unit conversion: if K/uL, it is same as G/L (10^3/mm3 = 10^9/L)
  const wbc = input.wbc;
  if (wbc >= 15) {
    p += 2;
    items.push({ key: "wbc", label: "Leucócitos", value: String(wbc), points: 2 });
  }

  // pH
  // <=7.25 (3), >7.25 (0)
  if (input.phMin <= 7.25) {
    p += 3;
    items.push({ key: "ph", label: "pH", value: String(input.phMin), points: 3 });
  }

  // Platelets
  // <20 (13), 20-49 (8), 50-99 (5), >=100 (0)
  const pl = input.platelets;
  let plP = 0;
  if (pl < 20) plP = 13;
  else if (pl < 50) plP = 8;
  else if (pl < 100) plP = 5;
  p += plP;
  if (plP > 0) items.push({ key: "platelets", label: "Plaquetas", value: String(pl), points: plP });

  // SBP
  // <40 (11), 40-69 (8), 70-119 (3), >=120 (0)
  const sbp = input.systolicBPMin;
  let sbpP = 0;
  if (sbp < 40) sbpP = 11;
  else if (sbp < 70) sbpP = 8;
  else if (sbp < 120) sbpP = 3;
  p += sbpP;
  if (sbpP > 0) items.push({ key: "sbp", label: "PAS", value: String(sbp), points: sbpP });

  // Oxygenation
  // MV Yes: PaO2/FiO2 < 100 (11), >=100 (7) -> Wait, sheet says:
  // "Ventilated: PaO2/FiO2 < 100 (11), >= 100 (7) ?" No.
  // Correct sheet logic (from paper/pdf):
  // MV = Yes:
  //   PaO2/FiO2 < 100 -> 11
  //   PaO2/FiO2 >= 100 -> 7 ?? Wait, this means ventilated ALWAYS gets points?
  // Let's check typical calculators.
  // Actually usually: MV Yes -> check ratio. MV No -> check PaO2.
  // RCCC site: "Ventilación mecánica: Si -> PaO2/FiO2 < 100 (+11), >=100 (+7? or 0?)"
  // Let's check the paper logic carefully.
  // Paper Box III:
  // Oxygenation:
  //   Ventilated (Yes/No)
  //   If No: PaO2 < 60 mmHg (+5)
  //   If Yes: PaO2/FiO2 < 100 (+11)
  //           PaO2/FiO2 >= 100 (???) - Actually many sources say "+7" for just being ventilated but ratio >= 100? Or is it +7 for ratio < 200?
  // Let's check RCCC source provided by user.
  // RCCC: "Ventilación mecánica: No (PaO2 < 60 mmHg: +5 puntos). Si (PaO2/FiO2 < 100: +11 puntos, >=100: +7 puntos)."
  // So yes, if MV=Yes, minimum points is 7.
  let oxP = 0;
  if (input.ventilationMechanical) {
    if (input.pao2MmHg != null && input.fio2 != null) {
      // Calc ratio
      let fio2 = input.fio2;
      if (input.fio2Unit === "PERCENT" && fio2 > 1) fio2 = fio2 / 100;
      const ratio = input.pao2MmHg / fio2;
      if (ratio < 100) oxP = 11;
      else oxP = 7;
      items.push({ key: "oxy", label: "Oxigenação (VM)", value: `P/F ${Math.round(ratio)}`, points: oxP });
    } else {
      // If missing data but MV is true, assume best case for MV? Or return missing?
      // We will assume 7 (best case for MV) if data missing but handle validation elsewhere.
      // But actually, without data we can't be sure it's not <100.
      // We will calculate 7 temporarily.
      oxP = 7; 
      items.push({ key: "oxy", label: "Oxigenação (VM)", value: "Dados pendentes", points: 7 });
    }
  } else {
    if (input.pao2MmHg != null && input.pao2MmHg < 60) {
      oxP = 5;
      items.push({ key: "oxy", label: "Oxigenação (Espont.)", value: `PaO2 ${input.pao2MmHg}`, points: 5 });
    }
  }
  p += oxP;

  return { points: p, items };
}

export function calculateSaps3(input: Saps3Input, region: Saps3Region = "CENTRAL_SOUTH_AMERICA"): Saps3Result {
  const box1 = getPointsBox1(input);
  const box2 = getPointsBox2(input);
  const box3 = getPointsBox3(input);

  const scoreTotal = box1.points + box2.points + box3.points + 16; // +16 fixed constant

  const missingFields: string[] = [];
  // Basic validation check
  if (!input.gcs) missingFields.push("GCS");
  if (!input.bilirubinMgDl) missingFields.push("Bilirrubina");
  // ... (add more strictly if needed, but 0 is valid for some fields so we check undefined in form)

  const { probability, logit } = calculateProbability(scoreTotal, region);

  const breakdown = [
    { key: "fixed", label: "Constante Admissão", value: "Fixo", points: 16 },
    ...box1.items,
    ...box2.items,
    ...box3.items
  ];

  return {
    scoreTotal,
    breakdown,
    region,
    logit,
    probability,
    missingFields
  };
}
