import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST - Register new user
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, firstName, lastName, nationalId, phone, address, birthDate } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: 'تمام فیلدهای الزامی باید پر شوند' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'کاربری با این نام کاربری از قبل وجود دارد' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role.toUpperCase(),
        },
      });

      // Create role-specific profile
      if (role.toUpperCase() === 'STUDENT' && firstName && lastName) {
        await tx.student.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            nationalId,
            phone,
            address,
            birthDate,
          },
        });
      } else if (role.toUpperCase() === 'PARENT') {
        // For parent, we need a student ID - for now, create without student
        await tx.parent.create({
          data: {
            userId: user.id,
            phone,
            studentId: '', // Will be updated later
          },
        });
      }

      return user;
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

    return NextResponse.json({
      message: 'کاربر با موفقیت ایجاد شد',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'خطا در ایجاد کاربر' },
      { status: 500 }
    );
  }
}

// GET - Check login status
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or header
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'توکن وجود ندارد' 
        },
        { status: 401 }
      );
    }

    try {
      // Decode token to get user ID
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, timestamp] = decoded.split(':');

      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { 
            authenticated: false,
            message: 'توکن منقضی شده است' 
          },
          { status: 401 }
        );
      }

      // Find user in database
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          parentProfile: {
            include: {
              student: true
            }
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { 
            authenticated: false,
            message: 'کاربر یافت نشد' 
          },
          { status: 401 }
        );
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        authenticated: true,
        user: userWithoutPassword,
        message: 'کاربر معتبر است'
      });
    } catch (decodeError) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'توکن نامعتبر است' 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        message: 'خطا در بررسی وضعیت احراز هویت' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }

    // Decode token to get user ID
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');

    const { name, phone, address, firstName, lastName, nationalId, birthDate } = await request.json();

    // Update user with transaction
    const result = await db.$transaction(async (tx) => {
      // Update user basic info
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
        },
        include: {
          studentProfile: true,
          parentProfile: true,
        },
      });

      // Update student profile if exists
      if (updatedUser.studentProfile) {
        await tx.student.update({
          where: { userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(nationalId && { nationalId }),
            ...(birthDate && { birthDate }),
          },
        });
      }

      // Update parent profile if exists
      if (updatedUser.parentProfile) {
        await tx.parent.update({
          where: { userId },
          data: {
            ...(phone && { phone }),
          },
        });
      }

      return updatedUser;
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

    return NextResponse.json({
      message: 'پروفایل با موفقیت به‌روزرسانی شد',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'خطا در به‌روزرسانی پروفایل' },
      { status: 500 }
    );
  }
}

// DELETE - Logout user
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      message: 'خروج با موفقیت انجام شد',
      authenticated: false 
    });
    
    // Clear authentication cookies
    response.cookies.set('token', '', { 
      path: '/', 
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    response.cookies.set('userRole', '', { 
      path: '/', 
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'خطا در خروج از سیستم' },
      { status: 500 }
    );
  }
}