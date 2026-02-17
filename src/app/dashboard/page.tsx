'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, GraduationCap, User, Search, MapPin, Home, LogOut, Bell, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [searchInst, setSearchInst] = useState('');
  const [searchSpec, setSearchSpec] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [selectedSpec, setSelectedSpec] = useState<any>(null);
  const [instSpecs, setInstSpecs] = useState<any[]>([]);
  const [specInstitutes, setSpecInstitutes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [applySpecId, setApplySpecId] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'user') {
      router.push(`/${user.role}`);
    }
  }, [user, loading]);

  useEffect(() => {
    fetchInstitutes();
    fetchSpecializations();
    fetchNotifications();
    fetchApplications();
  }, []);

  const fetchInstitutes = async (search = '') => {
    const res = await fetch(`/api/institutes?search=${search}`);
    const data = await res.json();
    setInstitutes(data.institutes || []);
  };

  const fetchSpecializations = async (search = '') => {
    const res = await fetch(`/api/specializations?search=${search}`);
    const data = await res.json();
    setSpecializations(data.specializations || []);
  };

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications');
    if (res.ok) { const data = await res.json(); setNotifications(data.notifications || []); }
  };

  const fetchApplications = async () => {
    const res = await fetch('/api/applications/institute');
    if (res.ok) { const data = await res.json(); setApplications(data.applications || []); }
  };

  const fetchInstituteSpecs = async (instId: number) => {
    const res = await fetch(`/api/specializations?institute_id=${instId}`);
    const data = await res.json();
    setInstSpecs(data.specializations || []);
  };

  const fetchSpecInstitutes = async (specId: number) => {
    const res = await fetch(`/api/institutes?specialization_id=${specId}`);
    const data = await res.json();
    setSpecInstitutes(data.institutes || []);
  };

  const handleApplyInstitute = async (instituteId: number, specId: number) => {
    setMessage('');
    const res = await fetch('/api/applications/institute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institute_id: instituteId, specialization_id: specId }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchApplications();
  };

  const handleApplyCompany = async (companyId: number, specId: number) => {
    setMessage('');
    const res = await fetch('/api/applications/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId, specialization_id: specId }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-emerald-800">منهاج</span>
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
        {message && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-center">{message}</div>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="profile"><User className="h-4 w-4 ml-1" /> حسابي</TabsTrigger>
            <TabsTrigger value="institutes"><Building2 className="h-4 w-4 ml-1" /> المعاهد</TabsTrigger>
            <TabsTrigger value="specializations"><GraduationCap className="h-4 w-4 ml-1" /> التخصصات</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-4 w-4 ml-1" /> الإشعارات</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>حسابي الشخصي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-muted-foreground">الاسم</span><p className="font-medium">{user.name}</p></div>
                  <div><span className="text-sm text-muted-foreground">البريد الإلكتروني</span><p className="font-medium">{user.email}</p></div>
                  <div><span className="text-sm text-muted-foreground">الهاتف</span><p className="font-medium">{user.phone || 'غير محدد'}</p></div>
                  <div><span className="text-sm text-muted-foreground">الدور</span><p><Badge variant="secondary">{user.role === 'user' ? 'مستخدم' : user.role}</Badge></p></div>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">طلباتي</h3>
                  {applications.length === 0 ? (
                    <p className="text-muted-foreground text-sm">لا توجد طلبات بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {applications.map((app: any) => (
                        <div key={app.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium">{app.institute_name}</p>
                            <p className="text-sm text-muted-foreground">{app.specialization_name}</p>
                          </div>
                          <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {app.status === 'pending' ? 'قيد المراجعة' : app.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institutes Tab */}
          <TabsContent value="institutes">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="ابحث عن معهد..." className="pr-10" value={searchInst}
                    onChange={e => { setSearchInst(e.target.value); fetchInstitutes(e.target.value); }} />
                </div>
              </div>
              {selectedInstitute ? (
                <div>
                  <Button variant="ghost" onClick={() => setSelectedInstitute(null)} className="mb-4">العودة للقائمة</Button>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" /> {selectedInstitute.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {selectedInstitute.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge>{selectedInstitute.wilaya}</Badge>
                        <Badge variant={selectedInstitute.has_residence ? 'default' : 'secondary'}>
                          {selectedInstitute.has_residence ? 'يوجد إقامة' : 'لا توجد إقامة'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{selectedInstitute.description}</p>
                      <h3 className="font-semibold mb-3">التخصصات المتاحة</h3>
                      {selectedInstitute.specializations ? (
                        <div className="space-y-2">
                          {selectedInstitute.specializations.split(', ').map((spec: string, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <span>{spec}</span>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                  const specObj = specializations.find(s => s.name === spec);
                                  if (specObj) handleApplyInstitute(selectedInstitute.id, specObj.id);
                                }}>
                                <Send className="h-4 w-4 ml-1" /> تقديم طلب
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-muted-foreground text-sm">لا توجد تخصصات</p>}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {institutes.map((inst: any) => (
                    <Card key={inst.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedInstitute(inst)}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" /> {inst.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {inst.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{inst.wilaya}</Badge>
                          <Badge variant={inst.has_residence ? 'default' : 'secondary'} className="text-xs">
                            <Home className="h-3 w-3 ml-1" /> {inst.has_residence ? 'إقامة' : 'بدون إقامة'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Specializations Tab */}
          <TabsContent value="specializations">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ابحث عن تخصص..." className="pr-10" value={searchSpec}
                  onChange={e => { setSearchSpec(e.target.value); fetchSpecializations(e.target.value); }} />
              </div>
              {selectedSpec ? (
                <div>
                  <Button variant="ghost" onClick={() => { setSelectedSpec(null); setSpecInstitutes([]); }} className="mb-4">العودة للقائمة</Button>
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle>{selectedSpec.name}</CardTitle>
                      <CardDescription>{selectedSpec.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge>المدة: {selectedSpec.duration}</Badge>
                    </CardContent>
                  </Card>
                  <h3 className="font-semibold mb-3">المعاهد التي تقدم هذا التخصص</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {specInstitutes.map((inst: any) => (
                      <Card key={inst.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{inst.name}</CardTitle>
                          <CardDescription><MapPin className="h-3 w-3 inline ml-1" />{inst.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <Badge variant={inst.has_residence ? 'default' : 'secondary'}>
                              {inst.has_residence ? 'إقامة' : 'بدون إقامة'}
                            </Badge>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApplyInstitute(inst.id, selectedSpec.id)}>
                              <Send className="h-4 w-4 ml-1" /> تقديم طلب
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specializations.map((spec: any) => (
                    <Card key={spec.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={async () => {
                        setSelectedSpec(spec);
                        const res = await fetch(`/api/institutes?search=`);
                        const data = await res.json();
                        setSpecInstitutes(data.institutes || []);
                      }}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-emerald-600" /> {spec.name}
                        </CardTitle>
                        <CardDescription>{spec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">المدة: {spec.duration}</Badge>
                          <Badge>{spec.institute_count} معهد</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
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
