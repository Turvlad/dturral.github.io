export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // En Vercel verás 500 si falta; útil para detectar mal config
  console.warn("JWT_SECRET no está definido en las Environment Variables.");
}
