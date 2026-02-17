'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, GraduationCap, Building2, ArrowLeft } from 'lucide-react';

export default function ExplorePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [institutes, setInstitutes] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchInstitutes();
    }, [search]);

    const fetchInstitutes = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);

        const res = await fetch(`/api/institutes/public?${params.toString()}`);
        if (res.ok) {
            const data = await res.json();
            setInstitutes(data.institutes || []);
        }
        setLoading(false);
    };

    const handleApply = async (instituteId: number, specializationId: number) => {
        if (!user) {
            router.push('/');
            return;
        }

        setApplying(`${instituteId}-${specializationId}`);
        try {
            const res = await fetch('/api/applications/institute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ institute_id: instituteId, specialization_id: specializationId }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('تم إرسال طلبك بنجاح');
            } else {
                alert(data.error || 'حدث خطأ ما');
            }
        } catch (err) {
            alert('فشل الاتصال بالخادم');
        } finally {
            setApplying(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <GraduationCap className="h-8 w-8 text-emerald-600" />
                        <span className="font-bold text-xl text-emerald-800">منهاج</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push('/')}>
                            <ArrowLeft className="h-4 w-4 ml-2" /> العودة للرئيسية
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">اكتشف المعاهد والتخصصات</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                        ابحث عن المعهد المناسب لك واختر التخصص الذي ترغب في دراسته لبدء مسارك المهني
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            className="pr-10"
                            placeholder="ابحث عن معهد أو تخصص..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : institutes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg">لا توجد نتائج مطابقة لبحثك</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {institutes.map((inst: any) => (
                            <Card key={inst.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-32 bg-emerald-600 flex items-center justify-center">
                                    <Building2 className="h-16 w-16 text-emerald-100 opacity-50" />
                                </div>
                                <CardHeader>
                                    <CardTitle>{inst.name}</CardTitle>
                                    <div className="flex items-center text-sm text-gray-500 gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{inst.location} ({inst.wilaya})</span>
                                    </div>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {inst.description || 'معهد تكوين مهني'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold text-sm mb-3">التخصصات المتاحة:</h4>
                                    {inst.specialties && inst.specialties.length > 0 ? (
                                        <div className="space-y-3">
                                            {inst.specialties.map((spec: any) => (
                                                <div key={spec.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                                    <span>{spec.name}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                                        onClick={() => handleApply(inst.id, spec.id)}
                                                        disabled={applying === `${inst.id}-${spec.id}`}
                                                    >
                                                        {applying === `${inst.id}-${spec.id}` ? 'جاري...' : 'تسجيل'}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">لا توجد تخصصات مضافة حالياً</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
