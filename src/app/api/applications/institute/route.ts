import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { institute_id, specialization_id } = await req.json();
    const [existing] = await pool.query(
      'SELECT id FROM institute_applications WHERE user_id = ? AND institute_id = ? AND specialization_id = ? AND status = ?',
      [payload.id, institute_id, specialization_id, 'pending']
    ) as any[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'لقد تقدمت بطلب بالفعل' }, { status: 400 });
    }
    await pool.query(
      'INSERT INTO institute_applications (user_id, institute_id, specialization_id) VALUES (?, ?, ?)',
      [payload.id, institute_id, specialization_id]
    );
    return NextResponse.json({ message: 'تم إرسال الطلب بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    
    if (payload.role === 'institute') {
      const [inst] = await pool.query('SELECT id FROM institutes WHERE user_id = ?', [payload.id]) as any[];
      if (inst.length === 0) return NextResponse.json({ applications: [] });
      const [rows] = await pool.query(
        `SELECT ia.*, u.name as user_name, u.email as user_email, u.phone as user_phone, 
         s.name as specialization_name 
         FROM institute_applications ia 
         JOIN users u ON ia.user_id = u.id 
         JOIN specializations s ON ia.specialization_id = s.id 
         WHERE ia.institute_id = ? ORDER BY ia.created_at DESC`,
        [inst[0].id]
      );
      return NextResponse.json({ applications: rows });
    }
    
    const [rows] = await pool.query(
      `SELECT ia.*, i.name as institute_name, s.name as specialization_name 
       FROM institute_applications ia 
       JOIN institutes i ON ia.institute_id = i.id 
       JOIN specializations s ON ia.specialization_id = s.id 
       WHERE ia.user_id = ? ORDER BY ia.created_at DESC`,
      [payload.id]
    );
    return NextResponse.json({ applications: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'institute') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { application_id, status } = await req.json();
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }
    const [app] = await pool.query('SELECT * FROM institute_applications WHERE id = ?', [application_id]) as any[];
    if (app.length === 0) return NextResponse.json({ error: 'طلب غير موجود' }, { status: 404 });
    
    await pool.query('UPDATE institute_applications SET status = ? WHERE id = ?', [status, application_id]);
    
    if (status === 'accepted') {
      await pool.query('UPDATE users SET role = ? WHERE id = ?', ['apprentice', app[0].user_id]);
      await pool.query(
        'INSERT INTO apprentice_assignments (user_id, institute_id, specialization_id) VALUES (?, ?, ?)',
        [app[0].user_id, app[0].institute_id, app[0].specialization_id]
      );
    }
    
    const statusText = status === 'accepted' ? 'تم قبول طلبك' : 'تم رفض طلبك';
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, from_role, from_id) VALUES (?, ?, ?, ?, ?)',
      [app[0].user_id, statusText, `${statusText} في المعهد`, 'institute', payload.id]
    );
    
    return NextResponse.json({ message: 'تم تحديث الطلب' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
