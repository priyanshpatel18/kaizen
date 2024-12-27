import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { verify } from "argon2";
import { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { generateToken } from "./encrypt";
import { sendMail } from "./resend";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      token: string;
      image: string;
    };
  }
}

interface token extends JWT {
  uid: string;
  jwtToken: string;
}

// Workflow (Google):
// 1. Get Google Profile
// 2. Check if user already exists
// 3. If user doesn't exist
//      Create user
// 4. If user exists
//      Check if user has Google account
// 5. If user has Google account
//      Update user's Google account
// 6. If user doesn't have Google account
//      Create Google account
// 7. Return user

// Workflow (Credentials):
// 1. Get Credentials
// 2. Check if user already exists
// 3. If user doesn't exist
//      Create user
// 4. If user exists
//      Check if user has Email account
//        If user has Email account
//          Check if password is correct
// 6. If password is correct
//      Return user

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      async profile(profile) {
        const { email, name, picture } = profile;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            accounts: true,
          },
        });

        if (user) {
          const googleAccount = user.accounts.find((account) => account.provider === "GOOGLE");

          if (!googleAccount) {
            await prisma.account.create({
              data: {
                provider: "GOOGLE",
                providerAccountId: profile.sub,
                refreshToken: profile.refresh_token,
                accessToken: profile.access_token,
                user: { connect: { id: user.id } },
              },
            });
          }

          if (!user.profilePicture) {
            await prisma.user.update({
              where: { id: user.id },
              data: { profilePicture: picture },
            });
          }

          return user;
        }

        const newAccount = await prisma.account.create({
          data: {
            provider: "GOOGLE",
            providerAccountId: profile.sub,
            refreshToken: profile.refresh_token,
            accessToken: profile.access_token,
            user: {
              create: {
                email,
                name,
                profilePicture: picture,
                isVerified: true,
              },
            },
          },
          include: { user: true },
        });

        await sendMail(email, "Welcome to Kaizen", OnboardingTemplate());

        return newAccount.user;
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        name: { label: "name", type: "text" },
      },
      async authorize(credentials: any) {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            accounts: true,
          },
        });

        if (user) {
          const hasEmailAccount = user.accounts.some((account) => account.provider === "EMAIL");

          if (hasEmailAccount && user.password) {
            const isMatch = await verify(user.password, password);

            if (isMatch && user.isVerified) {
              return user;
            }
          }
        }

        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "",
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      const newToken: token = token as token;

      if (user) {
        const token = await generateToken({
          userId: user?.id as string,
          email: user?.email as string,
        });

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { token },
        });

        newToken.uid = user.id;
        newToken.token = token;
        newToken.name = user.name;
        newToken.image = user.image;
        newToken.picture = updatedUser.profilePicture as string;
      }
      return newToken;
    },
    session: async ({ session, token }) => {
      const newSession: Session = session as Session;

      if (newSession.user && token.uid) {
        newSession.user.id = token.uid as string;
        newSession.user.email = session.user?.email ?? "";
        newSession.user.token = token.token as string;
        newSession.user.name = token.name as string;
        newSession.user.image = token.picture as string;
      }
      return newSession!;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
};
