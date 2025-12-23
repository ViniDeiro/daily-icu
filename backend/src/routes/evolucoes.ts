import { Router } from "express";
import { z } from "zod";
import { auth } from "../middlewares/auth";
import { requireHospital } from "../middlewares/tenant";
import { prisma } from "../prisma";
import { duplicateFromBase, duplicateFromLast } from "../services/evolucao";
import { randomUUID } from "crypto";

const router = Router();

type MockDay = {
  id: string;
  pacienteId: string;
  data: string;
  diaInternacaoUti: number;
  condutaDiaria: string | null;
  saps3: number | null;
  diagnosticoPrincipal: string | null;
  diagnosticosSecundarios: string | null;
  comorbidades: string | null;
  hda: string | null;
  hpp: string | null;
  muc: string | null;
  neurologico: string | null;
  respiratorio: string | null;
  cardiovascular: string | null;
  renal: string | null;
  gastrointestinal: string | null;
  infectologico: string | null;
  exames: string | null;
  drogasVasoativas: boolean;
  drogasVasoativasDescricao: string | null;
  ventilacaoMecanica: boolean;
  viaAerea: "IOT" | "TQT" | "NENHUMA";
  dispositivos: string[];
  createdAt: string;
};

function isoDay(d: string) {
  return new Date(`${d}T08:00:00.000Z`).toISOString();
}

