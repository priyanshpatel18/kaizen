import { CompactEncrypt, SignJWT, compactDecrypt, importJWK, jwtVerify } from "jose";

// Load keys from environment variables
const publicKeyBase64 = process.env.NEXT_PULIC_PUBLIC_KEY || "";
const privateKeyBase64 = process.env.PRIVATE_KEY || "";

const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "");

// Generate a JWT token
export const generateToken = async (payload: Record<string, any>, expiresIn: string = "1h") => {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresIn).sign(SECRET_KEY);
};

// Verify a JWT token
export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload as Record<string, any>;
};

async function loadKeys() {
  const publicKeyJwk = JSON.parse(Buffer.from(publicKeyBase64, "base64").toString("utf-8"));

  const privateKeyJwk = JSON.parse(Buffer.from(privateKeyBase64, "base64").toString("utf-8"));

  const publicKey = await importJWK(publicKeyJwk, "RSA-OAEP");
  const privateKey = await importJWK(privateKeyJwk, "RSA-OAEP");

  return { publicKey, privateKey };
}

// Encrypt data using the public key
export const encryptData = async (data: Record<string, any>) => {
  const encoder = new TextEncoder();
  const { publicKey } = await loadKeys();

  const encrypted = await new CompactEncrypt(encoder.encode(JSON.stringify(data)))
    .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })
    .encrypt(publicKey);

  return encrypted;
};

// Decrypt data using the private key
export const decryptData = async (encryptedData: string) => {
  const { privateKey } = await loadKeys();

  const { plaintext } = await compactDecrypt(encryptedData, privateKey);
  const decoder = new TextDecoder();
  const decodedData = JSON.parse(decoder.decode(plaintext));

  return decodedData;
};
