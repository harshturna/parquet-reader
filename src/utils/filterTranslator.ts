import { escapeSQL, quoteCol } from './sql';

interface FilterItem {
  filterType: string;
  type: string;
  filter?: string | number;
  filterTo?: string | number;
  dateFrom?: string;
  dateTo?: string;
  values?: string[];
  condition1?: FilterItem;
  condition2?: FilterItem;
  operator?: string;
}

const VALID_OPERATORS = new Set(['AND', 'OR']);

function safeNumber(val: string | number | undefined): string {
  const n = Number(val);
  if (Number.isNaN(n)) return '0';
  return String(n);
}

function translateSingle(col: string, f: FilterItem): string {
  const c = quoteCol(col);
  const escaped = () => escapeSQL(String(f.filter ?? ''));

  switch (f.type) {
    case 'contains':
      return `${c} ILIKE '%${escaped()}%'`;
    case 'notContains':
      return `${c} NOT ILIKE '%${escaped()}%'`;
    case 'equals':
      if (f.filterType === 'number') return `${c} = ${safeNumber(f.filter)}`;
      return `${c} = '${escaped()}'`;
    case 'notEqual':
      if (f.filterType === 'number') return `${c} != ${safeNumber(f.filter)}`;
      return `${c} != '${escaped()}'`;
    case 'startsWith':
      return `${c} ILIKE '${escaped()}%'`;
    case 'endsWith':
      return `${c} ILIKE '%${escaped()}'`;
    case 'lessThan':
      return `${c} < ${safeNumber(f.filter)}`;
    case 'lessThanOrEqual':
      return `${c} <= ${safeNumber(f.filter)}`;
    case 'greaterThan':
      return `${c} > ${safeNumber(f.filter)}`;
    case 'greaterThanOrEqual':
      return `${c} >= ${safeNumber(f.filter)}`;
    case 'inRange':
      if (f.filterType === 'date') {
        return `${c} >= '${escapeSQL(String(f.dateFrom ?? ''))}' AND ${c} <= '${escapeSQL(String(f.dateTo ?? ''))}'`;
      }
      return `${c} >= ${safeNumber(f.filter)} AND ${c} <= ${safeNumber(f.filterTo)}`;
    case 'blank':
      return `${c} IS NULL`;
    case 'notBlank':
      return `${c} IS NOT NULL`;
    default:
      if (f.filter !== undefined && f.filter !== '') {
        return `${c} ILIKE '%${escaped()}%'`;
      }
      return '';
  }
}

export function filterModelToSQL(
  filterModel: Record<string, FilterItem>,
): string {
  const clauses: string[] = [];

  for (const [col, filter] of Object.entries(filterModel)) {
    if (filter.condition1 && filter.condition2 && filter.operator) {
      const op = filter.operator.toUpperCase();
      if (!VALID_OPERATORS.has(op)) continue;
      const c1 = translateSingle(col, filter.condition1);
      const c2 = translateSingle(col, filter.condition2);
      if (c1 && c2) {
        clauses.push(`(${c1} ${op} ${c2})`);
      }
    } else {
      const clause = translateSingle(col, filter);
      if (clause) clauses.push(clause);
    }
  }

  return clauses.length > 0 ? clauses.join(' AND ') : '';
}

export function globalFilterToSQL(
  columns: string[],
  search: string,
): string {
  if (!search.trim()) return '';
  const escaped = escapeSQL(search.trim());
  const clauses = columns.map(
    (col) => `CAST(${quoteCol(col)} AS VARCHAR) ILIKE '%${escaped}%'`,
  );
  return `(${clauses.join(' OR ')})`;
}
