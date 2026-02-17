import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const specId = searchParams.get('specialization_id');
    let query = `SELECT c.*, GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as specializations
                 FROM companies c
                 LEFT JOIN company_specializations cs ON c.id = cs.company_id
                 LEFT JOIN specializations s ON cs.specialization_id = s.id
                 WHERE 1=1`;
    const params: any[] = [];
    if (search) { query += ' AND c.name LIKE ?'; params.push(`%${search}%`); }
    if (specId) { query += ' AND cs.specialization_id = ?'; params.push(specId); }
    query += ' GROUP BY c.id ORDER BY c.name';
    const [rows] = await pool.query(query, params);
    return NextResponse.json({ companies: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
