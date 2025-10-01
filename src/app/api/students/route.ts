import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const students = await db.student.findMany({
      include: {
        user: true,
        classStudent: {
          include: {
            class: true
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, nationalId, phone, address, birthDate, email, password } = body;

    // Create user first
    const user = await db.user.create({
      data: {
        email,
        password, // In production, hash this password
        name: `${firstName} ${lastName}`,
        role: 'STUDENT'
      }
    });

    // Then create student profile
    const student = await db.student.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        nationalId,
        phone,
        address,
        birthDate
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}