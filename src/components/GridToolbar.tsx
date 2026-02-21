import { useAppState, useAppDispatch } from '@/context/AppContext';
import { exportCSV } from '@/utils/exportCsv';
import { formatNumber } from '@/utils/formatNumber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FilePlus, Filter, Search } from 'lucide-react';

export function GridToolbar() {
  const { globalFilter, customSQL, metadata, showColumnFilters } = useAppState();
  const dispatch = useAppDispatch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_GLOBAL_FILTER', filter: e.target.value });
  };

  const handleExport = () => {
    const base = customSQL ? `SELECT * FROM (${customSQL}) AS _subq` : 'SELECT * FROM data';
    exportCSV(base, '', '');
  };

  const handleLoadNew = () => {
    dispatch({ type: 'RESET' });
  };

  const handleToggleFilters = () => {
    dispatch({ type: 'TOGGLE_COLUMN_FILTERS' });
  };

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>
      {metadata && (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatNumber(metadata.rowCount)} rows · {formatNumber(metadata.schema.length)} columns
        </span>
      )}
      <Button
        variant={showColumnFilters ? 'secondary' : 'outline'}
        size="sm"
        onClick={handleToggleFilters}
        title="Toggle column filters"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleLoadNew}>
        <FilePlus className="h-4 w-4" />
        New File
      </Button>
    </div>
  );
}
