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
      'SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    return NextResponse.json({ attendance: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'company') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { user_id, date, status, note } = await req.json();
    await pool.query(
      'INSERT INTO attendance (user_id, date, status, note, marked_by) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), note = VALUES(note)',
      [user_id, date, status, note || null, payload.id]
    );
    return NextResponse.json({ message: 'تم تسجيل الحضور' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
