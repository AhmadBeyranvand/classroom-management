import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, studentId } = body;

    // Check if student is already in the class
    const existing = await db.classStudent.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Student already in class' }, { status: 400 });
    }

    const classStudent = await db.classStudent.create({
      data: {
        classId,
        studentId
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        class: true
      }
    });

    return NextResponse.json(classStudent, { status: 201 });
  } catch (error) {
    console.error('Error adding student to class:', error);
    return NextResponse.json({ error: 'Failed to add student to class' }, { status: 500 });
  }
}