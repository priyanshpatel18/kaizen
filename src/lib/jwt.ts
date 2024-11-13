import { sign } from "jsonwebtoken";

export function generateJwtToken(
  userId: string,
  email: string,
) {
  return sign(
    {
      userId,
      email,
    },
    process.env.SECRET_KEY || ""
  );
}
