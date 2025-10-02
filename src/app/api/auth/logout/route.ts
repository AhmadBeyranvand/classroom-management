import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'خروج موفقیت‌آمیز' });
  
  // Clear authentication cookies
  response.cookies.set('token', '', { path: '/', maxAge: 0 });
  response.cookies.set('userRole', '', { path: '/', maxAge: 0 });
  
  return response;
}