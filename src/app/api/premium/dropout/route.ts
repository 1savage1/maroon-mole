import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !['institute', 'admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'هذه ميزة مدفوعة - Premium Analytics' }, { status: 403 });
    }
    // AI Dropout prediction logic
    const [apprentices] = await pool.query(`
      SELECT u.id, u.name, u.email,
        (SELECT COUNT(*) FROM attendance WHERE user_id = u.id AND status = 'absent') as absent_count,
        (SELECT COUNT(*) FROM attendance WHERE user_id = u.id) as total_attendance,
        (SELECT COUNT(*) FROM remarks WHERE user_id = u.id) as remark_count,
        aa.specialization_id, s.name as specialization_name
      FROM users u
      JOIN apprentice_assignments aa ON u.id = aa.user_id AND aa.status = 'active'
      LEFT JOIN specializations s ON aa.specialization_id = s.id
      WHERE u.role = 'apprentice'
    `) as any[];

    const predictions = apprentices.map((a: any) => {
      const absentRate = a.total_attendance > 0 ? (a.absent_count / a.total_attendance) * 100 : 0;
      let riskLevel = 'low';
      const reasons: string[] = [];
      const actions: string[] = [];

      if (absentRate > 40) {
        riskLevel = 'high';
        reasons.push('نسبة غياب مرتفعة جدا (' + Math.round(absentRate) + '%)');
        actions.push('جلسة دعم فردية عاجلة');
        actions.push('تواصل مع ولي الأمر');
      } else if (absentRate > 20) {
        riskLevel = 'medium';
        reasons.push('نسبة غياب متوسطة (' + Math.round(absentRate) + '%)');
        actions.push('متابعة أسبوعية');
      }

      if (a.remark_count > 5) {
        riskLevel = riskLevel === 'low' ? 'medium' : 'high';
        reasons.push('عدد ملاحظات مرتفع');
        actions.push('تغيير مجموعة التدريب');
      }

      if (a.total_attendance < 5) {
        reasons.push('عدد أيام حضور قليل جدا');
        actions.push('محتوى تعليمي إضافي');
      }

      return {
        id: a.id,
        name: a.name,
        email: a.email,
        specialization: a.specialization_name,
        riskLevel,
        absentRate: Math.round(absentRate),
        reasons,
        suggestedActions: actions,
      };
    }).filter((p: any) => p.riskLevel !== 'low');

    return NextResponse.json({ predictions, isPremium: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
