'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Building2, Briefcase, BookOpen, ArrowLeft, Users, Shield } from 'lucide-react';

export default function Home() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('home');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (user) {
    if (user.role === 'admin') router.push('/admin');
    else if (user.role === 'institute') router.push('/institute');
    else if (user.role === 'company') router.push('/company');
    else if (user.role === 'apprentice') router.push('/apprentice');
    else router.push('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    if (!res.ok) setError(res.data.error);
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await register(regName, regEmail, regPassword, regPhone);
    if (!res.ok) setError(res.data.error);
    setSubmitting(false);
  };

  if (tab === 'login') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <button onClick={() => setTab('home')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> العودة
          </button>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</p>}
            <Input placeholder="البريد الإلكتروني" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            <Input placeholder="كلمة المرور" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  if (tab === 'register') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <button onClick={() => setTab('home')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" /> العودة
          </button>
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>سجل الآن للانضمام إلى منصة منهاج</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{error}</p>}
            <Input placeholder="الاسم الكامل" value={regName} onChange={e => setRegName(e.target.value)} required />
            <Input placeholder="البريد الإلكتروني" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
            <Input placeholder="رقم الهاتف" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
            <Input placeholder="كلمة المرور" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
              {submitting ? 'جاري التسجيل...' : 'تسجيل'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  if (tab === 'guide') return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setTab('home')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> العودة
        </button>
        <h1 className="text-3xl font-bold mb-8 text-emerald-800">دليل منصة منهاج</h1>
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-600" /> للمتمهنين</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>1. قم بإنشاء حساب جديد على المنصة</p>
              <p>2. تصفح المعاهد والتخصصات المتاحة</p>
              <p>3. اختر التخصص والمعهد المناسب وقدم طلب انخراط</p>
              <p>4. بعد قبول طلبك، تصفح الشركات المتاحة وقدم طلب تمهين</p>
              <p>5. بعد قبولك في الشركة، يمكنك متابعة كشوف النقاط والحضور والملاحظات</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" /> للمعاهد</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>1. يتم إنشاء حسابك من طرف إدارة المنصة</p>
              <p>2. إدارة طلبات الانخراط (قبول/رفض)</p>
              <p>3. نشر إعلانات للمتمهنين حسب التخصص</p>
              <p>4. متابعة معلومات المتمهنين والحضور والملاحظات</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-orange-600" /> للشركات</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>1. يتم إنشاء حسابك من طرف إدارة المنصة</p>
              <p>2. تسجيل حضور وغيابات المتمهنين</p>
              <p>3. كتابة ملاحظات على أداء المتمهنين</p>
              <p>4. إرسال إشعارات للمتمهنين</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-600 p-4 rounded-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              منصة <span className="text-emerald-600">منهاج</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              منصة رقمية تربط بين المعاهد والشركات والمتمهنين في الجزائر لتحديث وتسهيل مسار التكوين المهني
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8" onClick={() => setTab('register')}>
                إنشاء حساب
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50" onClick={() => setTab('login')}>
                تسجيل الدخول
              </Button>
              <Button size="lg" variant="ghost" className="text-lg px-8 text-emerald-700" onClick={() => setTab('guide')}>
                <BookOpen className="h-5 w-5 ml-2" /> دليل المنهاج
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => router.push('/explore')}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>المعاهد</CardTitle>
              <CardDescription>تصفح جميع معاهد التكوين المهني في الجزائر</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => router.push('/explore')}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <CardTitle>التخصصات</CardTitle>
              <CardDescription>اكتشف التخصصات المتاحة واختر ما يناسبك</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Briefcase className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <CardTitle>الشركات</CardTitle>
              <CardDescription>تواصل مع الشركات التي تبحث عن متمهنين</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Premium Features */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">الميزات المدفوعة <span className="text-emerald-600">Premium</span></h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader>
                <CardTitle className="text-lg">ذكاء اصطناعي وتحليلات</CardTitle>
                <CardDescription>توقع التسرب واقتراح خطط إنقاذ للمتربصين المعرضين للانسحاب</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-lg">لوحات قيادة متقدمة</CardTitle>
                <CardDescription>تقارير PDF/Excel جاهزة مع فلترة متقدمة شهرية وفصلية وسنوية</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader>
                <CardTitle className="text-lg">بوابة التوظيف</CardTitle>
                <CardDescription>مطابقة تلقائية بين المتربصين وفرص العمل مع ملفات مهنية</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