const mockDaysByPatientId: Record<string, MockDay[]> = {
  p1: [
    {
      id: "p1-d15",
      pacienteId: "p1",
      data: isoDay("2025-12-15"),
      diaInternacaoUti: 15,
      saps3: 78,
      diagnosticoPrincipal: "Choque séptico de foco pulmonar?",
      diagnosticosSecundarios:
        "RNC a/e -> descartado meningite\nIOT+VM 25/11 (extubado 04/12 20:30)\nCulturas com Pseudomonas (SET 05/12)",
      comorbidades: "Doença de Parkinson",
      hda: "Admitido por insuficiência respiratória e instabilidade hemodinâmica.",
      hpp: "Parkinson. Sem outras comorbidades relevantes conhecidas.",
      muc: "Sem informações adicionais relevantes.",
      neurologico: "Acordado, sem déficit focal, RASS 0.",
      respiratorio: "Sem VM, em ar ambiente. SatO2 > 94%.",
      cardiovascular: "DVA em desmame. PAM alvo 65.",
      renal: "Diurese preservada, sem diálise.",
      gastrointestinal: "Dieta enteral em progressão.",
      infectologico: "Em acompanhamento de foco pulmonar; culturas prévias com Pseudomonas.",
      exames: "Sem exames críticos novos.",
      drogasVasoativas: true,
      drogasVasoativasDescricao: "Noradrenalina",
      ventilacaoMecanica: false,
      viaAerea: "NENHUMA",
      dispositivos: ["CVC VSCD 06/12/2025", "SVD 26/11/2025", "SNE 27/11/2025"],
      condutaDiaria:
        "(15/12) Tentar progredir desmame de Noradrenalina/ Correção DHEL - Hipocalemia/ Tratamento de LPP sacral Grau II/ Controle glicêmico/ BH neutro/ Inserir CROSS para RNM",
      createdAt: isoDay("2025-12-15")
    },
    {
      id: "p1-d14",
      pacienteId: "p1",
      data: isoDay("2025-12-14"),
      diaInternacaoUti: 14,
      saps3: 78,
      diagnosticoPrincipal: "Choque séptico de foco pulmonar?",
      diagnosticosSecundarios:
        "Extubado 04/12\nVigilância neurológica, renal e infecciosa\nProgramação de RNM",
      comorbidades: "Doença de Parkinson",
      hda: "Admitido por insuficiência respiratória e instabilidade hemodinâmica.",
      hpp: "Parkinson.",
      muc: "Sem informações adicionais relevantes.",
      neurologico: "Vigilância neurológica.",
      respiratorio: "Em desmame de O2.",
      cardiovascular: "Em desmame de DVA.",
      renal: "Vigilância renal.",
      gastrointestinal: "Dieta conforme tolerância.",
      infectologico: "Vigilância infecciosa.",
      exames: "Sem exames críticos novos.",
      drogasVasoativas: true,
      drogasVasoativasDescricao: "Noradrenalina",
      ventilacaoMecanica: false,
      viaAerea: "NENHUMA",
      dispositivos: ["CVC VSCD 06/12/2025", "SVD 26/11/2025", "SNE 27/11/2025"],
      condutaDiaria:
        "(14/12) Vigilância neurológica, renal e infecciosa/ Medidas neuroprotetoras/ Correção DHEL/ Tratamento de LPP sacral Grau II",
      createdAt: isoDay("2025-12-14")
    }
  ],
  p2: [
    {
      id: "p2-d6",
      pacienteId: "p2",
      data: isoDay("2025-12-15"),
      diaInternacaoUti: 6,
      saps3: 54,
      diagnosticoPrincipal: "Choque hipovolêmico por sangramento TGI",
      diagnosticosSecundarios: "ICFER descompensada?\nPNM\nDHEL (hiponatremia)\nHDB",
      comorbidades: "HAS",
      hda: "Admitida por sangramento digestivo com instabilidade hemodinâmica.",
      hpp: "HAS.",
      muc: "Sem informações adicionais relevantes.",
      neurologico: "Lúcida, orientada.",
      respiratorio: "Sem VM, em O2 sob cânula se necessário.",
      cardiovascular: "Sem DVA.",
      renal: "Vigilância renal.",
      gastrointestinal: "Pós EDA; dieta liberada conforme fono.",
      infectologico: "Vigilância infecciosa.",
      exames: "Hb em acompanhamento.",
      drogasVasoativas: false,
      drogasVasoativasDescricao: null,
      ventilacaoMecanica: false,
      viaAerea: "NENHUMA",
      dispositivos: ["CVC VJID 09/12/2025", "SVD 28/11/2025"],
      condutaDiaria:
        "(15/12) Seguimento com Cirurgia Geral/ Vigilância renal e infecciosa/ Correção DHEL - Hipocalemia e Hipernatremia/ EDA 12/12 erosão plana bulbar (Forrest III)/ Manter IBP pleno/ Liberar dieta/ Avaliação da fono -> Dieta líquida/ Controle glicêmico/ BH neutro",
      createdAt: isoDay("2025-12-15")
    },
    {
      id: "p2-d5",
      pacienteId: "p2",
      data: isoDay("2025-12-12"),
      diaInternacaoUti: 3,
      saps3: 54,
      diagnosticoPrincipal: "Choque hipovolêmico por sangramento TGI",
      diagnosticosSecundarios: "Aguarda EDA\nDesmame de O2\nVigilância infecciosa/renal",
      comorbidades: "HAS",
      hda: "Sangramento digestivo alto.",
      hpp: "HAS.",
      muc: "Sem informações adicionais relevantes.",
      neurologico: "Lúcida.",
      respiratorio: "Desmame de O2.",
      cardiovascular: "Sem DVA.",
      renal: "Vigilância renal.",
      gastrointestinal: "Aguarda EDA.",
      infectologico: "Vigilância infecciosa.",
      exames: "Sem exames críticos novos.",
      drogasVasoativas: false,
      drogasVasoativasDescricao: null,
      ventilacaoMecanica: false,
      viaAerea: "NENHUMA",
      dispositivos: ["CVC VJID 09/12/2025", "SVD 28/11/2025"],
      condutaDiaria:
        "(12/12) Aguarda Ecocardio/ Aguarda EDA/ Vigilância infecciosa e renal/ Desmame de O2/ Correção DHEL - Hipocalemia/ IBP pleno",
      createdAt: isoDay("2025-12-12")
    }
  ],
  p3: [
    {
      id: "p3-d20",
      pacienteId: "p3",
      data: isoDay("2025-12-15"),
      diaInternacaoUti: 20,
      saps3: 64,
      diagnosticoPrincipal: "Rebaixamento do nível de consciência (crise convulsiva? hipóxia?)",
      diagnosticosSecundarios:
        "Pneumonia aspirativa?\nFAARV revertida quimicamente\nDHEL - hipernatremia\nIRA KDIGO III\nPolineuromiopatia",
      comorbidades: "Epilepsia; rinite alérgica; tabagista (DPOC?)",
      hda: "Admitido por RNC com suspeita de crise convulsiva.",
      hpp: "Epilepsia; tabagismo.",
      muc: "Sem informações adicionais relevantes.",
      neurologico: "Vigilância neurológica; sedação conforme necessidade.",
      respiratorio: "Em VM; parâmetros em ajuste.",
      cardiovascular: "DVA em uso conforme estabilidade.",
      renal: "IRA KDIGO III; vigilância de diurese.",
      gastrointestinal: "Dieta enteral conforme tolerância.",
      infectologico: "Ajuste ATB conforme culturas.",
      exames: "Sem exames críticos novos.",
      drogasVasoativas: true,
      drogasVasoativasDescricao: "Noradrenalina",
      ventilacaoMecanica: true,
      viaAerea: "IOT",
      dispositivos: ["TOT (reintubado 03/12)", "CVC", "SVD"],
      condutaDiaria:
        "Vigilância neurológica e ventilatória/ Ajuste de ATB conforme culturas/ Correção DHEL/ Avaliar desmame de DVA conforme estabilidade",
      createdAt: isoDay("2025-12-15")
    },
    {
      id: "p3-d19",
      pacienteId: "p3",
      data: isoDay("2025-12-14"),
      diaInternacaoUti: 19,
      saps3: 64,
      diagnosticoPrincipal: "Pneumonia aspirativa?",
      diagnosticosSecundarios: "IRA KDIGO III\nPolineuromiopatia",
      comorbidades: "Epilepsia; tabagista (DPOC?)",
      hda: "Pneumonia aspirativa em acompanhamento.",
      hpp: "Epilepsia; tabagismo.",
      muc: "Sem informações adicionais relevantes.",
      neurologico: "Vigilância neurológica.",
      respiratorio: "Em VM.",
      cardiovascular: "DVA em uso.",
      renal: "IRA KDIGO III.",
      gastrointestinal: "Dieta enteral.",
      infectologico: "Vigilância infecciosa.",
      exames: "Sem exames críticos novos.",
      drogasVasoativas: true,
      drogasVasoativasDescricao: "Noradrenalina",
      ventilacaoMecanica: true,
      viaAerea: "IOT",
      dispositivos: ["TOT", "CVC", "SVD"],
      condutaDiaria: "Manter VM/ Fisioterapia respiratória/ Vigilância renal e infecciosa",
      createdAt: isoDay("2025-12-14")
    }
  ]
};

