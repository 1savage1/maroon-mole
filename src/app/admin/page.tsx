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
import { Switch } from '@/components/ui/switch';
import { GraduationCap, Building2, Briefcase, LogOut, Plus, Trash2, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  // Institute form
  const [instName, setInstName] = useState('');
  const [instLocation, setInstLocation] = useState('');
  const [instWilaya, setInstWilaya] = useState('');
  const [instResidence, setInstResidence] = useState(false);
  const [instDesc, setInstDesc] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPassword, setInstPassword] = useState('');
  // Company form
  const [compName, setCompName] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compWilaya, setCompWilaya] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compPassword, setCompPassword] = useState('');
  const [openInstDialog, setOpenInstDialog] = useState(false);
  const [openCompDialog, setOpenCompDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'admin') router.push('/');
  }, [user, loading]);
    

  
  useEffect(() => {
    if (user && user.role === 'admin') { fetchInstitutes(); fetchCompanies(); }
  }, [user]);

  const fetchInstitutes = async () => {
    const res = await fetch('/api/admin/institutes');
    if (res.ok) { const d = await res.json(); setInstitutes(d.institutes || []); }
  };

  const fetchCompanies = async () => {
    const res = await fetch('/api/admin/companies');
    if (res.ok) { const d = await res.json(); setCompanies(d.companies || []); }
  };

  const addInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/institutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: instName, location: instLocation, wilaya: instWilaya, has_residence: instResidence, description: instDesc, email: instEmail, password: instPassword }),
    });
    const d = await res.json();
    setMessage(d.message || d.error);
    if (res.ok) { setOpenInstDialog(false); setInstName(''); setInstLocation(''); setInstWilaya(''); setInstResidence(false); setInstDesc(''); setInstEmail(''); setInstPassword(''); fetchInstitutes(); }
  };

  const addCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: compName, location: compLocation, wilaya: compWilaya, description: compDesc, email: compEmail, password: compPassword }),
    });
    const d = await res.json();
    setMessage(d.message || d.error);
    if (res.ok) { setOpenCompDialog(false); setCompName(''); setCompLocation(''); setCompWilaya(''); setCompDesc(''); setCompEmail(''); setCompPassword(''); fetchCompanies(); }
  };

  const deleteInstitute = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المعهد؟')) return;
    const res = await fetch('/api/admin/institutes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const d = await res.json();
    setMessage(d.message || d.error);
    fetchInstitutes();
  };

  const deleteCompany = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;
    const res = await fetch('/api/admin/companies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const d = await res.json();
    setMessage(d.message || d.error);
    fetchCompanies();
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="font-bold text-xl text-emerald-800">منهاج</span>
            <Badge className="bg-red-100 text-red-700"><Shield className="h-3 w-3 ml-1" /> مدير</Badge>
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{institutes.length}</p>
              <p className="text-sm text-muted-foreground">المعاهد</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6 text-center">
              <p className="text-3xl font-bold text-orange-600">{companies.length}</p>
              <p className="text-sm text-muted-foreground">الشركات</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="institutes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="institutes"><Building2 className="h-4 w-4 ml-1" /> المعاهد</TabsTrigger>
            <TabsTrigger value="companies"><Briefcase className="h-4 w-4 ml-1" /> الشركات</TabsTrigger>
          </TabsList>

          <TabsContent value="institutes">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">إدارة المعاهد</h2>
              <Dialog open={openInstDialog} onOpenChange={setOpenInstDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 ml-1" /> إضافة معهد</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>إضافة معهد جديد</DialogTitle></DialogHeader>
                  <form onSubmit={addInstitute} className="space-y-3">
                    <Input placeholder="اسم المعهد" value={instName} onChange={e => setInstName(e.target.value)} required />
                    <Input placeholder="العنوان" value={instLocation} onChange={e => setInstLocation(e.target.value)} required />
                    <Input placeholder="الولاية" value={instWilaya} onChange={e => setInstWilaya(e.target.value)} required />
                    <div className="flex items-center gap-2">
                      <Switch checked={instResidence} onCheckedChange={setInstResidence} />
                      <span className="text-sm">يوجد إقامة</span>
                    </div>
                    <Textarea placeholder="الوصف" value={instDesc} onChange={e => setInstDesc(e.target.value)} />
                    <Input placeholder="البريد الإلكتروني للحساب" type="email" value={instEmail} onChange={e => setInstEmail(e.target.value)} required />
                    <Input placeholder="كلمة المرور" type="password" value={instPassword} onChange={e => setInstPassword(e.target.value)} required />
                    <Button type="submit" className="w-full bg-emerald-600">إضافة</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {institutes.map((inst: any) => (
                <Card key={inst.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{inst.name}</p>
                      <p className="text-sm text-muted-foreground">{inst.location} - {inst.wilaya}</p>
                      {inst.user_email && <p className="text-xs text-muted-foreground">الحساب: {inst.user_email}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={inst.has_residence ? 'default' : 'secondary'}>{inst.has_residence ? 'إقامة' : 'بدون'}</Badge>
                      <Button variant="destructive" size="sm" onClick={() => deleteInstitute(inst.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">إدارة الشركات</h2>
              <Dialog open={openCompDialog} onOpenChange={setOpenCompDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4 ml-1" /> إضافة شركة</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>إضافة شركة جديدة</DialogTitle></DialogHeader>
                  <form onSubmit={addCompany} className="space-y-3">
                    <Input placeholder="اسم الشركة" value={compName} onChange={e => setCompName(e.target.value)} required />
                    <Input placeholder="العنوان" value={compLocation} onChange={e => setCompLocation(e.target.value)} required />
                    <Input placeholder="الولاية" value={compWilaya} onChange={e => setCompWilaya(e.target.value)} required />
                    <Textarea placeholder="الوصف" value={compDesc} onChange={e => setCompDesc(e.target.value)} />
                    <Input placeholder="البريد الإلكتروني للحساب" type="email" value={compEmail} onChange={e => setCompEmail(e.target.value)} required />
                    <Input placeholder="كلمة المرور" type="password" value={compPassword} onChange={e => setCompPassword(e.target.value)} required />
                    <Button type="submit" className="w-full bg-emerald-600">إضافة</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {companies.map((comp: any) => (
                <Card key={comp.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{comp.name}</p>
                      <p className="text-sm text-muted-foreground">{comp.location} - {comp.wilaya}</p>
                      {comp.user_email && <p className="text-xs text-muted-foreground">الحساب: {comp.user_email}</p>}
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteCompany(comp.id)}><Trash2 className="h-4 w-4" /></Button>
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
