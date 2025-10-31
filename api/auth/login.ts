
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { findUserByIdentifier, sanitizeUser } from "../_utils/users";
import { signToken } from "../_utils/jwt";

const LoginSchema = z.object({
  identifier: z.string().min(3, "Usuario requerido"),
  password:   z.string().min(3, "Contraseña requerida")
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0]?.message || "Payload inválido" });
  }

  const { identifier, password } = parse.data;

  const user = findUserByIdentifier(identifier);
  // Demostración: validación simple en texto plano
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const publicUser = sanitizeUser(user);
  const token = signToken({ sub: publicUser.id, identifier: publicUser.identifier, role: publicUser.role });

  // Opcional pro: setear cookie httpOnly para sesiones server-side futuras
  const week = 7 * 24 * 60 * 60;
  res.setHeader("Set-Cookie", [
    helpdesk_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${week}
  ]);

  return res.status(200).json({ token, user: publicUser });
}
