import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // Get apprentice profile with skills
    const [apprentices] = await pool.query(`
      SELECT u.id, u.name, u.email,
        s.name as specialization,
        (SELECT COUNT(*) FROM attendance WHERE user_id = u.id AND status = 'present') as present_days,
        (SELECT COUNT(*) FROM attendance WHERE user_id = u.id) as total_days,
        (SELECT COUNT(*) FROM grades WHERE user_id = u.id) as grade_count
      FROM users u
      JOIN apprentice_assignments aa ON u.id = aa.user_id AND aa.status = 'active'
      LEFT JOIN specializations s ON aa.specialization_id = s.id
      WHERE u.role = 'apprentice'
    `) as any[];

    // Get companies looking for apprentices
    const [jobs] = await pool.query(`
      SELECT c.id as company_id, c.name as company_name, c.location,
        s.name as specialization, s.id as specialization_id
      FROM companies c
      JOIN company_specializations cs ON c.id = cs.company_id
      JOIN specializations s ON cs.specialization_id = s.id
    `) as any[];

    // Matching logic
    const matches = apprentices.map((a: any) => {
      const matchedJobs = jobs.filter((j: any) => j.specialization === a.specialization);
      const attendanceRate = a.total_days > 0 ? Math.round((a.present_days / a.total_days) * 100) : 0;
      return {
        apprentice: { id: a.id, name: a.name, specialization: a.specialization, attendanceRate, gradeCount: a.grade_count },
        matchedCompanies: matchedJobs.map((j: any) => ({
          companyId: j.company_id,
          companyName: j.company_name,
          location: j.location,
          matchScore: Math.min(100, attendanceRate + (a.grade_count * 5)),
        })).sort((a: any, b: any) => b.matchScore - a.matchScore),
      };
    });

    return NextResponse.json({ matches, isPremium: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
