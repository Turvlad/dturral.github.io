import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-vercel';

// Mock data
const ACTIVITIES = [
  { id: 1, owner: 'admin@qualitas.com', type: 'Renovación', area: 'AOF', status: 'Finalizado' },
  { id: 2, owner: 'user@qualitas.com',  type: 'Cancelación', area: 'Caja Metepec', status: 'En curso' },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const raw = req.headers.cookie || '';
    const cookie = Object.fromEntries(raw.split(';').map(v => v.trim().split('=')));
    const token = cookie['auth'];
    if (!token) return res.status(401).json({ ok: false });

    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: 'admin'|'user' };

    // Regla simple: admin ve todo; user ve solo sus actividades
    const data = payload.role === 'admin'
      ? ACTIVITIES
      : ACTIVITIES.filter(a => a.owner === payload.sub);

    return res.status(200).json({ ok: true, data });
  } catch {
    return res.status(401).json({ ok: false });
  }
}
