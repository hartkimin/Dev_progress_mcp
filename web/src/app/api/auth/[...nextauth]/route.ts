import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
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
