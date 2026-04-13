import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const isDevAuthEnabled = process.env.ENABLE_DEV_AUTH === "true";

const handler = NextAuth({
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
              email: { label: "Email", type: "email", placeholder: "dev@local" },
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
    async session({ session, token }) {
      // Sync user with backend and get JWT
      if (session.user?.email) {
        try {
          const res = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3333/api/v1'}/auth/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            // Store the API's JWT in the session object
            (session as any).accessToken = data.access_token;
            (session as any).dbUser = data.user;
          }
        } catch (e) {
          console.error("Failed to sync user with backend", e);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  }
});

export { handler as GET, handler as POST };
