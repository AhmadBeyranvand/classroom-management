'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, BookOpen, Users, GraduationCap, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

type authResponse = {
  authenticated: boolean,
  user?: any,
  message: string
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState({ status: true, message: "در حال بررسی وضعیت ورود..." })
  const [error, setError] = useState('');

  const redirectByRole = (role: string) => {
    // Redirect to appropriate dashboard
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'TEACHER':
        router.push('/teacher');
        break;
      case 'STUDENT':
        router.push('/student');
        break;
      case 'PARENT':
        router.push('/parent');
        break;
      default:
        alert("نقش شما در سیستم تعریف نشده است. لطفا مجددا امتحان کنید و یا با مدیر سیستم تماس بگیرید")
        break;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        // Set cookies for authentication
        document.cookie = `token=${data.token}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `userRole=${data.user.role}; path=/; max-age=86400; secure; samesite=strict`;

        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));

        redirectByRole(data.user.role)

      } else {
        const errorData = await response.json();
        setError(errorData.message || 'خطا در ورود به سیستم');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    ADMIN: Shield,
    TEACHER: BookOpen,
    STUDENT: GraduationCap,
    PARENT: Users
  };

  const roleLabels = {
    ADMIN: 'مدیر سیستم',
    TEACHER: 'معلم',
    STUDENT: 'دانش‌آموز',
    PARENT: 'اولیا'
  };
  const checkAuth = async () => {
    const authRequest = await fetch("/api/auth")
    if (authRequest.ok) {
      const res: authResponse = await authRequest.json()
      if (res.authenticated) {
        redirectByRole(res.user.role)
      }
    } else {
      setLoginStatus({...loginStatus, status:false})
    }
  }
  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <>
      {loginStatus.status &&
        <div className='fixed top-0 left-0 w-full h-screen backdrop-blur-lg bg-white/50 z-20 flex justify-center items-center'>
          <p className='text-center text-lg'>{loginStatus.message}</p>
        </div>
      }
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo and Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">سیستم مدیریت کلاس</h1>
            <p className="text-gray-600">ورود به پنل مدیریت آموزشی</p>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">ورود به سیستم</CardTitle>
              <CardDescription className="text-center">
                اطلاعات کاربری خود را برای ورود وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role">نقش کاربری</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="نقش خود را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent style={{ direction: "rtl" }}>
                      {Object.entries(roleLabels).map(([role, label]) => {
                        const Icon = roleIcons[role as keyof typeof roleIcons];
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2 justify-start" style={{ direction: "rtl" }}>
                              <Icon className="w-4 h-4" />
                              <span className='mx-2'> {label} </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">نام کاربری</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="text-center"
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="رمز عبور خود را وارد کنید"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="text-center"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      در حال ورود...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      ورود به سیستم
                    </div>
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              {/* <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">حساب‌های آزمایشی:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">مدیر:</span>
                  <span className="text-gray-600">admin@school.com / admin123</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">معلم:</span>
                  <span className="text-gray-600">teacher@school.com / teacher123</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">دانش‌آموز:</span>
                  <span className="text-gray-600">student@school.com / student123</span>
                </div>
              </div>
            </div> */}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>© ۱۴۰۳ سیستم مدیریت کلاس - تمام حقوق محفوظ است</p>
          </div>
        </div>
      </div>
    </>
  );
}