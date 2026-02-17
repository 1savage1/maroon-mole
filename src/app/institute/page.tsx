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
import { GraduationCap, Megaphone, Users, ClipboardList, LogOut, Check, X, Bell } from 'lucide-react';

export default function InstitutePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [apprentices, setApprentices] = useState<any[]>([]);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceSpecId, setAnnounceSpecId] = useState('');
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [instituteSpecs, setInstituteSpecs] = useState<any[]>([]);
  const [newSpecName, setNewSpecName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'institute') router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchSpecializations();
      fetchInstituteSpecs();
    }
  }, [user]);

  const fetchApplications = async () => {
    const res = await fetch('/api/applications/institute');
    if (res.ok) { const data = await res.json(); setApplications(data.applications || []); }
  };

  const fetchSpecializations = async () => {
    const res = await fetch('/api/specializations');
    if (res.ok) { const data = await res.json(); setSpecializations(data.specializations || []); }
  };

  const fetchInstituteSpecs = async () => {
    const res = await fetch('/api/institute/specializations');
    if (res.ok) { const data = await res.json(); setInstituteSpecs(data.specialties || []); }
  };

  const handleAddSpec = async () => {
    if (!newSpecName.trim()) return;
    const res = await fetch('/api/institute/specializations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialization_name: newSpecName.trim() }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) {
      setNewSpecName('');
      fetchInstituteSpecs();
    }
  };

  const handleRemoveSpec = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التخصص؟')) return;
    const res = await fetch('/api/institute/specializations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialization_id: id }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) fetchInstituteSpecs();
  };

  const handleDecision = async (appId: number, status: string) => {
    const res = await fetch('/api/applications/institute', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: appId, status }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchApplications();
  };

  const handleAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: announceTitle, content: announceContent, specialization_id: announceSpecId || null }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setAnnounceTitle(''); setAnnounceContent(''); setAnnounceSpecId('');
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
  );

  const pendingApps = applications.filter(a => a.status === 'pending');
  const acceptedApps = applications.filter(a => a.status === 'accepted');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-emerald-800">منهاج</span>
            <Badge className="bg-blue-100 text-blue-700">معهد</Badge>
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

        <Tabs defaultValue="demands" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="demands"><ClipboardList className="h-4 w-4 ml-1" /> الطلبات</TabsTrigger>
            <TabsTrigger value="apprentices"><Users className="h-4 w-4 ml-1" /> المتمهنين</TabsTrigger>
            <TabsTrigger value="specialties"><GraduationCap className="h-4 w-4 ml-1" /> التخصصات</TabsTrigger>
            <TabsTrigger value="announce"><Megaphone className="h-4 w-4 ml-1" /> الإعلانات</TabsTrigger>
          </TabsList>

          <TabsContent value="demands">
            <Card>
              <CardHeader>
                <CardTitle>طلبات الانخراط</CardTitle>
                <CardDescription>{pendingApps.length} طلب قيد الانتظار</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات قيد الانتظار</p>
                ) : (
                  <div className="space-y-3">
                    {pendingApps.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="font-medium">{app.user_name}</p>
                          <p className="text-sm text-muted-foreground">{app.user_email} | {app.user_phone}</p>
                          <Badge variant="outline" className="mt-1">{app.specialization_name}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleDecision(app.id, 'accepted')}>
                            <Check className="h-4 w-4 ml-1" /> قبول
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDecision(app.id, 'rejected')}>
                            <X className="h-4 w-4 ml-1" /> رفض
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apprentices">
            <Card>
              <CardHeader><CardTitle>المتمهنين المقبولين</CardTitle></CardHeader>
              <CardContent>
                {acceptedApps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا يوجد متمهنين مقبولين بعد</p>
                ) : (
                  <div className="space-y-3">
                    {acceptedApps.map((app: any) => (
                      <div key={app.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{app.user_name}</p>
                            <p className="text-sm text-muted-foreground">{app.user_email}</p>
                          </div>
                          <Badge>{app.specialization_name}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specialties">
            <Card>
              <CardHeader>
                <CardTitle>إدارة التخصصات</CardTitle>
                <CardDescription>أضف التخصصات التي يوفرها المعهد</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                    placeholder="اكتب اسم التخصص لإضافته (مثال: إعلام آلي)"
                    className="w-full"
                  />
                  <Button onClick={handleAddSpec} className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
                    إضافة تخصص
                  </Button>
                </div>

                <div className="space-y-3">
                  {instituteSpecs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لم يتم إضافة أي تخصصات بعد</p>
                  ) : (
                    instituteSpecs.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium">{s.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveSpec(s.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announce">
            <Card>
              <CardHeader><CardTitle>نشر إعلان</CardTitle><CardDescription>أرسل إعلان للمتمهنين</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleAnnounce} className="space-y-4">
                  <Input placeholder="عنوان الإعلان" value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} required />
                  <Textarea placeholder="محتوى الإعلان..." value={announceContent} onChange={e => setAnnounceContent(e.target.value)} required rows={4} />
                  <Select value={announceSpecId} onValueChange={setAnnounceSpecId}>
                    <SelectTrigger><SelectValue placeholder="اختر التخصص (اختياري - للكل)" /></SelectTrigger>
                    <SelectContent>
                      {specializations.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Megaphone className="h-4 w-4 ml-1" /> نشر الإعلان
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
