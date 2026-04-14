import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const isDevAuthEnabled = process.env.ENABLE_DEV_AUTH === "true";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    ...(isDevAuthEnabled
      ? [
          CredentialsProvider({
            id: "dev",
            name: "Dev Login (email only)",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "hart@urock.kr" },
              name: { label: "Name", type: "text", placeholder: "Dev User" },
            },
            async authorize(credentials) {
              const email = credentials?.email?.trim();
              if (!email) return null;
              return {
                id: email,
                email,
                name: credentials?.name?.trim() || email.split("@")[0],
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Sync user with backend if the API JWT is missing.
      // Runs on first sign-in (user populated) AND on existing sessions that
      // predate this callback shape (token.email present, token.accessToken missing).
      const email = (user?.email ?? (token.email as string | undefined)) || null;
      const name =
        (user?.name ?? (token.name as string | undefined)) || email || "";
      if (email && !(token as any).accessToken) {
        try {
          const res = await fetch(
            `${process.env.API_BASE_URL || "http://localhost:3333/api/v1"}/auth/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, name }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            (token as any).accessToken = data.access_token;
            (token as any).dbUser = data.user;
          }
        } catch (e) {
          console.error("Failed to sync user with backend", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = (token as any).accessToken;
      (session as any).dbUser = (token as any).dbUser;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
