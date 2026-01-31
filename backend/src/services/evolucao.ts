import { EvolucaoDiaria, PacienteBaseClinica } from "@prisma/client";

export function duplicateFromLast(last: EvolucaoDiaria | null) {
  return {
    saps3: last?.saps3 ?? null,
    diagnosticoPrincipal: last?.diagnosticoPrincipal ?? null,
    diagnosticosSecundarios: last?.diagnosticosSecundarios ?? null,
    comorbidades: last?.comorbidades ?? null,
    hda: last?.hda ?? null,
    hpp: last?.hpp ?? null,
    muc: last?.muc ?? null,
    neurologico: last?.neurologico ?? null,
    respiratorio: last?.respiratorio ?? null,
    cardiovascular: last?.cardiovascular ?? null,
    renal: last?.renal ?? null,
    gastrointestinal: last?.gastrointestinal ?? null,
    infectologico: last?.infectologico ?? null,
    exames: last?.exames ?? null,
    drogasVasoativas: last?.drogasVasoativas ?? false,
    drogasVasoativasDescricao: last?.drogasVasoativasDescricao ?? null,
    inotropicos: last?.inotropicos ?? null,
    antibioticos: last?.antibioticos ?? null,
    previos: last?.previos ?? null,
    culturas: last?.culturas ?? null,
    diurese: last?.diurese ?? null,
    ventilacaoMecanica: last?.ventilacaoMecanica ?? false,
    viaAerea: last?.viaAerea ?? "NENHUMA",
    dispositivos: last?.dispositivos ?? []
  };
}

export function duplicateFromBase(base: PacienteBaseClinica | null) {
  return {
    saps3: base?.saps3 ?? null,
    diagnosticoPrincipal: base?.diagnosticoPrincipal ?? null,
    diagnosticosSecundarios: base?.diagnosticosSecundarios ?? null,
    comorbidades: base?.comorbidades ?? null,
    hda: base?.hda ?? null,
    hpp: base?.hpp ?? null,
    muc: base?.muc ?? null,
    drogasVasoativas: base?.drogasVasoativas ?? false,
    drogasVasoativasDescricao: base?.drogasVasoativasDescricao ?? null,
    inotropicos: base?.inotropicos ?? null,
    antibioticos: base?.antibioticos ?? null,
    previos: base?.previos ?? null,
    culturas: base?.culturas ?? null,
    diurese: base?.diurese ?? null,
    ventilacaoMecanica: base?.ventilacaoMecanica ?? false,
    viaAerea: base?.viaAerea ?? "NENHUMA",
    dispositivos: base?.dispositivos ?? []
  };
}
