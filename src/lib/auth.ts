import OnboardingTemplate from "@/components/emailTemplates/OnboardingTemplate";
import prisma from "@/db";
import { compare } from "bcrypt";
import { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { sendMail } from "./resend";

export interface session extends Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface token extends JWT {
  uid: string;
  jwtToken: string;
}

interface user {
  id: string;
  name: string;
  email: string;
  token: string;
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
          const hasEmailAccount = user.accounts.some(
            (account) => account.provider === "EMAIL"
          );
          if (hasEmailAccount) {
            return user;
          }
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
                image: picture,
                isVerified: true,
              },
            },
          },
        });

        await sendMail(email, "Welcome to Kaizen", OnboardingTemplate());

        return newAccount;
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
        newToken.uid = user.id;
        newToken.jwtToken = (user as user).token;
      }
      return newToken;
    },
    session: async ({ session, token }) => {
      const newSession: session = session as session;
      if (newSession.user && token.uid) {
        newSession.user.id = token.uid as string;
        newSession.user.email = session.user?.email ?? "";
      }
      return newSession!;
    },
    redirect: async ({ url, baseUrl }) => {
      if (url.includes("/sign-in") || url.includes("/sign-up")) {
        return `${baseUrl}/`;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
};
