import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-vercel';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const raw = req.headers.cookie || '';
    const cookie = Object.fromEntries(raw.split(';').map(v => v.trim().split('=')));
    const token = cookie['auth'];
    if (!token) return res.status(401).json({ ok: false });

    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: 'admin'|'user'; name: string };
    return res.status(200).json({ ok: true, user: { email: payload.sub, role: payload.role, name: payload.name } });
  } catch {
    return res.status(401).json({ ok: false });
  }
}

api/auth.logout.ts

// /api/auth.logout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import cookie from 'cookie';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', cookie.serialize('auth', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0
  }));
  return res.status(200).json({ ok: true });
}
