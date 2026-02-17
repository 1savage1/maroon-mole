import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie, hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const [rows] = await pool.query('SELECT c.*, u.email as user_email FROM companies c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.name');
    return NextResponse.json({ companies: rows });
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
    const { name, location, wilaya, description, email, password } = await req.json();
    const hashed = await hashPassword(password || 'company123');
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, 'company']
    ) as any[];
    const [compResult] = await pool.query(
      'INSERT INTO companies (user_id, name, location, wilaya, description) VALUES (?, ?, ?, ?, ?)',
      [userResult.insertId, name, location, wilaya, description]
    );
    return NextResponse.json({ message: 'تم إضافة الشركة', id: (compResult as any).insertId });
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
    await pool.query('DELETE FROM companies WHERE id = ?', [id]);
    return NextResponse.json({ message: 'تم حذف الشركة' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
