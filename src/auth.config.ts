import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        // Permite apenas se for SUPER_ADMIN
        if (auth.user.role === 'SUPER_ADMIN') return true;
        // Caso contrário, manda para o dashboard
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redireciona para o login
      } 
      
      if (isLoggedIn) {
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
          // Se for super admin, manda pro admin. Senão manda pro dashboard
          if (auth.user.role === 'SUPER_ADMIN') {
            return Response.redirect(new URL('/admin', nextUrl));
          }
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Será configurado no auth.ts (onde o bcrypt roda)
} satisfies NextAuthConfig;
