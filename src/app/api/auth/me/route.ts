import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const [rows] = await pool.query('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?', [payload.id]) as any[];
    if (rows.length === 0) return NextResponse.json({ error: 'مستخدم غير موجود' }, { status: 404 });
    return NextResponse.json({ user: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
