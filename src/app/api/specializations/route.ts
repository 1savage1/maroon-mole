import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    let query = `SELECT s.*, COUNT(DISTINCT isp.institute_id) as institute_count 
                 FROM specializations s 
                 LEFT JOIN institute_specializations isp ON s.id = isp.specialization_id 
                 WHERE 1=1`;
    const params: any[] = [];
    if (search) {
      query += ' AND s.name LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' GROUP BY s.id ORDER BY s.name';
    const [rows] = await pool.query(query, params);
    return NextResponse.json({ specializations: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
