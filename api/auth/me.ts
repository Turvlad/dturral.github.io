
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken } from "../_utils/jwt";
import { findUserByIdentifier, sanitizeUser } from "../_utils/users";

function extractToken(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)helpdesk_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "No autenticado" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Token inválido" });

  const user = findUserByIdentifier(payload.identifier);
  if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

  return res.status(200).json({ user: sanitizeUser(user) });
}
