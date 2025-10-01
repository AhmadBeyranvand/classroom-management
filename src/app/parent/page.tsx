'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserX, AlertCircle, TrendingUp, Calendar, BookOpen, User, Award } from 'lucide-react';

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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  user: { id: string; email: string; name: string };
}

export default function ParentPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchGrades();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0].user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`/api/students/grades?studentId=${selectedStudent}`);
      if (response.ok) {
        const data = await response.json();
        setGradeData(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
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

  const getPerformanceLevel = (grade: number) => {
    if (grade >= 17) return { text: 'عالی', color: 'bg-green-100 text-green-800' };
    if (grade >= 14) return { text: 'خوب', color: 'bg-blue-100 text-blue-800' };
    if (grade >= 12) return { text: 'متوسط', color: 'bg-yellow-100 text-yellow-800' };
    if (grade >= 10) return { text: 'ضعیف', color: 'bg-orange-100 text-orange-800' };
    return { text: 'بسیار ضعیف', color: 'bg-red-100 text-red-800' };
  };

  const selectedStudentData = students.find(s => s.user.id === selectedStudent);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">پنل والدین</h1>
        <p className="text-muted-foreground">نظارت بر عملکرد تحصیلی دانش‌آموز</p>
      </div>

      {/* Student Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            انتخاب دانش‌آموز
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="دانش‌آموز را انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.user.id} value={student.user.id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudentData && gradeData && (
        <>
          {/* Student Info */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedStudentData.firstName} {selectedStudentData.lastName}
                  </h2>
                  <p className="text-muted-foreground">{selectedStudentData.user.email}</p>
                </div>
                <div className="text-left">
                  <Badge className={getPerformanceLevel(gradeData.finalGrade).color}>
                    <Award className="w-4 h-4 ml-2" />
                    {getPerformanceLevel(gradeData.finalGrade).text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Performance Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>خلاصه عملکرد</CardTitle>
              <CardDescription>
                تحلیل کلی عملکرد دانش‌آموز
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">نقاط قوت</h4>
                  <ul className="space-y-1 text-sm">
                    {gradeData.avgClassScore >= 15 && (
                      <li className="text-green-600">• نمرات کلاسی عالی</li>
                    )}
                    {gradeData.avgHomeworkScore >= 15 && (
                      <li className="text-green-600">• انجام عالی تمرین‌ها</li>
                    )}
                    {gradeData.presentCount / gradeData.totalSessions >= 0.9 && (
                      <li className="text-green-600">• حضور مستمر در کلاس</li>
                    )}
                    {gradeData.unexcusedAbsenceCount === 0 && (
                      <li className="text-green-600">• بدون غیبت غیر موجه</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">نقاط قابل بهبود</h4>
                  <ul className="space-y-1 text-sm">
                    {gradeData.avgClassScore < 12 && (
                      <li className="text-orange-600">• نیاز به تلاش بیشتر در کلاس</li>
                    )}
                    {gradeData.avgHomeworkScore < 12 && (
                      <li className="text-orange-600">• نیاز به توجه بیشتر به تمرین‌ها</li>
                    )}
                    {gradeData.unexcusedAbsenceCount > 2 && (
                      <li className="text-red-600">• کاهش غیبت‌های غیر موجه</li>
                    )}
                    {gradeData.finalGrade < 12 && (
                      <li className="text-red-600">• نیاز به برنامه‌ریزی برای بهبود نمرات</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </>
      )}
    </div>
  );
}