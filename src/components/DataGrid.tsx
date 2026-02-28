import { useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  InfiniteRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  TextEditorModule,
  ValidationModule,
  themeQuartz,
  colorSchemeDark,
  type GridReadyEvent,
  type GridApi,
  type ColDef,
  type CellDoubleClickedEvent,
  type ColumnResizedEvent,
} from 'ag-grid-community';
import { toast } from 'sonner';
import { useAppState, useAppDispatch } from '@/context/AppContext';
import { createDuckDBDatasource } from '@/datasource/duckdbDatasource';
import { columnsToColDefs } from '@/utils/typeMapper';

ModuleRegistry.registerModules([
  InfiniteRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  TextEditorModule,
  ValidationModule,
]);

const darkTheme = themeQuartz.withPart(colorSchemeDark).withParams({
  backgroundColor: '#1a1a1a',
  headerBackgroundColor: '#242424',
  oddRowBackgroundColor: '#1f1f1f',
  rowHoverColor: '#2a2a2a',
  borderColor: 'rgba(255, 255, 255, 0.1)',
  headerTextColor: '#a3a3a3',
  foregroundColor: '#fafafa',
  fontSize: 13,
});

export function DataGrid() {
  const { metadata, duckdbReady, sqlResult, customSQL, globalFilter, showColumnFilters } =
    useAppState();
  const dispatch = useAppDispatch();
  const gridRef = useRef<GridApi>(null);
  const globalFilterRef = useRef(globalFilter);
  const userColWidths = useRef<Map<string, number>>(new Map());

  // Keep the ref in sync without triggering datasource recreation
  globalFilterRef.current = globalFilter;

  const schemaKey = useMemo(() => {
    const schema = sqlResult && customSQL ? sqlResult.columns : metadata?.schema ?? [];
    return schema.map((c) => c.name).join('\0');
  }, [metadata, sqlResult, customSQL]);

  const prevSchemaKey = useRef(schemaKey);
  useEffect(() => {
    if (prevSchemaKey.current !== schemaKey) {
      userColWidths.current = new Map();
      prevSchemaKey.current = schemaKey;
    }
  }, [schemaKey]);

  const columns: ColDef[] = useMemo(() => {
    const schema = sqlResult && customSQL ? sqlResult.columns : metadata?.schema ?? [];
    return columnsToColDefs(schema, showColumnFilters, userColWidths.current);
  }, [metadata, sqlResult, customSQL, showColumnFilters]);

  const columnNames = useMemo(
    () => columns.map((c) => c.field!).filter(Boolean),
    [columns],
  );

  const baseTable = useMemo(() => {
    if (customSQL) return `(${customSQL}) AS _subq`;
    return 'data';
  }, [customSQL]);

  const datasource = useMemo(() => {
    if (!duckdbReady || columns.length === 0) return undefined;
    return createDuckDBDatasource(baseTable, columnNames, () => globalFilterRef.current, (count) => {
      dispatch({ type: 'SET_GRID_ROW_COUNT', rowCount: count });
    });
  }, [duckdbReady, columns.length, baseTable, columnNames, dispatch]);

  // Set datasource on grid when it changes
  useEffect(() => {
    if (gridRef.current && datasource) {
      gridRef.current.setGridOption('datasource', datasource);
    }
  }, [datasource]);

  // Purge cache when globalFilter changes (datasource reads it via ref)
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.purgeInfiniteCache();
    }
  }, [globalFilter]);

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      if (datasource) {
        params.api.setGridOption('datasource', datasource);
      }
    },
    [datasource],
  );

  const onColumnResized = useCallback((event: ColumnResizedEvent) => {
    if (event.finished && event.source === 'uiColumnResized' && event.columns) {
      for (const col of event.columns) {
        const field = col.getColDef().field;
        if (field) {
          userColWidths.current.set(field, col.getActualWidth());
        }
      }
    }
  }, []);

  const onCellDoubleClicked = useCallback((event: CellDoubleClickedEvent) => {
    const value = event.value;
    const text = value === null || value === undefined ? '' : String(value);
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard', {
        description: text.length > 80 ? text.slice(0, 80) + '...' : text,
        duration: 2000,
      });
    });
  }, []);

  if (!duckdbReady || columns.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        {!duckdbReady ? 'Initializing query engine...' : 'No data loaded'}
      </div>
    );
  }

  return (
    <div className="flex-1 p-2">
      <AgGridReact
        theme={darkTheme}
        columnDefs={columns}
        rowModelType="infinite"
        cacheBlockSize={100}
        maxBlocksInCache={10}
        infiniteInitialRowCount={metadata?.rowCount ?? 1000}
        onGridReady={onGridReady}
        onCellDoubleClicked={onCellDoubleClicked}
        onColumnResized={onColumnResized}
        defaultColDef={{
          sortable: true,
          resizable: true,
          minWidth: 120,
        }}
      />
    </div>
  );
}
