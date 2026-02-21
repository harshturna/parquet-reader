import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../context/AppContext';
import { initDuckDB } from '../services/duckdb';

export function useDuckDB() {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initDuckDB()
      .then(() => {
        dispatch({ type: 'SET_DUCKDB_READY' });
      })
      .catch((err) => {
        dispatch({ type: 'SET_ERROR', error: `DuckDB init failed: ${err.message}` });
      });
  }, [dispatch]);
}
