import { Router } from "express";
import { auth } from "../middlewares/auth";
import { prisma } from "../prisma";

const router = Router();

router.get("/", auth, async (req, res) => {
  if (process.env.MOCK_MODE === "true") {
    return res.json([
      { id: "mock-hospital", nome: "Hospital Exemplo" },
      { id: "mock-hospital-2", nome: "Hospital Demo" }
    ]);
  }
  const hospitals = await prisma.hospital.findMany({
    orderBy: { nome: "asc" }
  });
  res.json(hospitals);
});

export default router;
