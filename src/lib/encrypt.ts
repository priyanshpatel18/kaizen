import { CompactEncrypt, SignJWT, compactDecrypt, importJWK, jwtVerify } from "jose";

// Load keys from environment variables
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

// Encrypt data using the public key
export const encryptData = async (data: Record<string, any>, key: string) => {
  const encoder = new TextEncoder();
  const jwk = JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
  const publicKey = await importJWK(jwk, "RSA-OAEP");
  const jsonData = JSON.stringify(data);

  const encrypted = await new CompactEncrypt(encoder.encode(jsonData))
    .setProtectedHeader({ alg: "RSA-OAEP", enc: "A256GCM" })
    .encrypt(publicKey);

  return encrypted;
};

// Decrypt data using the private key
export const decryptData = async (encryptedData: string, key: string) => {
  const jwk = JSON.parse(Buffer.from(key, "base64").toString("utf-8"));

  const privateKey = await importJWK(jwk, "RSA-OAEP");

  const { plaintext } = await compactDecrypt(encryptedData, privateKey);
  const decoder = new TextDecoder();
  const decodedData = JSON.parse(decoder.decode(plaintext));

  return decodedData;
};
