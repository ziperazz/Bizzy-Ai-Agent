// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) =>
    r === '/' ? pathname === '/' : pathname.startsWith(r)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // چک کردن توکن توی cookie یا localStorage (header)
  // چون localStorage در middleware نیست، از cookie استفاده می‌کنیم
  // ولی چون این پروژه با localStorage کار می‌کنه، در layout چک می‌کنیم
  // اینجا فقط مسیرهای محافظت‌شده رو نگه می‌داریم

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};