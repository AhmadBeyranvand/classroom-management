'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { UserCheck, UserX, AlertCircle, TrendingUp, Calendar, BookOpen } from 'lucide-react';

interface GradeData {
  totalSessions: number;
  presentCount: number;
  excusedAbsenceCount: number;
  unexcusedAbsenceCount: number;
  avgClassScore: number;
  avgHomeworkScore: number;
  averageScore: number;
  finalGrade: number;
  deductionPerAbsence: number;
  sessions: Array<{
    id: string;
    attendance: string;
    classScore?: number;
    homeworkScore?: number;
    notes?: string;
    session: {
      date: string;
      title?: string;
      class: { name: string };
    };
  }>;
}

export default function StudentPanel() {
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId] = useState('1'); // In real app, get from auth

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch(`/api/students/grades?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setGradeData(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'EXCUSED_ABSENCE':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'UNEXCUSED_ABSENCE':
        return <UserX className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="default" className="bg-green-100 text-green-800">حاضر</Badge>;
      case 'EXCUSED_ABSENCE':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">غیبت موجه</Badge>;
      case 'UNEXCUSED_ABSENCE':
        return <Badge variant="destructive">غیبت غیر موجه</Badge>;
      default:
        return null;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 17) return 'text-green-600';
    if (grade >= 12) return 'text-yellow-600';
    if (grade >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeProgress = (grade: number) => {
    return (grade / 20) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!gradeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">اطلاعاتی یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">پنل دانش‌آموز</h1>
        <p className="text-muted-foreground">مشاهده نمرات و وضعیت حضور و غیاب</p>
      </div>

      {/* Grade Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نمره نهایی</p>
                <p className={`text-3xl font-bold ${getGradeColor(gradeData.finalGrade)}`}>
                  {gradeData.finalGrade.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">از 20</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress value={getGradeProgress(gradeData.finalGrade)} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">میانگین نمره کلاسی</p>
                <p className="text-2xl font-bold">{gradeData.avgClassScore.toFixed(2)}</p>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress value={getGradeProgress(gradeData.avgClassScore)} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">میانگین نمره تمرین</p>
                <p className="text-2xl font-bold">{gradeData.avgHomeworkScore.toFixed(2)}</p>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress value={getGradeProgress(gradeData.avgHomeworkScore)} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">جلسات کل</p>
                <p className="text-2xl font-bold">{gradeData.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">تعداد حضور</p>
                <p className="text-2xl font-bold text-green-600">{gradeData.presentCount}</p>
                <p className="text-xs text-muted-foreground">
                  {((gradeData.presentCount / gradeData.totalSessions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">غیبت موجه</p>
                <p className="text-2xl font-bold text-yellow-600">{gradeData.excusedAbsenceCount}</p>
                <p className="text-xs text-muted-foreground">
                  {((gradeData.excusedAbsenceCount / gradeData.totalSessions) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">غیبت غیر موجه</p>
                <p className="text-2xl font-bold text-red-600">{gradeData.unexcusedAbsenceCount}</p>
                <p className="text-xs text-muted-foreground">
                  کسر نمره: {(gradeData.unexcusedAbsenceCount * gradeData.deductionPerAbsence).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>جزئیات جلسات</CardTitle>
          <CardDescription>
            تاریخچه حضور و غیاب و نمرات در تمام جلسات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">کلاس</TableHead>
                  <TableHead className="text-right">عنوان جلسه</TableHead>
                  <TableHead className="text-right">حضور و غیاب</TableHead>
                  <TableHead className="text-right">نمره کلاسی</TableHead>
                  <TableHead className="text-right">نمره تمرین</TableHead>
                  <TableHead className="text-right">توضیحات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeData.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.session.date}</TableCell>
                    <TableCell>{session.session.class.name}</TableCell>
                    <TableCell>{session.session.title || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAttendanceIcon(session.attendance)}
                        {getAttendanceBadge(session.attendance)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.classScore ? (
                        <span className={getGradeColor(session.classScore)}>
                          {session.classScore.toFixed(1)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {session.homeworkScore ? (
                        <span className={getGradeColor(session.homeworkScore)}>
                          {session.homeworkScore.toFixed(1)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={session.notes}>
                        {session.notes || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}