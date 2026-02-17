import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as any[];
    if (rows.length === 0) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }
    const user = rows[0];
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    const response = NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    response.cookies.set('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