const createDaySchema = z.object({
  data: z.string(),
  condutaDiaria: z.string().optional()
});

router.get("/patients/:id/days", auth, requireHospital, async (req, res) => {
  if (process.env.MOCK_MODE === "true") {
    const list = mockDaysByPatientId[req.params.id] ?? [];
    const sorted = [...list].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return res.json(sorted);
  }
  const paciente = await prisma.paciente.findFirst({
    where: { id: req.params.id, hospitalId: req.user!.hospitalId }
  });
  if (!paciente) return res.status(404).json({ error: "patient_not_found" });
  const days = await prisma.evolucaoDiaria.findMany({
    where: { pacienteId: paciente.id },
    orderBy: { data: "desc" }
  });
  res.json(days);
});

router.post("/patients/:id/days", auth, requireHospital, async (req, res) => {
  const parsed = createDaySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  if (process.env.MOCK_MODE === "true") {
    const data = new Date(parsed.data.data);
    const list = (mockDaysByPatientId[req.params.id] ??= []);
    const last = [...list].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0] ?? null;
    const diaInternacaoUti = (last?.diaInternacaoUti ?? list.length) + 1;
    const duplicated = duplicateFromLast(last as any);
    const created: MockDay = {
      id: randomUUID(),
      pacienteId: req.params.id,
      data: data.toISOString(),
      diaInternacaoUti,
      condutaDiaria: parsed.data.condutaDiaria ?? "",
      saps3: duplicated.saps3 ?? null,
      diagnosticoPrincipal: duplicated.diagnosticoPrincipal ?? null,
      diagnosticosSecundarios: duplicated.diagnosticosSecundarios ?? null,
      comorbidades: duplicated.comorbidades ?? null,
      hda: duplicated.hda ?? null,
      hpp: duplicated.hpp ?? null,
      muc: duplicated.muc ?? null,
      neurologico: duplicated.neurologico ?? null,
      respiratorio: duplicated.respiratorio ?? null,
      cardiovascular: duplicated.cardiovascular ?? null,
      renal: duplicated.renal ?? null,
      gastrointestinal: duplicated.gastrointestinal ?? null,
      infectologico: duplicated.infectologico ?? null,
      exames: duplicated.exames ?? null,
      drogasVasoativas: duplicated.drogasVasoativas ?? false,
      drogasVasoativasDescricao: duplicated.drogasVasoativasDescricao ?? null,
      ventilacaoMecanica: duplicated.ventilacaoMecanica ?? false,
      viaAerea: duplicated.viaAerea ?? "NENHUMA",
      dispositivos: duplicated.dispositivos ?? [],
      createdAt: new Date().toISOString()
    };
    list.push(created);
    const sorted = [...list].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    mockDaysByPatientId[req.params.id] = sorted;
    return res.status(201).json(created);
  }
  const paciente = await prisma.paciente.findFirst({
    where: { id: req.params.id, hospitalId: req.user!.hospitalId }
  });
  if (!paciente) return res.status(404).json({ error: "patient_not_found" });
  const data = new Date(parsed.data.data);
  const base = await prisma.pacienteBaseClinica.findUnique({ where: { pacienteId: paciente.id } });
  const last = await prisma.evolucaoDiaria.findFirst({
    where: { pacienteId: paciente.id, data: { lt: data } },
    orderBy: { data: "desc" }
  });
  const count = await prisma.evolucaoDiaria.count({ where: { pacienteId: paciente.id } });
  const diaInternacaoUti = count + 1;
  const duplicated = last ? duplicateFromLast(last) : duplicateFromBase(base);
  const created = await prisma.evolucaoDiaria.create({
    data: {
      pacienteId: paciente.id,
      data,
      diaInternacaoUti,
      condutaDiaria: parsed.data.condutaDiaria ?? "",
      ...duplicated
    }
  });
  res.status(201).json(created);
});

