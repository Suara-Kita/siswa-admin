import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const nama = searchParams.get('nama');
  const alamat = searchParams.get('alamat');
  const ipta = searchParams.get('ipta');
  const daerahMengundi = searchParams.get('daerah_mengundi');
  const lokaliti = searchParams.get('lokaliti');
  const parlimen = searchParams.get('parlimen');
  const dun = searchParams.get('dun');
  const universitiOnly = searchParams.get('universiti_only') === 'true';
  const sort = searchParams.get('sort') || 'age_asc';

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (nama) {
    conditions.push(`nama ILIKE $${idx++}`);
    params.push(`%${nama}%`);
  }
  if (alamat) {
    conditions.push(`alamat ILIKE $${idx++}`);
    params.push(`%${alamat}%`);
  }
  if (ipta) {
    conditions.push(`ipta ILIKE $${idx++}`);
    params.push(`%${ipta}%`);
  }
  if (daerahMengundi) {
    conditions.push(`daerah_mengundi = $${idx++}`);
    params.push(daerahMengundi);
  }
  if (lokaliti) {
    conditions.push(`lokaliti ILIKE $${idx++}`);
    params.push(`%${lokaliti}%`);
  }
  if (parlimen) {
    conditions.push(`parlimen ILIKE $${idx++}`);
    params.push(`%${parlimen}%`);
  }
  if (dun) {
    conditions.push(`dun = $${idx++}`);
    params.push(dun);
  }
  if (universitiOnly) {
    conditions.push(`ipta ILIKE 'Universiti%'`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortMap: Record<string, string> = {
    age_asc: 'age ASC, nama ASC',
    age_desc: 'age DESC, nama ASC',
    nama_asc: 'nama ASC',
    nama_desc: 'nama DESC',
    created_at_desc: 'created_at DESC',
    created_at_asc: 'created_at ASC',
  };
  const orderBy = sortMap[sort] || 'age ASC, nama ASC';

  const sql = `
    SELECT
      id, nama, alamat, ipta, email,
      no_tel, alt_number,
      daerah_mengundi, lokaliti, parlimen, dun,
      source_document, created_at,
      (EXTRACT(YEAR FROM NOW()) - (CASE WHEN LEFT(ic, 2)::int < 50 THEN 2000 + LEFT(ic, 2)::int ELSE 1900 + LEFT(ic, 2)::int END))::int AS age
    FROM siswa_app
    ${where}
    ORDER BY ${orderBy}
  `;

  try {
    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Query error:', err);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
