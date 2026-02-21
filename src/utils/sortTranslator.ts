import { quoteCol } from './sql';

interface SortItem {
  colId: string;
  sort: 'asc' | 'desc';
}

export function sortModelToSQL(sortModel: SortItem[]): string {
  if (!sortModel.length) return '';
  const clauses = sortModel.map(
    (s) => `${quoteCol(s.colId)} ${s.sort.toUpperCase()}`,
  );
  return clauses.join(', ');
}