router.post("/patients/:id/days/:dayId/copy-conduta", auth, requireHospital, async (req, res) => {
  if (process.env.MOCK_MODE === "true") {
    const list = mockDaysByPatientId[req.params.id] ?? [];
    const day = list.find((d) => d.id === req.params.dayId);
    if (!day) return res.status(404).json({ error: "day_not_found" });
    const prev = [...list]
      .filter((d) => new Date(d.data).getTime() < new Date(day.data).getTime())
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
    return res.json({ conduta: prev?.condutaDiaria ?? "" });
  }
  const paciente = await prisma.paciente.findFirst({
    where: { id: req.params.id, hospitalId: req.user!.hospitalId }
  });
  if (!paciente) return res.status(404).json({ error: "patient_not_found" });
  const day = await prisma.evolucaoDiaria.findFirst({
    where: { id: req.params.dayId, pacienteId: paciente.id }
  });
  if (!day) return res.status(404).json({ error: "day_not_found" });
  const prev = await prisma.evolucaoDiaria.findFirst({
    where: { pacienteId: paciente.id, data: { lt: day.data } },
    orderBy: { data: "desc" }
  });
  if (!prev || !prev.condutaDiaria) return res.json({ conduta: "" });
  res.json({ conduta: prev.condutaDiaria });
});

