import jwt from "jsonwebtoken";

const secret = process.env["SESSION_SECRET"] || "faceufsc-dev-secret";

export function signToken(userId: number): string {
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, secret) as { userId: number };
  } catch {
    return null;
  }
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
