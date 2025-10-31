import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./env";

type Payload = { sub: string; identifier: string; role: "admin" | "user" };

export function signToken(payload: Payload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  // Caduca en 7 días; ajusta a tu política
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
