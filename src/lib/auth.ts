import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { compare } from "bcrypt";
import { AuthOptions, DefaultUser, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { generateJwtToken } from "./jwt";
import { sendMail } from "./resend";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      token: string;
      profilePicture: string | null;
    };
  }
  interface User extends DefaultUser {
    id: string;
    profilePicture: string | null;
  }
}

interface token extends JWT {
  uid: string;
  jwtToken: string;
  profilePicture: string | null;
}

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
          const googleAccount = user.accounts.find(
            (account) => account.provider === "GOOGLE"
          );

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
          const hasEmailAccount = user.accounts.some(
            (account) => account.provider === "EMAIL"
          );
          
          if (hasEmailAccount && user.password) {
            const isMatch = await compare(password, user.password);
            if (isMatch) {
              return user;
            }
          }
        }

        return null;
      },
    }),
  ],
  secret: process.env.SECRET_KEY || "",
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      const newToken: token = token as token;

      if (user) {
        const token = generateJwtToken(
          user?.id as string,
          user?.email as string,
          user?.name as string
          // ima
        );

        await prisma.user.update({
          where: { id: user.id },
          data: { token },
        });

        newToken.uid = user.id;
        newToken.token = token;
        newToken.profilePicture = user.profilePicture;
      }
      return newToken;
    },
    session: async ({ session, token }) => {
      const newSession: Session = session as Session;

      if (newSession.user && token.uid) {
        newSession.user.id = token.uid as string;
        newSession.user.email = session.user?.email ?? "";
        newSession.user.name = session.user?.name ?? "";
        newSession.user.token = token.token as string;
        newSession.user.profilePicture = token.profilePicture as string;
      }
      return newSession!;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
};
