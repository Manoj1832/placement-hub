import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For demo purposes - in production, verify against your DB
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            name: "PSG Student",
            email: credentials.email as string,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});