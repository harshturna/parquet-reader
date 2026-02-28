import type { ColDef } from 'ag-grid-community';
import type { ColumnSchema } from '../types';
import { isComplexType, getComplexTypeKind } from './complexTypes';

const CHAR_WIDTH = 8;
const HEADER_PADDING = 32;
const MIN_COL_WIDTH = 120;
const MAX_COL_WIDTH = 400;

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
    t.includes('MAP') ||
    t === 'JSON'
  ) {
    return false;
  }

  // VARCHAR, TEXT, TIME, INTERVAL, JSON, ENUM, UUID, and anything else
  return 'agTextColumnFilter';
}

export function computeContentWidths(
  columns: ColumnSchema[],
  sampleRows: Record<string, unknown>[],
): Map<string, number> {
  const widths = new Map<string, number>();
  for (const col of columns) {
    let maxLen = col.name.length;
    for (const row of sampleRows) {
      const val = row[col.name];
      if (val === null || val === undefined) continue;
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (str.length > maxLen) maxLen = str.length;
    }
    const computed = maxLen * CHAR_WIDTH + HEADER_PADDING;
    widths.set(col.name, Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, computed)));
  }
  return widths;
}

export function columnsToColDefs(
  columns: ColumnSchema[],
  showFilters: boolean,
  contentWidths?: Map<string, number>,
  userWidths?: Map<string, number>,
): ColDef[] {
  return columns.map((col) => {
    const def: ColDef = {
      field: col.name,
      headerName: col.name,
      filter: showFilters ? agFilter(col.type) : false,
      floatingFilter: showFilters,
      sortable: true,
      resizable: true,
      minWidth: MIN_COL_WIDTH,
      width: userWidths?.get(col.name)
        ?? contentWidths?.get(col.name)
        ?? calculateColumnWidth(col.name),
    };

    if (isComplexType(col.type)) {
      def.cellRendererParams = {
        columnType: col.type,
        complexKind: getComplexTypeKind(col.type),
        isComplex: true,
      };
    }

    return def;
  });
}
