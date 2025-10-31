import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-vercel';

type Role = 'admin' | 'user';

const USERS: Record<string, { password: string; role: Role; name: string }> = {
  'admin@qualitas.com': { password: 'admin123', role: 'admin', name: 'Admin QA' },
  'user@qualitas.com':  { password: 'user123',  role: 'user',  name: 'User QA' },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  const u = USERS[email as string];
  if (!u || u.password !== password) {
    return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ sub: email, role: u.role, name: u.name }, JWT_SECRET, { expiresIn: '1d' });
  res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,           // en prod sobre HTTPS
    path: '/',
    maxAge: 60 * 60 * 24,   // 1 día
  }));

  return res.status(200).json({ ok: true });
}
