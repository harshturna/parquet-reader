import { useCallback } from 'react';
import { useAppDispatch } from '../context/AppContext';
import { extractMetadata } from '../services/hyparquet';
import { initDuckDB } from '../services/duckdb';
import { registerFile } from '../services/duckdb';

export function useParquetFile() {
  const dispatch = useAppDispatch();

  const loadFile = useCallback(
    async (file: File) => {
      dispatch({ type: 'SET_FILE', file });

      try {
        const metadata = await extractMetadata(file);
        dispatch({ type: 'SET_METADATA', metadata });
        dispatch({ type: 'SET_STATUS', status: 'loading-duckdb' });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          error: `Failed to read parquet metadata: ${err instanceof Error ? err.message : String(err)}`,
        });
        return;
      }

      try {
        // initDuckDB is a singleton — returns existing instance if already booted
        await initDuckDB();
        await registerFile(file);
        dispatch({ type: 'SET_DUCKDB_READY' });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          error: `Failed to register file with DuckDB: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    },
    [dispatch],
  );

  return { loadFile };
}
