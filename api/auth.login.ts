// api/auth/login.ts (o el archivo donde tengas el handler)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Define admins “de verdad”
const ADMIN_EMAILS = new Set([
  'metepec_ventas29@qualitas.com.mx',
  'metepec_ventas20@qualitas.com.mx',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  // Demo: password fijo
  if (password !== 'demo1234') return res.status(401).json({ error: 'Credenciales inválidas' });

  const role = ADMIN_EMAILS.has(String(email).toLowerCase()) ? 'admin' : 'user';

  const token = jwt.sign(
    { sub: email, role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(200).json({
    token,
    user: { email, role }
  });
}
