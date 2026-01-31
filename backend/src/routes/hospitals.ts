import { Router } from "express";
import { z } from "zod";
import { auth } from "../middlewares/auth";
import { prisma } from "../prisma";
import { randomUUID } from "crypto";

const router = Router();

const createSchema = z.object({
  nome: z.string().min(1),
  cnes: z.string().min(1),
  endereco: z.string().min(1)
});

router.get("/", auth, async (req, res) => {
  if (process.env.MOCK_MODE === "true") {
    return res.json([
      { id: "mock-hospital", nome: "Hospital Exemplo", cnes: "123456", endereco: "Rua Exemplo, 123" },
      { id: "mock-hospital-2", nome: "Hospital Demo", cnes: "654321", endereco: "Av Demo, 456" }
    ]);
  }
  const hospitals = await prisma.hospital.findMany({
    orderBy: { nome: "asc" }
  });
  res.json(hospitals);
});

router.post("/", auth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  
  if (process.env.MOCK_MODE === "true") {
    const newHospital = {
      id: randomUUID(),
      nome: parsed.data.nome,
      cnes: parsed.data.cnes,
      endereco: parsed.data.endereco,
      createdAt: new Date().toISOString()
    };
    return res.status(201).json(newHospital);
  }

  const hospital = await prisma.hospital.create({
    data: {
      nome: parsed.data.nome,
      cnes: parsed.data.cnes,
      endereco: parsed.data.endereco
    }
  });
  res.status(201).json(hospital);
});

export default router;
