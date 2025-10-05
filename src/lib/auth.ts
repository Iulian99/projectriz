import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-key-change-in-production-min-32-chars"
);

const alg = "HS256";

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Helper pentru a valida și converti JWTPayload la SessionPayload
function validateSessionPayload(payload: JWTPayload): SessionPayload | null {
  // Verifică dacă payload-ul conține toate câmpurile necesare
  if (
    typeof payload.userId === "number" &&
    typeof payload.email === "string" &&
    typeof payload.role === "string"
  ) {
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
  return null;
}

// Creează JWT token
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d") // Token expiră în 7 zile
    .sign(secretKey);
}

// Verifică JWT token
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, secretKey);
    return validateSessionPayload(verified.payload);
  } catch (error) {
    console.error("Token invalid:", error);
    return null;
  }
}

// Obține sesiunea din cookies (pentru middleware și server components)
export async function getSessionFromCookies(
  cookieHeader: string | null
): Promise<SessionPayload | null> {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce<Record<string, string>>(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );

  const token = cookies["auth-token"];
  if (!token) return null;

  return verifyToken(token);
}

// Helper pentru a obține sesiunea din Request (pentru API routes)
export async function getSession(
  request: Request
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie");
  return getSessionFromCookies(cookieHeader);
}