import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" }, // Use JWT for session management
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate input
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Look up user in Neon DB
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));

        // 3. If user doesn't exist, return null
        if (!user) {
          return null;
        }

        // 4. Compare hashed password
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // 5. If passwords match, return the user object (this populates the JWT)
        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Pass the subscription plan from user to token
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the subscription plan from token to the frontend session
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
});