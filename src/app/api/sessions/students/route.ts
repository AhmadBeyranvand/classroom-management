import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, studentId, attendance, classScore, homeworkScore, notes } = body;

    const sessionStudent = await db.sessionStudent.update({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId
        }
      },
      data: {
        attendance,
        classScore: classScore ? parseFloat(classScore) : null,
        homeworkScore: homeworkScore ? parseFloat(homeworkScore) : null,
        notes
      },
      include: {
        student: true,
        session: {
          include: {
            class: true
          }
        }
      }
    });

    return NextResponse.json(sessionStudent);
  } catch (error) {
    console.error('Error updating session student:', error);
    return NextResponse.json({ error: 'Failed to update session student' }, { status: 500 });
  }
}