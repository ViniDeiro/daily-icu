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

export default router;
