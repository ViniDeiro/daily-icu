import { Request, Response, NextFunction } from "express";

export function requireHospital(req: Request, res: Response, next: NextFunction) {
  const headerHospitalId = req.header("x-hospital-id");
  if (headerHospitalId && process.env.MOCK_MODE === "true") {
    if (req.user) req.user.hospitalId = headerHospitalId;
  }
  if (!req.user?.hospitalId) {
    return res.status(403).json({ error: "hospital_required" });
  }
  next();
}
