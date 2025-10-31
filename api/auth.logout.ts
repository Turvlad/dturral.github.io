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
