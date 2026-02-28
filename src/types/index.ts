export interface ColumnSchema {
  name: string;
  type: string;
}

export interface RowGroupColumnDetail {
  path: string;
  codec: string;
  compressedSize: number;
  uncompressedSize: number;
}

export interface RowGroupDetail {
  numRows: number;
  compressedSize: number;
  uncompressedSize: number;
  columns: RowGroupColumnDetail[];
}

export interface ParquetMetadata {
  schema: ColumnSchema[];
  rowCount: number;
  version: number;
  createdBy: string | null;
  numRowGroups: number;
  rowGroupDetails: RowGroupDetail[];
  keyValueMetadata: { key: string; value: string }[];
  totalCompressedSize: number;
  totalUncompressedSize: number;
}

export interface SqlResult {
  columns: ColumnSchema[];
  rows: Record<string, unknown>[];
  rowCount: number;
  elapsed: number;
  error?: string;
}

export type AppStatus = 'idle' | 'loading-metadata' | 'loading-duckdb' | 'ready' | 'error';

export interface AppState {
  file: File | null;
  fileName: string;
  metadata: ParquetMetadata | null;
  status: AppStatus;
  error: string | null;
  duckdbReady: boolean;
  customSQL: string | null;
  sqlResult: SqlResult | null;
  globalFilter: string;
  showColumnFilters: boolean;
  showStructuredView: boolean;
  gridDisplayedRowCount: number | null;
}

export type AppAction =
  | { type: 'SET_FILE'; file: File }
  | { type: 'SET_METADATA'; metadata: ParquetMetadata }
  | { type: 'SET_STATUS'; status: AppStatus }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_DUCKDB_READY' }
  | { type: 'SET_CUSTOM_SQL'; sql: string | null }
  | { type: 'SET_SQL_RESULT'; result: SqlResult | null }
  | { type: 'SET_GLOBAL_FILTER'; filter: string }
  | { type: 'TOGGLE_COLUMN_FILTERS' }
  | { type: 'TOGGLE_STRUCTURED_VIEW' }
  | { type: 'SET_GRID_ROW_COUNT'; rowCount: number }
  | { type: 'RESET' };
