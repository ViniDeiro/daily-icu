import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import rateLimit from "express-rate-limit";
import hospitals from "./routes/hospitals";
import patients from "./routes/patients";
import evolucoes from "./routes/evolucoes";
import authRoutes from "./routes/auth";

const app = express();
const logger = pino();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120
  })
);

app.use("/auth", authRoutes);
app.use("/hospitals", hospitals);
app.use("/patients", patients);
app.use("/", evolucoes);

app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;
