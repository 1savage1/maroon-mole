import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const wilaya = searchParams.get('wilaya') || '';
    let query = `SELECT i.*, GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as specializations 
                 FROM institutes i 
                 LEFT JOIN institute_specializations isp ON i.id = isp.institute_id 
                 LEFT JOIN specializations s ON isp.specialization_id = s.id 
                 WHERE 1=1`;
    const params: any[] = [];
    if (search) {
      query += ' AND (i.name LIKE ? OR i.location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (wilaya) {
      query += ' AND i.wilaya = ?';
      params.push(wilaya);
    }
    query += ' GROUP BY i.id ORDER BY i.name';
    const [rows] = await pool.query(query, params);
    return NextResponse.json({ institutes: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
