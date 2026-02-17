import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const wilaya = searchParams.get('wilaya') || '';

        let query = `
      SELECT i.id, i.name, i.location, i.wilaya, i.description, i.image,
             IFNULL(
               JSON_ARRAYAGG(
                 JSON_OBJECT('id', s.id, 'name', s.name, 'spots', isp.available_spots)
               ),
               '[]'
             ) as specialties
      FROM institutes i
      LEFT JOIN institute_specializations isp ON i.id = isp.institute_id
      LEFT JOIN specializations s ON isp.specialization_id = s.id
      WHERE 1=1
    `;

        const params: any[] = [];

        if (search) {
            query += ' AND (i.name LIKE ? OR s.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (wilaya) {
            query += ' AND i.wilaya = ?';
            params.push(wilaya);
        }

        query += ' GROUP BY i.id ORDER BY i.created_at DESC';

        const [rows] = await pool.query(query, params);

        // Parse JSON string if MySQL returns it as string (depends on driver version/config)
        const formattedRows = (rows as any[]).map(row => ({
            ...row,
            specialties: typeof row.specialties === 'string' ? JSON.parse(row.specialties) : row.specialties
        }));

        return NextResponse.json({ institutes: formattedRows });
    } catch (error: any) {
        console.error('Error fetching institutes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
