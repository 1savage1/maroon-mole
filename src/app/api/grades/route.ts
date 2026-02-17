import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id') || payload.id;
    const [rows] = await pool.query('SELECT * FROM grades WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return NextResponse.json({ grades: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'institute') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { user_id, title, file_url, semester } = await req.json();
    await pool.query(
      'INSERT INTO grades (user_id, title, file_url, semester, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [user_id, title, file_url, semester, payload.id]
    );
    return NextResponse.json({ message: 'تم رفع كشف النقاط' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