router.put("/patients/:id/days/:dayId", auth, requireHospital, async (req, res) => {
  const override = req.query.override === "true";
  if (process.env.MOCK_MODE === "true") {
    const list = mockDaysByPatientId[req.params.id] ?? [];
    const idx = list.findIndex((d) => d.id === req.params.dayId);
    if (idx < 0) return res.status(404).json({ error: "day_not_found" });
    const day = list[idx];
    const isRetro = new Date(day.data).toDateString() !== new Date().toDateString();
    if (isRetro && !override) return res.status(409).json({ error: "retro_edit_blocked" });
    const body = req.body as Partial<{
      condutaDiaria: string;
      saps3: number | null;
      diagnosticoPrincipal: string | null;
      diagnosticosSecundarios: string | null;
      comorbidades: string | null;
      hda: string | null;
      hpp: string | null;
      muc: string | null;
      neurologico: string | null;
      respiratorio: string | null;
      cardiovascular: string | null;
      renal: string | null;
      gastrointestinal: string | null;
      infectologico: string | null;
      exames: string | null;
      drogasVasoativas: boolean;
      drogasVasoativasDescricao: string | null;
      ventilacaoMecanica: boolean;
      viaAerea: "IOT" | "TQT" | "NENHUMA";
      dispositivos: string[];
    }>;
    const updated: MockDay = {
      ...day,
      condutaDiaria: body.condutaDiaria ?? day.condutaDiaria,
      saps3: body.saps3 !== undefined ? (body.saps3 as any) : day.saps3,
      diagnosticoPrincipal: body.diagnosticoPrincipal ?? day.diagnosticoPrincipal,
      diagnosticosSecundarios: body.diagnosticosSecundarios ?? day.diagnosticosSecundarios,
      comorbidades: body.comorbidades ?? day.comorbidades,
      hda: body.hda ?? day.hda,
      hpp: body.hpp ?? day.hpp,
      muc: body.muc ?? day.muc,
      neurologico: body.neurologico ?? day.neurologico,
      respiratorio: body.respiratorio ?? day.respiratorio,
      cardiovascular: body.cardiovascular ?? day.cardiovascular,
      renal: body.renal ?? day.renal,
      gastrointestinal: body.gastrointestinal ?? day.gastrointestinal,
      infectologico: body.infectologico ?? day.infectologico,
      exames: body.exames ?? day.exames,
      drogasVasoativas: body.drogasVasoativas ?? day.drogasVasoativas,
      drogasVasoativasDescricao: body.drogasVasoativasDescricao ?? day.drogasVasoativasDescricao,
      ventilacaoMecanica: body.ventilacaoMecanica ?? day.ventilacaoMecanica,
      viaAerea: body.viaAerea ?? day.viaAerea,
      dispositivos: body.dispositivos ?? day.dispositivos
    };
    list[idx] = updated;
    mockDaysByPatientId[req.params.id] = list;
    return res.json(updated);
  }
  const paciente = await prisma.paciente.findFirst({
    where: { id: req.params.id, hospitalId: req.user!.hospitalId }
  });
  if (!paciente) return res.status(404).json({ error: "patient_not_found" });
  const day = await prisma.evolucaoDiaria.findFirst({
    where: { id: req.params.dayId, pacienteId: paciente.id }
  });
  if (!day) return res.status(404).json({ error: "day_not_found" });
  const isRetro = new Date(day.data).toDateString() !== new Date().toDateString();
  if (isRetro && !override) {
    return res.status(409).json({ error: "retro_edit_blocked" });
  }
  const body = req.body as Partial<{
    condutaDiaria: string;
    saps3: number;
    diagnosticoPrincipal: string;
    diagnosticosSecundarios: string;
    comorbidades: string;
    hda: string;
    hpp: string;
    muc: string;
    neurologico: string;
    respiratorio: string;
    cardiovascular: string;
    renal: string;
    gastrointestinal: string;
    infectologico: string;
    exames: string;
    drogasVasoativas: boolean;
    drogasVasoativasDescricao: string | null;
    ventilacaoMecanica: boolean;
    viaAerea: "IOT" | "TQT" | "NENHUMA";
    dispositivos: string[];
  }>;
  const updated = await prisma.evolucaoDiaria.update({
    where: { id: day.id },
    data: {
      condutaDiaria: body.condutaDiaria ?? day.condutaDiaria ?? null,
      saps3: body.saps3 ?? day.saps3 ?? null,
      diagnosticoPrincipal: body.diagnosticoPrincipal ?? day.diagnosticoPrincipal ?? null,
      diagnosticosSecundarios: body.diagnosticosSecundarios ?? day.diagnosticosSecundarios ?? null,
      comorbidades: body.comorbidades ?? day.comorbidades ?? null,
      hda: body.hda ?? day.hda ?? null,
      hpp: body.hpp ?? day.hpp ?? null,
      muc: body.muc ?? day.muc ?? null,
      neurologico: body.neurologico ?? day.neurologico ?? null,
      respiratorio: body.respiratorio ?? day.respiratorio ?? null,
      cardiovascular: body.cardiovascular ?? day.cardiovascular ?? null,
      renal: body.renal ?? day.renal ?? null,
      gastrointestinal: body.gastrointestinal ?? day.gastrointestinal ?? null,
      infectologico: body.infectologico ?? day.infectologico ?? null,
      exames: body.exames ?? day.exames ?? null,
      drogasVasoativas: body.drogasVasoativas ?? day.drogasVasoativas,
      drogasVasoativasDescricao: body.drogasVasoativasDescricao ?? day.drogasVasoativasDescricao ?? null,
      ventilacaoMecanica: body.ventilacaoMecanica ?? day.ventilacaoMecanica,
      viaAerea: body.viaAerea ?? day.viaAerea,
      dispositivos: body.dispositivos ?? day.dispositivos
    }
  });
  await prisma.pacienteBaseClinica.upsert({
    where: { pacienteId: paciente.id },
    create: {
      pacienteId: paciente.id,
      saps3: updated.saps3 ?? null,
      diagnosticoPrincipal: updated.diagnosticoPrincipal ?? null,
      diagnosticosSecundarios: updated.diagnosticosSecundarios ?? null,
      comorbidades: updated.comorbidades ?? null,
      hda: updated.hda ?? null,
      hpp: updated.hpp ?? null,
      muc: updated.muc ?? null,
      drogasVasoativas: updated.drogasVasoativas,
      drogasVasoativasDescricao: updated.drogasVasoativasDescricao ?? null,
      ventilacaoMecanica: updated.ventilacaoMecanica,
      viaAerea: updated.viaAerea,
      dispositivos: updated.dispositivos
    },
    update: {
      saps3: updated.saps3 ?? null,
      diagnosticoPrincipal: updated.diagnosticoPrincipal ?? null,
      diagnosticosSecundarios: updated.diagnosticosSecundarios ?? null,
      comorbidades: updated.comorbidades ?? null,
      hda: updated.hda ?? null,
      hpp: updated.hpp ?? null,
      muc: updated.muc ?? null,
      drogasVasoativas: updated.drogasVasoativas,
      drogasVasoativasDescricao: updated.drogasVasoativasDescricao ?? null,
      ventilacaoMecanica: updated.ventilacaoMecanica,
      viaAerea: updated.viaAerea,
      dispositivos: updated.dispositivos
    }
  });
  res.json(updated);
});

export default router;
