import type { ColDef } from 'ag-grid-community';
import type { ColumnSchema } from '../types';

const CHAR_WIDTH = 8;
const HEADER_PADDING = 32;
const MIN_COL_WIDTH = 120;
const MAX_COL_WIDTH = 300;

function calculateColumnWidth(headerName: string): number {
  const textWidth = headerName.length * CHAR_WIDTH + HEADER_PADDING;
  return Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, textWidth));
}

function agFilter(duckdbType: string): string | false {
  const t = duckdbType.toUpperCase();

  // Numeric types
  if (
    t.includes('INT') ||
    t.includes('FLOAT') ||
    t.includes('DOUBLE') ||
    t.includes('DECIMAL') ||
    t.includes('NUMERIC') ||
    t.includes('REAL')
  ) {
    return 'agNumberColumnFilter';
  }

  // Date/time types
  if (t.includes('DATE') || t.includes('TIMESTAMP')) {
    return 'agDateColumnFilter';
  }

  // Boolean — no filter makes sense, show as text
  if (t === 'BOOLEAN' || t === 'BOOL') {
    return 'agTextColumnFilter';
  }

  // Complex/binary types — disable filtering
  if (
    t.includes('BLOB') ||
    t.includes('STRUCT') ||
    t.includes('LIST') ||
    t.includes('MAP')
  ) {
    return false;
  }

  // VARCHAR, TEXT, TIME, INTERVAL, JSON, ENUM, UUID, and anything else
  return 'agTextColumnFilter';
}

export function columnsToColDefs(
  columns: ColumnSchema[],
  showFilters: boolean,
  userWidths?: Map<string, number>,
): ColDef[] {
  return columns.map((col) => ({
    field: col.name,
    headerName: col.name,
    filter: showFilters ? agFilter(col.type) : false,
    floatingFilter: showFilters,
    sortable: true,
    resizable: true,
    minWidth: MIN_COL_WIDTH,
    width: userWidths?.get(col.name) ?? calculateColumnWidth(col.name),
  }));
}
