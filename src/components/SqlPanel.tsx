import { useState, useCallback } from 'react';
import { useAppState, useAppDispatch } from '@/context/AppContext';
import { executeSQL } from '@/services/duckdb';
import { formatNumber } from '@/utils/formatNumber';
import { SqlEditor } from './SqlEditor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight, Play, RotateCcw } from 'lucide-react';

export function SqlPanel() {
  const { sqlResult } = useAppState();
  const dispatch = useAppDispatch();
  const [sqlText, setSqlText] = useState('SELECT * FROM data LIMIT 100');
  const [open, setOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    if (!sqlText.trim()) return;
    setRunning(true);
    setError(null);

    try {
      const result = await executeSQL(sqlText);
      dispatch({
        type: 'SET_SQL_RESULT',
        result: {
          columns: result.columns,
          rows: result.rows,
          rowCount: result.rowCount,
          elapsed: result.elapsed,
        },
      });
      dispatch({ type: 'SET_CUSTOM_SQL', sql: sqlText });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      dispatch({ type: 'SET_SQL_RESULT', result: null });
    } finally {
      setRunning(false);
    }
  }, [sqlText, dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'SET_CUSTOM_SQL', sql: null });
    dispatch({ type: 'SET_SQL_RESULT', result: null });
    setError(null);
    setSqlText('SELECT * FROM data LIMIT 100');
  }, [dispatch]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border bg-card">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-foreground hover:bg-accent/50 transition-colors">
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
        SQL Editor
        {sqlResult && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {sqlResult.elapsed}ms · {formatNumber(sqlResult.rowCount)} rows
          </Badge>
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-3 space-y-2">
          <SqlEditor value={sqlText} onChange={setSqlText} onRun={handleRun} />

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleRun} disabled={running}>
              <Play className="h-3.5 w-3.5" />
              {running ? 'Running...' : 'Run'}
              <kbd className="ml-1 text-[10px] opacity-60">&#8984;&#9166;</kbd>
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            {error && (
              <span className="text-sm text-destructive">{error}</span>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
