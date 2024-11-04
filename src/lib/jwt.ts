import { sign } from "jsonwebtoken";

export function generateJwtToken(userId: string, email: string, name: string) {
  return sign(
    {
      userId,
      email,
      name,
    },
    process.env.SECRET_KEY || ""
  );
}
