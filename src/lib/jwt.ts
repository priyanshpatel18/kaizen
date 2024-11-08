import { sign } from "jsonwebtoken";

export function generateJwtToken(
  userId: string,
  email: string,
  name: string,
  profilePicture?: string
) {
  return sign(
    {
      userId,
      email,
      name,
      profilePicture,
    },
    process.env.SECRET_KEY || ""
  );
}
