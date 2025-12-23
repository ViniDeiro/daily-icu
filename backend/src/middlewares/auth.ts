import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../types";

export function auth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthUser;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

