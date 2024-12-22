import { EncryptJWT, SignJWT, jwtDecrypt, jwtVerify } from "jose";

// Load keys from environment variables
const KEY = process.env.NEXT_PUBLIC_SECRET || "";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const SECRET_KEY = new TextEncoder().encode(KEY);

// Generate a JWT token
export const generateToken = async (payload: Record<string, any>, expiresIn: string = "1h") => {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresIn).sign(SECRET_KEY);
};

// Verify a JWT token
export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload as Record<string, any>;
};

// Encrypt data using the public key
export const encryptData = async (data: Record<string, any>) => {
  const ENCODING_KEY = Uint8Array.from(atob(KEY), (c) => c.charCodeAt(0));

  return await new EncryptJWT(data)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setAudience(BASE_URL)
    .setIssuer(BASE_URL)
    .setExpirationTime("2h")
    .encrypt(ENCODING_KEY);
};

// Decrypt data using the private key
export const decryptData = async (encryptedData: string) => {
  const ENCODING_KEY = Uint8Array.from(atob(KEY), (c) => c.charCodeAt(0));

  return await jwtDecrypt(encryptedData, ENCODING_KEY, {
    audience: BASE_URL,
    issuer: BASE_URL,
  });
};
