'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, UserX, AlertCircle, Save, ArrowRight } from 'lucide-react';

interface SessionStudent {
  id: string;
  studentId: string;
  attendance: 'PRESENT' | 'EXCUSED_ABSENCE' | 'UNEXCUSED_ABSENCE';
  classScore?: number;
  homeworkScore?: number;
  notes?: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface Session {
  id: string;
  date: string;
  title?: string;
  description?: string;
  class: { id: string; name: string };
  students: SessionStudent[];
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStudentAttendance = async (studentId: string, field: string, value: any) => {
    if (!session) return;

    try {
      setSaving(true);
      const response = await fetch('/api/sessions/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          studentId,
          [field]: value
        })
      });

      if (response.ok) {
        const updatedStudent = await response.json();
        setSession(prev => prev ? {
          ...prev,
          students: prev.students.map(s => 
            s.studentId === studentId ? { ...s, ...updatedStudent } : s
          )
        } : null);
      }
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">جلسه یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          بازگشت
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {session.title || `جلسه ${session.date}`}
            </h1>
            <p className="text-muted-foreground">
              کلاس: {session.class.name} - تاریخ: {session.date}
            </p>
            {session.description && (
              <p className="text-muted-foreground mt-2">{session.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {session.students.length} دانش‌آموز
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مدیریت حضور و غیاب و نمرات</CardTitle>
          <CardDescription>
            وضعیت حضور و غیاب و نمرات دانش‌آموزان را ثبت کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">دانش‌آموز</TableHead>
                  <TableHead className="text-right">حضور و غیاب</TableHead>
                  <TableHead className="text-right">نمره کلاسی (20)</TableHead>
                  <TableHead className="text-right">نمره تمرین (20)</TableHead>
                  <TableHead className="text-right">توضیحات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.students.map((sessionStudent) => (
                  <TableRow key={sessionStudent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAttendanceIcon(sessionStudent.attendance)}
                        <div>
                          <div className="font-medium">{sessionStudent.student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sessionStudent.student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={sessionStudent.attendance}
                        onValueChange={(value) => updateStudentAttendance(
                          sessionStudent.studentId, 
                          'attendance', 
                          value
                        )}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">حاضر</SelectItem>
                          <SelectItem value="EXCUSED_ABSENCE">غیبت موجه</SelectItem>
                          <SelectItem value="UNEXCUSED_ABSENCE">غیبت غیر موجه</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={sessionStudent.classScore || ''}
                        onChange={(e) => updateStudentAttendance(
                          sessionStudent.studentId,
                          'classScore',
                          e.target.value ? parseFloat(e.target.value) : null
                        )}
                        placeholder="0-20"
                        className="w-20"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={sessionStudent.homeworkScore || ''}
                        onChange={(e) => updateStudentAttendance(
                          sessionStudent.studentId,
                          'homeworkScore',
                          e.target.value ? parseFloat(e.target.value) : null
                        )}
                        placeholder="0-20"
                        className="w-20"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Textarea
                        value={sessionStudent.notes || ''}
                        onChange={(e) => updateStudentAttendance(
                          sessionStudent.studentId,
                          'notes',
                          e.target.value
                        )}
                        placeholder="توضیحات..."
                        className="min-h-8 resize-none"
                        rows={1}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {saving && (
            <div className="mt-4 text-sm text-muted-foreground">
              در حال ذخیره تغییرات...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold">حاضرین</div>
                <div className="text-2xl font-bold text-green-600">
                  {session.students.filter(s => s.attendance === 'PRESENT').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-semibold">غیبت موجه</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {session.students.filter(s => s.attendance === 'EXCUSED_ABSENCE').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold">غیبت غیر موجه</div>
                <div className="text-2xl font-bold text-red-600">
                  {session.students.filter(s => s.attendance === 'UNEXCUSED_ABSENCE').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}