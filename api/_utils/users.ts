
export type Role = "admin" | "user";

type UserRecord = {
  id: string;
  identifier: string; // usuario SISE
  password: string;   // demo: texto plano (en prod: hash)
  role: Role;
};

const USERS: UserRecord[] = [
  { id: "u1", identifier: "metepec_ventas29", password: "123456", role: "admin" },
  { id: "u2", identifier: "metepec_ventas20", password: "123456", role: "admin" },
  { id: "u3", identifier: "vladimir",         password: "123456", role: "user"   }
];

export function findUserByIdentifier(identifier: string): UserRecord | undefined {
  const key = identifier.trim().toLowerCase();
  return USERS.find(u => u.identifier.toLowerCase() === key);
}

export function sanitizeUser(u: UserRecord) {
  return { id: u.id, identifier: u.identifier, role: u.role } as const;
}
