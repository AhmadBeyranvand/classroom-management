import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await db.session.findMany({
      include: {
        class: true,
        students: {
          include: {
            student: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, date, title, description } = body;

    const session = await db.session.create({
      data: {
        classId,
        date,
        title,
        description
      },
      include: {
        class: true
      }
    });

    // Get all students in this class
    const classStudents = await db.classStudent.findMany({
      where: {
        classId
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    });

    // Create session student records for all students
    const sessionStudents = await Promise.all(
      classStudents.map(async (classStudent) => {
        return await db.sessionStudent.create({
          data: {
            sessionId: session.id,
            studentId: classStudent.student.user.id,
            attendance: 'PRESENT'
          }
        });
      })
    );

    return NextResponse.json({ ...session, students: sessionStudents }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}