import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/'];
  
  // Check if the current path is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to login if no token and trying to access protected route
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Decode token to get user info
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    // For now, we'll just check if token exists
    // In production, you'd validate the token against a database or JWT
    
    // Role-based routing
    if (pathname.startsWith('/admin') && !request.cookies.get('userRole')?.value.includes('admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (pathname.startsWith('/teacher') && !request.cookies.get('userRole')?.value.includes('teacher')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (pathname.startsWith('/student') && !request.cookies.get('userRole')?.value.includes('student')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (pathname.startsWith('/parent') && !request.cookies.get('userRole')?.value.includes('parent')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }
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