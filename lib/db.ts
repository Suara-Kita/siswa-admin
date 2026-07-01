import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export async function query(text: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
  if (params && params.length > 0) {
    return sql.unsafe(text, params as never[]) as Promise<Record<string, unknown>[]>;
  }
  return sql.unsafe(text) as Promise<Record<string, unknown>[]>;
}

export default sql;
