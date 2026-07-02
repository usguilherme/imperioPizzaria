import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Busca o cookie que criamos na action de login
  const authCookie = request.cookies.get('admin_session');
  
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Se tentar acessar o /admin sem o cookie, manda pro /login
  if (isAdminRoute && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se já estiver logado e tentar acessar o /login, manda pro /admin
  if (isLoginPage && authCookie) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Define em quais rotas o middleware vai atuar
export const config = {
  matcher: ['/admin/:path*', '/login'],
};