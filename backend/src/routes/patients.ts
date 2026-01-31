import { Router } from "express";
import { z } from "zod";
import { auth } from "../middlewares/auth";
import { requireHospital } from "../middlewares/tenant";
import { prisma } from "../prisma";
import { randomUUID } from "crypto";

const router = Router();

type MockPatient = {
  id: string;
  nome: string;
  cpf?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  endereco?: string | null;
  registroHospitalar: string;
  leito?: string | null;
  dataNascimento: string;
  dataInternacaoHospitalar: string | null;
  dataInternacaoUti: string | null;
  previsaoAlta?: string | null;
  alergias?: string | null;
  hospitalId: string;
  setor: string;
  createdAt: string;
  saps3Atual?: number | null;
  mortalidadeEstimada?: number | null;
};

const mockPatients: MockPatient[] = [
  {
    id: "p1",
    nome: "Soares da Silva Souza",
    cpf: "123.456.789-00",
    nomeMae: "Maria Silva",
    registroHospitalar: "64111",
    leito: "10",
    dataNascimento: "1952-01-01",
    dataInternacaoHospitalar: "2025-11-27",
    dataInternacaoUti: "2025-12-01",
    previsaoAlta: "2025-12-20",
    alergias: "Dipirona",
    hospitalId: "mock-hospital",
    setor: "UTI",
    createdAt: "2025-12-15T07:00:00.000Z",
    saps3Atual: 78,
    mortalidadeEstimada: 83.5
  },
  {
    id: "p2",
    nome: "Zilda de Oliveira Zocatelli",
    cpf: "987.654.321-99",
    nomeMae: "Joana Oliveira",
    registroHospitalar: "359245",
    leito: "03",
    dataNascimento: "1949-01-01",
    dataInternacaoHospitalar: "2025-11-28",
    dataInternacaoUti: "2025-12-10",
    previsaoAlta: null,
    alergias: null,
    hospitalId: "mock-hospital",
    setor: "UTI",
    createdAt: "2025-12-15T07:05:00.000Z",
    saps3Atual: 54,
    mortalidadeEstimada: 33.1
  },
  {
    id: "p3",
    nome: "José Nobre da Silva",
    registroHospitalar: "45528",
    leito: "07",
    dataNascimento: "1962-01-01",
    dataInternacaoHospitalar: "2025-11-29",
    dataInternacaoUti: "2025-11-26",
    previsaoAlta: null,
    alergias: "Sem alergias conhecidas",
    hospitalId: "mock-hospital",
    setor: "UTI",
    createdAt: "2025-12-15T07:10:00.000Z",
    saps3Atual: 64,
    mortalidadeEstimada: 57.8
  }
];

const createSchema = z.object({
  nome: z.string().min(1),
  cpf: z.string().min(11),
  nomeMae: z.string().min(1),
  nomePai: z.string().optional(),
  endereco: z.string().optional(),
  registroHospitalar: z.string().min(1),
  leito: z.string().optional(),
  dataNascimento: z.string(),
  dataInternacaoHospitalar: z.string().optional(),
  dataInternacaoUti: z.string().optional(),
  previsaoAlta: z.string().optional(),
  alergias: z.string().optional(),
  setor: z.string().default("UTI")
});

router.get("/", auth, requireHospital, async (req, res) => {
  if (process.env.MOCK_MODE === "true") {
    return res.json(mockPatients.filter((p) => p.hospitalId === req.user!.hospitalId));
  }
  const pacientes = await prisma.paciente.findMany({
    where: { hospitalId: req.user!.hospitalId },
    orderBy: { createdAt: "desc" }
  });
  res.json(pacientes);
});

router.post("/", auth, requireHospital, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  const b = parsed.data;
  if (process.env.MOCK_MODE === "true") {
    const paciente: MockPatient = {
      id: randomUUID(),
      nome: b.nome,
      cpf: b.cpf,
      nomeMae: b.nomeMae,
      nomePai: b.nomePai || null,
      endereco: b.endereco || null,
      registroHospitalar: b.registroHospitalar,
      leito: b.leito ?? null,
      dataNascimento: b.dataNascimento,
      dataInternacaoHospitalar: b.dataInternacaoHospitalar || null,
      dataInternacaoUti: b.dataInternacaoUti || null,
      previsaoAlta: b.previsaoAlta || null,
      alergias: b.alergias || null,
      hospitalId: req.user!.hospitalId,
      setor: b.setor,
      createdAt: new Date().toISOString(),
      saps3Atual: null,
      mortalidadeEstimada: null
    };
    mockPatients.unshift(paciente);
    return res.status(201).json(paciente);
  }
  const paciente = await prisma.paciente.create({
    data: {
      nome: b.nome,
      cpf: b.cpf,
      nomeMae: b.nomeMae,
      nomePai: b.nomePai,
      endereco: b.endereco,
      registroHospitalar: b.registroHospitalar,
      leito: b.leito ?? null,
      dataNascimento: new Date(b.dataNascimento),
      dataInternacaoHospitalar: b.dataInternacaoHospitalar ? new Date(b.dataInternacaoHospitalar) : null,
      dataInternacaoUti: b.dataInternacaoUti ? new Date(b.dataInternacaoUti) : null,
      previsaoAlta: b.previsaoAlta ? new Date(b.previsaoAlta) : null,
      alergias: b.alergias ?? null,
      hospitalId: req.user!.hospitalId,
      setor: b.setor
    }
  });
  await prisma.pacienteBaseClinica.create({
    data: {
      pacienteId: paciente.id,
      dispositivos: []
    }
  });
  res.status(201).json(paciente);
});

router.get("/:id", auth, requireHospital, async (req, res) => {
  if (process.env.MOCK_MODE === "true") {
    const p = mockPatients.find((p) => p.id === req.params.id && p.hospitalId === req.user!.hospitalId);
    if (!p) return res.status(404).json({ error: "not_found" });
    return res.json(p);
  }
  const p = await prisma.paciente.findFirst({
    where: { id: req.params.id, hospitalId: req.user!.hospitalId },
    include: { baseClinica: true }
  });
  if (!p) return res.status(404).json({ error: "not_found" });
  res.json(p);
});

export default router;
