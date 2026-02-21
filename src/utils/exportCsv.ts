import { executeSQL } from '../services/duckdb';

export async function exportCSV(
  baseQuery: string,
  where: string,
  orderBy: string,
): Promise<void> {
  let sql = baseQuery;
  if (where) sql += ` WHERE ${where}`;
  if (orderBy) sql += ` ORDER BY ${orderBy}`;

  const result = await executeSQL(sql);

  if (result.rows.length === 0) return;

  const cols = result.columns.map((c) => c.name);
  const header = cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');

  const lines = result.rows.map((row) =>
    cols
      .map((c) => {
        const val = row[c];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(','),
  );

  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
