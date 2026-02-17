import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]) as any[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
    }
    const hashed = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, 'user']
    ) as any[];
    const token = signToken({ id: result.insertId, email, role: 'user', name });
    const response = NextResponse.json({ message: 'تم التسجيل بنجاح', user: { id: result.insertId, name, email, role: 'user' } });
    response.cookies.set('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
