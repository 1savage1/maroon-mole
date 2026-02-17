import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';

// GET: Fetch specialties linked to the authenticated institute
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'institute') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    // Get institute ID
    const [inst] = await pool.query('SELECT id FROM institutes WHERE user_id = ?', [payload.id]) as any[];
    if (inst.length === 0) return NextResponse.json({ error: 'Institute profile not found' }, { status: 404 });

    const [rows] = await pool.query(
      `SELECT s.id, s.name, isp.available_spots 
       FROM specializations s
       JOIN institute_specializations isp ON s.id = isp.specialization_id
       WHERE isp.institute_id = ?`,
      [inst[0].id]
    );

    return NextResponse.json({ specialties: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Link a specialization to the institute
export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'institute') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { specialization_name, available_spots } = await req.json();
    if (!specialization_name) return NextResponse.json({ error: 'اسم التخصص مطلوب' }, { status: 400 });

    // Get institute ID
    const [inst] = await pool.query('SELECT id FROM institutes WHERE user_id = ?', [payload.id]) as any[];
    if (inst.length === 0) return NextResponse.json({ error: 'Institute profile not found' }, { status: 404 });

    // 1. Resolve specialization_id from name
    let specId: number;
    const [existingSpec] = await pool.query('SELECT id FROM specializations WHERE name = ?', [specialization_name]) as any[];

    if (existingSpec.length > 0) {
      specId = existingSpec[0].id;
    } else {
      // Create new specialization
      const [result] = await pool.query('INSERT INTO specializations (name) VALUES (?)', [specialization_name]) as any[];
      specId = result.insertId;
    }

    // 2. Check if already linked
    const [existingLink] = await pool.query(
      'SELECT id FROM institute_specializations WHERE institute_id = ? AND specialization_id = ?',
      [inst[0].id, specId]
    ) as any[];

    if (existingLink.length > 0) {
      return NextResponse.json({ error: 'التخصص مضاف بالفعل' }, { status: 400 });
    }

    // 3. Link specialization to institute
    await pool.query(
      'INSERT INTO institute_specializations (institute_id, specialization_id, available_spots) VALUES (?, ?, ?)',
      [inst[0].id, specId, available_spots || 20]
    );

    return NextResponse.json({ message: 'تم إضافة التخصص بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// DELETE: Remove a specialization link
export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'institute') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { specialization_id } = await req.json();

    // Get institute ID
    const [inst] = await pool.query('SELECT id FROM institutes WHERE user_id = ?', [payload.id]) as any[];
    if (inst.length === 0) return NextResponse.json({ error: 'Institute profile not found' }, { status: 404 });

    await pool.query(
      'DELETE FROM institute_specializations WHERE institute_id = ? AND specialization_id = ?',
      [inst[0].id, specialization_id]
    );

    return NextResponse.json({ message: 'تم حذف التخصص بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
