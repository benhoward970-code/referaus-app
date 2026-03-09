import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtected) return NextResponse.next();
  
  // Check for Supabase auth token in cookies
  const token = request.cookies.get('sb-access-token')?.value 
    || request.cookies.getAll().find(c => c.name.includes('auth-token'))?.value;
  
  // If no Supabase configured (no env vars), allow access (demo mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.next();
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
