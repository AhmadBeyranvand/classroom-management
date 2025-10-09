'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Calendar, Settings, BookOpen, UserCheck, UserX, AlertCircle, Edit, Eye } from 'lucide-react';
import { getCurrentPersianDate } from '@/lib/persian-date';
import { useRouter } from 'next/navigation';
import SettingsPanel from '@/components/SettingsPanel';
import Toastify from 'toastify-js'

interface Class {
  id: string;
  name: string;
  description?: string;
  grade?: string;
  maxStudents: number;
  _count: { classStudents: number };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  user: { id: string; email: string; name: string };
}

interface Session {
  id: string;
  date: string;
  title?: string;
  description?: string;
  class: { id: string; name: string };
  _count: { students: number };
}

export default function Home() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');

  // Form states
  const [newClass, setNewClass] = useState({ name: '', description: '', grade: '', maxStudents: 30 });
  const [newStudent, setNewStudent] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '',
    nationalId: '', 
    phone: '', 
    address: '', 
    birthDate: '' 
  });
  const [newSession, setNewSession] = useState({ classId: '', date: getCurrentPersianDate(), title: '', description: '' });
  const [selectedStudentForClass, setSelectedStudentForClass] = useState<{ classId: string; studentId: string } | null>(null);

  useEffect(() => {
    Toastify({
        text: "TEST",
        gravity:"top"
      })
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, studentsRes, sessionsRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/students'),
        fetch('/api/sessions')
      ]);

      const [classesData, studentsData, sessionsData] = await Promise.all([
        classesRes.json(),
        studentsRes.json(),
        sessionsRes.json()
      ]);

      setClasses(classesData);
      setStudents(studentsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });

      if (response.ok) {
        setNewClass({ name: '', description: '', grade: '', maxStudents: 30 });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleCreateStudent = async () => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      if (response.ok) {
        setNewStudent({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          password: '',
          nationalId: '', 
          phone: '', 
          address: '', 
          birthDate: '' 
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleAddStudentToClass = async (classId: string, studentId: string) => {
    try {
      const response = await fetch('/api/classes/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, studentId })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error adding student to class:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });

      if (response.ok) {
        setNewSession({ classId: '', date: getCurrentPersianDate(), title: '', description: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">سیستم مدیریت کلاس</h1>
        <p className="text-muted-foreground">مدیریت کلاس‌ها، دانش‌آموزان و جلسات آموزشی</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            کلاس‌ها
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            دانش‌آموزان
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            جلسات
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            تنظیمات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>کلاس‌ها</CardTitle>
                    <CardDescription>مدیریت کلاس‌های آموزشی</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        کلاس جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ایجاد کلاس جدید</DialogTitle>
                        <DialogDescription>
                          اطلاعات کلاس جدید را وارد کنید
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="className">نام کلاس</Label>
                          <Input
                            id="className"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            placeholder="مثال: ریاضی دهم"
                          />
                        </div>
                        <div>
                          <Label htmlFor="classDescription">توضیحات</Label>
                          <Textarea
                            id="classDescription"
                            value={newClass.description}
                            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                            placeholder="توضیحات کلاس..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="classGrade">مقطع</Label>
                          <Input
                            id="classGrade"
                            value={newClass.grade}
                            onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
                            placeholder="مثال: دهم"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxStudents">ظرفیت</Label>
                          <Input
                            id="maxStudents"
                            type="number"
                            value={newClass.maxStudents}
                            onChange={(e) => setNewClass({ ...newClass, maxStudents: parseInt(e.target.value) })}
                          />
                        </div>
                        <Button onClick={handleCreateClass} className="w-full">
                          ایجاد کلاس
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {classes.map((classItem) => (
                    <Card key={classItem.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{classItem.name}</h3>
                            {classItem.description && (
                              <p className="text-sm text-muted-foreground">{classItem.description}</p>
                            )}
                            {classItem.grade && (
                              <Badge variant="secondary" className="mt-1">
                                {classItem.grade}
                              </Badge>
                            )}
                          </div>
                          <div className="text-left flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">
                                {classItem._count.classStudents} / {classItem.maxStudents}
                              </span>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedStudentForClass({ classId: classItem.id, studentId: '' })}
                                >
                                  افزودن دانش‌آموز
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>افزودن دانش‌آموز به کلاس</DialogTitle>
                                  <DialogDescription>
                                    دانش‌آموز مورد نظر را برای افزودن به کلاس {classItem.name} انتخاب کنید
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="studentSelect">دانش‌آموز</Label>
                                    <Select onValueChange={(value) => setSelectedStudentForClass({ classId: classItem.id, studentId: value })}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="دانش‌آموز را انتخاب کنید" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {students.map((student) => (
                                          <SelectItem key={student.id} value={student.id}>
                                            {student.firstName} {student.lastName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    onClick={() => {
                                      if (selectedStudentForClass?.studentId) {
                                        handleAddStudentToClass(selectedStudentForClass.classId, selectedStudentForClass.studentId);
                                        setSelectedStudentForClass(null);
                                      }
                                    }} 
                                    className="w-full"
                                    disabled={!selectedStudentForClass?.studentId}
                                  >
                                    افزودن به کلاس
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>دانش‌آموزان</CardTitle>
                    <CardDescription>مدیریت اطلاعات دانش‌آموزان</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        دانش‌آموز جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>ثبت دانش‌آموز جدید</DialogTitle>
                        <DialogDescription>
                          اطلاعات دانش‌آموز جدید را وارد کنید
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">نام</Label>
                          <Input
                            id="firstName"
                            value={newStudent.firstName}
                            onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                            placeholder="نام"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">نام خانوادگی</Label>
                          <Input
                            id="lastName"
                            value={newStudent.lastName}
                            onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                            placeholder="نام خانوادگی"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">نام کاربری</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">رمز عبور</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newStudent.password}
                            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                            placeholder="رمز عبور"
                          />
                        </div>
                        <div>
                          <Label htmlFor="nationalId">کد ملی</Label>
                          <Input
                            id="nationalId"
                            value={newStudent.nationalId}
                            onChange={(e) => setNewStudent({ ...newStudent, nationalId: e.target.value })}
                            placeholder="کد ملی"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">تلفن</Label>
                          <Input
                            id="phone"
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                            placeholder="شماره تلفن"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="address">آدرس</Label>
                          <Textarea
                            id="address"
                            value={newStudent.address}
                            onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                            placeholder="آدرس..."
                          />
                        </div>
                        <div className="col-span-2">
                          <Button onClick={handleCreateStudent} className="w-full">
                            ثبت دانش‌آموز
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {students.map((student) => (
                    <Card key={student.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{student.firstName} {student.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{student.user.email}</p>
                            {student.phone && (
                              <p className="text-sm text-muted-foreground">{student.phone}</p>
                            )}
                          </div>
                          <Badge variant="outline">دانش‌آموز</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>جلسات</CardTitle>
                    <CardDescription>مدیریت جلسات آموزشی</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        جلسه جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ایجاد جلسه جدید</DialogTitle>
                        <DialogDescription>
                          اطلاعات جلسه جدید را وارد کنید
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="sessionClass">کلاس</Label>
                          <Select value={newSession.classId} onValueChange={(value) => setNewSession({ ...newSession, classId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="کلاس را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sessionDate">تاریخ</Label>
                          <Input
                            id="sessionDate"
                            value={newSession.date}
                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                            placeholder="1403/01/01"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sessionTitle">عنوان</Label>
                          <Input
                            id="sessionTitle"
                            value={newSession.title}
                            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                            placeholder="عنوان جلسه..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="sessionDescription">توضیحات</Label>
                          <Textarea
                            id="sessionDescription"
                            value={newSession.description}
                            onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                            placeholder="توضیحات جلسه..."
                          />
                        </div>
                        <Button onClick={handleCreateSession} className="w-full">
                          ایجاد جلسه
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{session.title || `جلسه ${session.date}`}</h3>
                            <p className="text-sm text-muted-foreground">{session.class.name}</p>
                            <p className="text-sm text-muted-foreground">{session.date}</p>
                            {session.description && (
                              <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{session._count.students} دانش‌آموز</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/session/${session.id}`)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              مدیریت
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات سیستم</CardTitle>
              <CardDescription>مدیریت تنظیمات اصلی سیستم</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}