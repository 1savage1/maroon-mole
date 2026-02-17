import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get('institute_id');
    const specId = searchParams.get('specialization_id');
    let query = `SELECT a.*, i.name as institute_name, s.name as specialization_name 
                 FROM announcements a 
                 JOIN institutes i ON a.institute_id = i.id 
                 LEFT JOIN specializations s ON a.specialization_id = s.id WHERE 1=1`;
    const params: any[] = [];
    if (instituteId) { query += ' AND a.institute_id = ?'; params.push(instituteId); }
    if (specId) { query += ' AND (a.specialization_id = ? OR a.specialization_id IS NULL)'; params.push(specId); }
    query += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.query(query, params);
    return NextResponse.json({ announcements: rows });
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
    const { title, content, specialization_id } = await req.json();
    const [inst] = await pool.query('SELECT id FROM institutes WHERE user_id = ?', [payload.id]) as any[];
    if (inst.length === 0) return NextResponse.json({ error: 'معهد غير موجود' }, { status: 404 });
    await pool.query(
      'INSERT INTO announcements (institute_id, specialization_id, title, content) VALUES (?, ?, ?, ?)',
      [inst[0].id, specialization_id || null, title, content]
    );
    // Send notifications to apprentices
    const [apprentices] = await pool.query(
      `SELECT user_id FROM apprentice_assignments WHERE institute_id = ? AND status = 'active'${specialization_id ? ' AND specialization_id = ?' : ''}`,
      specialization_id ? [inst[0].id, specialization_id] : [inst[0].id]
    ) as any[];
    for (const a of apprentices) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, from_role, from_id) VALUES (?, ?, ?, ?, ?)',
        [a.user_id, title, content, 'institute', payload.id]
      );
    }
    return NextResponse.json({ message: 'تم نشر الإعلان' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
