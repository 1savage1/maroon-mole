import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { company_id, specialization_id } = await req.json();
    const [existing] = await pool.query(
      'SELECT id FROM company_applications WHERE user_id = ? AND company_id = ? AND status = ?',
      [payload.id, company_id, 'pending']
    ) as any[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'لقد تقدمت بطلب بالفعل' }, { status: 400 });
    }
    await pool.query(
      'INSERT INTO company_applications (user_id, company_id, specialization_id) VALUES (?, ?, ?)',
      [payload.id, company_id, specialization_id]
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
    
    if (payload.role === 'company') {
      const [comp] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [payload.id]) as any[];
      if (comp.length === 0) return NextResponse.json({ applications: [] });
      const [rows] = await pool.query(
        `SELECT ca.*, u.name as user_name, u.email as user_email, s.name as specialization_name 
         FROM company_applications ca 
         JOIN users u ON ca.user_id = u.id 
         JOIN specializations s ON ca.specialization_id = s.id 
         WHERE ca.company_id = ? ORDER BY ca.created_at DESC`,
        [comp[0].id]
      );
      return NextResponse.json({ applications: rows });
    }
    
    const [rows] = await pool.query(
      `SELECT ca.*, c.name as company_name, s.name as specialization_name 
       FROM company_applications ca 
       JOIN companies c ON ca.company_id = c.id 
       JOIN specializations s ON ca.specialization_id = s.id 
       WHERE ca.user_id = ? ORDER BY ca.created_at DESC`,
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
    if (!payload || payload.role !== 'company') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const { application_id, status } = await req.json();
    const [app] = await pool.query('SELECT * FROM company_applications WHERE id = ?', [application_id]) as any[];
    if (app.length === 0) return NextResponse.json({ error: 'طلب غير موجود' }, { status: 404 });
    
    await pool.query('UPDATE company_applications SET status = ? WHERE id = ?', [status, application_id]);
    
    if (status === 'accepted') {
      await pool.query(
        'UPDATE apprentice_assignments SET company_id = ? WHERE user_id = ? AND company_id IS NULL',
        [app[0].company_id, app[0].user_id]
      );
    }
    
    const statusText = status === 'accepted' ? 'تم قبول طلبك في الشركة' : 'تم رفض طلبك في الشركة';
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, from_role, from_id) VALUES (?, ?, ?, ?, ?)',
      [app[0].user_id, statusText, statusText, 'company', payload.id]
    );
    
    return NextResponse.json({ message: 'تم تحديث الطلب' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
