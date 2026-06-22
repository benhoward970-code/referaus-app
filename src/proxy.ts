import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Auth is handled client-side via useAuth() — the Supabase JS client stores
  // the session in localStorage (not cookies), so middleware cannot read it.
  // Protected routes (/dashboard, /admin) redirect to login from the page itself
  // when the user is not authenticated.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/admin'],
};
