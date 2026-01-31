import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6)
});

const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  hospitalNome: z.string().min(2),
  cnes: z.string().min(1),
  endereco: z.string().min(5)
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });
  if (process.env.MOCK_MODE === "true") {
    const token = jwt.sign(
      { userId: "mock-user", hospitalId: "mock-hospital", email: parsed.data.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" }
    );
    return res.json({ token });
  }
  const { email, senha } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid_credentials" });
  const ok = await bcrypt.compare(senha, user.senhaHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });
  const token = jwt.sign(
    { userId: user.id, hospitalId: user.hospitalId, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "2h" }
  );
  return res.json({ token });
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  if (process.env.MOCK_MODE === "true") {
    const token = jwt.sign(
      { userId: "mock-user", hospitalId: "mock-hospital", email: parsed.data.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    return res.json({ token, user: { name: parsed.data.nome, email: parsed.data.email } });
  }

  const { nome, email, senha, hospitalNome, cnes, endereco } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "email_already_in_use" });

  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(senha, salt);

  // Transaction to create hospital and user together
  const user = await prisma.$transaction(async (tx) => {
    const hospital = await tx.hospital.create({
      data: { nome: hospitalNome, cnes, endereco }
    });
    return await tx.user.create({
      data: {
        nome,
        email,
        senhaHash,
        hospitalId: hospital.id
      }
    });
  });

  const token = jwt.sign(
    { userId: user.id, hospitalId: user.hospitalId, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return res.json({ token, user: { name: user.nome, email: user.email } });
});

export default router;
