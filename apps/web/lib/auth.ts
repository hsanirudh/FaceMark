import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./db"
import { authEventCounter } from "./prometheus"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      authEventCounter.inc({ event_type: 'sign_in', provider: account?.provider || 'unknown' })
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as any).role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
  },
  events: {
    async signOut() {
      authEventCounter.inc({ event_type: 'sign_out', provider: 'google' })
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
  },
} 