import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'تمام فیلدها الزامی هستند' },
        { status: 400 }
      );
    }

    // Find user by email and role
    const user = await db.user.findFirst({
      where: {
        email,
        role,
      },
      include: {
        studentProfile: true,
        parentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'کاربری با این اطلاعات یافت نشد' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Create a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'خطا در سرور' },
      { status: 500 }
    );
  }
}