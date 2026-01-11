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
  session: { strategy: "jwt" },
  trustHost: true, // Essential for Next.js 15+ local development
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        // 1. Validate that the fields are present
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2. Fetch the user from Neon DB
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));

        // 3. If user doesn't exist, return null (triggers Invalid Credentials)
        if (!user) {
          return null;
        }

        // 4. Compare the provided password with the hashed password in the DB
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // 5. If they match, return the user object to be encoded in the JWT
        if (passwordsMatch) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            plan: user.plan, // This allows the platform to gate features
          };
        }

        // 6. If password is wrong, return null
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The 'user' object is only available the first time the JWT is created
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the custom data from the token to the session object
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
});