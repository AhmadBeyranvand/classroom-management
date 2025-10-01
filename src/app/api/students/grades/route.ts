import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Get all session records for this student
    const sessionStudents = await db.sessionStudent.findMany({
      where: {
        studentId
      },
      include: {
        session: {
          include: {
            class: true
          }
        }
      }
    });

    // Calculate statistics
    const totalSessions = sessionStudents.length;
    const presentCount = sessionStudents.filter(s => s.attendance === 'PRESENT').length;
    const excusedAbsenceCount = sessionStudents.filter(s => s.attendance === 'EXCUSED_ABSENCE').length;
    const unexcusedAbsenceCount = sessionStudents.filter(s => s.attendance === 'UNEXCUSED_ABSENCE').length;

    // Calculate average scores
    const validClassScores = sessionStudents.filter(s => s.classScore !== null);
    const validHomeworkScores = sessionStudents.filter(s => s.homeworkScore !== null);
    
    const avgClassScore = validClassScores.length > 0 
      ? validClassScores.reduce((sum, s) => sum + s.classScore!, 0) / validClassScores.length 
      : 0;
    
    const avgHomeworkScore = validHomeworkScores.length > 0 
      ? validHomeworkScores.reduce((sum, s) => sum + s.homeworkScore!, 0) / validHomeworkScores.length 
      : 0;

    // Get deduction setting
    const deductionSetting = await db.setting.findUnique({
      where: { key: 'absence_deduction' }
    });
    const deductionPerAbsence = deductionSetting ? parseFloat(deductionSetting.value) : 0.5;

    // Calculate final grade
    const averageScore = (avgClassScore + avgHomeworkScore) / 2;
    const finalGrade = Math.max(0, averageScore - (unexcusedAbsenceCount * deductionPerAbsence));

    return NextResponse.json({
      totalSessions,
      presentCount,
      excusedAbsenceCount,
      unexcusedAbsenceCount,
      avgClassScore: parseFloat(avgClassScore.toFixed(2)),
      avgHomeworkScore: parseFloat(avgHomeworkScore.toFixed(2)),
      averageScore: parseFloat(averageScore.toFixed(2)),
      finalGrade: parseFloat(finalGrade.toFixed(2)),
      deductionPerAbsence,
      sessions: sessionStudents
    });
  } catch (error) {
    console.error('Error calculating student grades:', error);
    return NextResponse.json({ error: 'Failed to calculate grades' }, { status: 500 });
  }
}