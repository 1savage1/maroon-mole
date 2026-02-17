import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const [rows] = await pool.query('SELECT i.*, u.email as user_email FROM institutes i LEFT JOIN users u ON i.user_id = u.id ORDER BY i.name');
    return NextResponse.json({ institutes: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { name, location, wilaya, has_residence, description, email, password } = await req.json();
    const hashed = await hashPassword(password || 'institute123');
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, 'institute']
    ) as any[];
    const [instResult] = await pool.query(
      'INSERT INTO institutes (user_id, name, location, wilaya, has_residence, description) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, name, location, wilaya, has_residence || false, description]
    );
    return NextResponse.json({ message: 'تم إضافة المعهد', id: (instResult as any).insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { id } = await req.json();
    await pool.query('DELETE FROM institutes WHERE id = ?', [id]);
    return NextResponse.json({ message: 'تم حذف المعهد' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
