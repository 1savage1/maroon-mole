import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !['institute', 'admin'].includes(payload.role)) {
      return NextResponse.json({ error: 'هذه ميزة مدفوعة - BI Pack' }, { status: 403 });
    }

    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "apprentice"') as any[];
    const [totalInstitutes] = await pool.query('SELECT COUNT(*) as count FROM institutes') as any[];
    const [totalCompanies] = await pool.query('SELECT COUNT(*) as count FROM companies') as any[];
    const [totalSpecs] = await pool.query('SELECT COUNT(*) as count FROM specializations') as any[];
    const [attendanceStats] = await pool.query(`
      SELECT status, COUNT(*) as count FROM attendance GROUP BY status
    `) as any[];
    const [monthlyApps] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, status
      FROM institute_applications GROUP BY month, status ORDER BY month DESC LIMIT 12
    `) as any[];
    const [specStats] = await pool.query(`
      SELECT s.name, COUNT(aa.id) as apprentice_count
      FROM specializations s
      LEFT JOIN apprentice_assignments aa ON s.id = aa.specialization_id
      GROUP BY s.id ORDER BY apprentice_count DESC
    `) as any[];

    return NextResponse.json({
      isPremium: true,
      stats: {
        totalApprentices: totalUsers[0].count,
        totalInstitutes: totalInstitutes[0].count,
        totalCompanies: totalCompanies[0].count,
        totalSpecializations: totalSpecs[0].count,
      },
      attendanceStats,
      monthlyApplications: monthlyApps,
      specializationStats: specStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
