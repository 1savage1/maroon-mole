'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Users, ClipboardCheck, MessageSquare, LogOut, Briefcase } from 'lucide-react';

export default function CompanyPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApprentice, setSelectedApprentice] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('present');
  const [attNote, setAttNote] = useState('');
  const [remarkContent, setRemarkContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'company') router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    const res = await fetch('/api/applications/company');
    if (res.ok) { const data = await res.json(); setApplications(data.applications || []); }
  };

  const handleDecision = async (appId: number, status: string) => {
    const res = await fetch('/api/applications/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: appId, status }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchApplications();
  };

  const selectApprentice = async (app: any) => {
    setSelectedApprentice(app);
    const [attRes, remRes] = await Promise.all([
      fetch(`/api/attendance?user_id=${app.user_id}`),
      fetch(`/api/remarks?user_id=${app.user_id}`),
    ]);
    if (attRes.ok) { const d = await attRes.json(); setAttendance(d.attendance || []); }
    if (remRes.ok) { const d = await remRes.json(); setRemarks(d.remarks || []); }
  };

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApprentice) return;
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedApprentice.user_id, date: attDate, status: attStatus, note: attNote }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setAttNote('');
    const attRes = await fetch(`/api/attendance?user_id=${selectedApprentice.user_id}`);
    if (attRes.ok) { const d = await attRes.json(); setAttendance(d.attendance || []); }
  };

  const handleRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApprentice) return;
    const res = await fetch('/api/remarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedApprentice.user_id, content: remarkContent }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setRemarkContent('');
    const remRes = await fetch(`/api/remarks?user_id=${selectedApprentice.user_id}`);
    if (remRes.ok) { const d = await remRes.json(); setRemarks(d.remarks || []); }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
  );

  const accepted = applications.filter(a => a.status === 'accepted');
  const pending = applications.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-emerald-800">منهاج</span>
            <Badge className="bg-orange-100 text-orange-700">شركة</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await logout(); router.push('/'); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center">{message}</div>}

        <Tabs defaultValue="apprentices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="apprentices"><Users className="h-4 w-4 ml-1" /> المتمهنين</TabsTrigger>
            <TabsTrigger value="attendance"><ClipboardCheck className="h-4 w-4 ml-1" /> الحضور</TabsTrigger>
            <TabsTrigger value="remarks"><MessageSquare className="h-4 w-4 ml-1" /> الملاحظات</TabsTrigger>
          </TabsList>

          <TabsContent value="apprentices">
            <div className="space-y-4">
              {pending.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>طلبات جديدة</CardTitle></CardHeader>
                  <CardContent>
                    {pending.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-2">
                        <div>
                          <p className="font-medium">{app.user_name}</p>
                          <p className="text-sm text-muted-foreground">{app.user_email} - {app.specialization_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-emerald-600" onClick={() => handleDecision(app.id, 'accepted')}>قبول</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDecision(app.id, 'rejected')}>رفض</Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader><CardTitle>المتمهنين المقبولين</CardTitle></CardHeader>
                <CardContent>
                  {accepted.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لا يوجد متمهنين</p>
                  ) : (
                    <div className="space-y-2">
                      {accepted.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => selectApprentice(app)}>
                          <div>
                            <p className="font-medium">{app.user_name}</p>
                            <p className="text-sm text-muted-foreground">{app.specialization_name}</p>
                          </div>
                          <Badge>{selectedApprentice?.user_id === app.user_id ? 'محدد' : 'اختر'}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            {!selectedApprentice ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">اختر متمهن من قائمة المتمهنين أولا</CardContent></Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>تسجيل حضور: {selectedApprentice.user_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAttendance} className="space-y-4">
                      <Input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} required />
                      <Select value={attStatus} onValueChange={setAttStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">حاضر</SelectItem>
                          <SelectItem value="absent">غائب</SelectItem>
                          <SelectItem value="late">متأخر</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="ملاحظة (اختياري)" value={attNote} onChange={e => setAttNote(e.target.value)} />
                      <Button type="submit" className="bg-emerald-600">تسجيل</Button>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>سجل الحضور</CardTitle></CardHeader>
                  <CardContent>
                    {attendance.length === 0 ? <p className="text-muted-foreground text-center py-4">لا يوجد سجل</p> : (
                      <div className="space-y-2">
                        {attendance.map((a: any) => (
                          <div key={a.id} className="flex justify-between bg-gray-50 p-3 rounded-lg">
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="remarks">
            {!selectedApprentice ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">اختر متمهن من قائمة المتمهنين أولا</CardContent></Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>إضافة ملاحظة: {selectedApprentice.user_name}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleRemark} className="space-y-4">
                      <Textarea placeholder="اكتب ملاحظتك هنا..." value={remarkContent} onChange={e => setRemarkContent(e.target.value)} required rows={3} />
                      <Button type="submit" className="bg-emerald-600">إضافة ملاحظة</Button>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>الملاحظات السابقة</CardTitle></CardHeader>
                  <CardContent>
                    {remarks.length === 0 ? <p className="text-muted-foreground text-center py-4">لا توجد ملاحظات</p> : (
                      <div className="space-y-3">
                        {remarks.map((r: any) => (
                          <div key={r.id} className="bg-gray-50 p-4 rounded-lg">
                            <p>{r.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString('ar-DZ')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
