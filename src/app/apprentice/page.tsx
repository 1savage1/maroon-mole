'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, FileText, ClipboardCheck, MessageSquare, Bell, LogOut, Briefcase, Send, Building2, MapPin } from 'lucide-react';

export default function ApprenticePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyApps, setCompanyApps] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'apprentice') router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetch('/api/grades').then(r => r.json()).then(d => setGrades(d.grades || []));
      fetch('/api/attendance').then(r => r.json()).then(d => setAttendance(d.attendance || []));
      fetch('/api/remarks').then(r => r.json()).then(d => setRemarks(d.remarks || []));
      fetch('/api/notifications').then(r => r.json()).then(d => setNotifications(d.notifications || []));
      fetch('/api/companies').then(r => r.json()).then(d => setCompanies(d.companies || []));
      fetch('/api/applications/company').then(r => r.json()).then(d => setCompanyApps(d.applications || []));
    }
  }, [user]);

  const handleApplyCompany = async (companyId: number) => {
    setMessage('');
    const res = await fetch('/api/applications/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId, specialization_id: 1 }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetch('/api/applications/company').then(r => r.json()).then(d => setCompanyApps(d.applications || []));
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
  );

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-emerald-800">منهاج</span>
            <Badge className="bg-emerald-100 text-emerald-700">متمهن</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-500 cursor-pointer" />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await logout(); router.push('/'); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center">{message}</div>}

        <Tabs defaultValue="grades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="grades"><FileText className="h-4 w-4 ml-1" /> كشف النقاط</TabsTrigger>
            <TabsTrigger value="attendance"><ClipboardCheck className="h-4 w-4 ml-1" /> الحضور</TabsTrigger>
            <TabsTrigger value="remarks"><MessageSquare className="h-4 w-4 ml-1" /> الملاحظات</TabsTrigger>
            <TabsTrigger value="companies"><Briefcase className="h-4 w-4 ml-1" /> الشركات</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-4 w-4 ml-1" /> الإشعارات</TabsTrigger>
          </TabsList>

          <TabsContent value="grades">
            <Card>
              <CardHeader><CardTitle>كشوف النقاط</CardTitle><CardDescription>كشوف النقاط المرسلة من مؤسسة التمهين</CardDescription></CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد كشوف نقاط بعد</p>
                ) : (
                  <div className="space-y-3">
                    {grades.map((g: any) => (
                      <div key={g.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="font-medium">{g.title}</p>
                          <p className="text-sm text-muted-foreground">{g.semester} - {new Date(g.created_at).toLocaleDateString('ar-DZ')}</p>
                        </div>
                        <a href={g.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm"><FileText className="h-4 w-4 ml-1" /> تحميل PDF</Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>سجل الحضور والغياب</CardTitle>
                <CardDescription>يتم تسجيل الحضور من طرف الشركة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="py-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
                      <p className="text-sm text-emerald-700">حاضر</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="py-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                      <p className="text-sm text-red-700">غائب</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="py-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                      <p className="text-sm text-yellow-700">متأخر</p>
                    </CardContent>
                  </Card>
                </div>
                {attendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">لا يوجد سجل حضور بعد</p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span>{new Date(a.date).toLocaleDateString('ar-DZ')}</span>
                        <Badge variant={a.status === 'present' ? 'default' : a.status === 'absent' ? 'destructive' : 'secondary'}>
                          {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غائب' : 'متأخر'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remarks">
            <Card>
              <CardHeader><CardTitle>الملاحظات</CardTitle><CardDescription>ملاحظات من الشركة أو المعهد</CardDescription></CardHeader>
              <CardContent>
                {remarks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد ملاحظات بعد</p>
                ) : (
                  <div className="space-y-3">
                    {remarks.map((r: any) => (
                      <div key={r.id} className="bg-gray-50 p-4 rounded-lg">
                        <p>{r.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">بواسطة: {r.written_by_name} - {new Date(r.created_at).toLocaleDateString('ar-DZ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الشركات المتاحة للتمهين</h3>
              {companyApps.length > 0 && (
                <Card className="mb-4">
                  <CardHeader><CardTitle className="text-base">طلباتي للشركات</CardTitle></CardHeader>
                  <CardContent>
                    {companyApps.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
                        <div>
                          <p className="font-medium">{app.company_name}</p>
                          <p className="text-sm text-muted-foreground">{app.specialization_name}</p>
                        </div>
                        <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {app.status === 'pending' ? 'قيد المراجعة' : app.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((c: any) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-orange-600" /> {c.name}</CardTitle>
                      <CardDescription><MapPin className="h-3 w-3 inline ml-1" />{c.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                      {c.specializations && <p className="text-xs mb-3">التخصصات: {c.specializations}</p>}
                      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApplyCompany(c.id)}>
                        <Send className="h-4 w-4 ml-1" /> تقديم طلب تمهين
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">لا توجد إشعارات</CardContent></Card>
              ) : notifications.map((n: any) => (
                <Card key={n.id} className={!n.is_read ? 'border-emerald-200 bg-emerald-50/50' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString('ar-DZ')}</p>
                      </div>
                      {!n.is_read && <Badge className="bg-emerald-600">جديد</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
