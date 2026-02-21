/** Escape a value for inclusion inside a SQL single-quoted string. */
export function escapeSQL(val: string): string {
  return val.replace(/'/g, "''");
}

/** Quote a column/table identifier with double quotes, escaping embedded quotes. */
export function quoteCol(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
