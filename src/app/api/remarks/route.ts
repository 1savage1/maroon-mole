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
    const [rows] = await pool.query(
      `SELECT r.*, u.name as written_by_name FROM remarks r 
       LEFT JOIN users u ON r.written_by = u.id 
       WHERE r.user_id = ? ORDER BY r.created_at DESC`, [userId]
    );
    return NextResponse.json({ remarks: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !['company', 'institute'].includes(payload.role)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { user_id, content } = await req.json();
    await pool.query('INSERT INTO remarks (user_id, content, written_by) VALUES (?, ?, ?)', [user_id, content, payload.id]);
    return NextResponse.json({ message: 'تم إضافة الملاحظة' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
