import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由（不需要登录）
const publicRoutes = ['/login'];

// 受保护的路由前缀
const protectedRoutes = ['/', '/users', '/domains', '/routes', '/templates', '/demo', '/profile', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查 cookie 中是否有 token
  const token = request.cookies.get('auth_token')?.value;

  // 如果是登录页面
  if (pathname === '/login') {
    // 如果已登录，重定向到首页
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 如果是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    // 未登录，重定向到登录页
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
