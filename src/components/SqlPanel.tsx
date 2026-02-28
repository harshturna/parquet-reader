import { useState, useMemo, useCallback } from 'react';
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, Play, RotateCcw, History } from 'lucide-react';

const MAX_HISTORY = 20;

export function SqlPanel() {
  const { sqlResult, metadata } = useAppState();
  const dispatch = useAppDispatch();
  const [sqlText, setSqlText] = useState('SELECT * FROM data LIMIT 100');
  const [open, setOpen] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const schema = useMemo(() => {
    if (!metadata) return undefined;
    return { data: metadata.schema.map((c) => c.name) };
  }, [metadata]);

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

      setQueryHistory((prev) => {
        const trimmed = sqlText.trim();
        const filtered = prev.filter((q) => q !== trimmed);
        return [trimmed, ...filtered].slice(0, MAX_HISTORY);
      });
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

  const handleHistorySelect = useCallback((query: string) => {
    setSqlText(query);
    setHistoryOpen(false);
  }, []);

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
          <SqlEditor value={sqlText} onChange={setSqlText} onRun={handleRun} schema={schema} />

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
            {queryHistory.length > 0 && (
              <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-3.5 w-3.5" />
                    History
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px]">
                      {queryHistory.length}
                    </Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-0">
                  <ScrollArea className="max-h-60">
                    <div className="p-1">
                      {queryHistory.map((query, i) => (
                        <button
                          key={i}
                          onClick={() => handleHistorySelect(query)}
                          className="w-full rounded px-2 py-1.5 text-left text-xs font-mono text-foreground transition-colors hover:bg-accent/50"
                        >
                          <span className="line-clamp-2">{query}</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
            {error && (
              <span className="text-sm text-destructive">{error}</span>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
