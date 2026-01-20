import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Resend from 'next-auth/providers/resend'
import { prisma } from './db'
import type { SystemRole } from '@prisma/client'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      systemRole: SystemRole
    }
  }
  interface User {
    systemRole?: SystemRole
  }
}

// Custom JWT type for our token
interface CustomJWT {
  id?: string
  systemRole?: SystemRole
  [key: string]: unknown
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt', // Use JWT so middleware works on edge runtime
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || 'Placemaker.ai <noreply@resend.dev>',
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
    newUser: '/onboarding',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      const customToken = token as CustomJWT

      // On initial sign in, add user data to token
      if (user) {
        customToken.id = user.id as string
        // Fetch the user's system role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { systemRole: true }
        })
        customToken.systemRole = dbUser?.systemRole || 'USER'
      }

      // Refresh role on session update
      if (trigger === 'update' && customToken.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: customToken.id },
          select: { systemRole: true }
        })
        customToken.systemRole = dbUser?.systemRole || 'USER'
      }

      return customToken
    },
    async session({ session, token }) {
      const customToken = token as CustomJWT
      // Add user id and role to session from JWT
      if (customToken) {
        session.user.id = customToken.id as string
        session.user.systemRole = (customToken.systemRole as SystemRole) || 'USER'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to home or the intended page
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },
})
