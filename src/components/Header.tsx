import { useAppState } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { fileName, status } = useAppState();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
      <div className="flex items-center gap-3">
        <h1 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
            <rect width="32" height="32" rx="4" fill="#1a1a1a" />
            <rect x="4" y="4" width="10" height="6" rx="1" fill="#4ade80" />
            <rect x="18" y="4" width="10" height="6" rx="1" fill="#4ade80" />
            <rect x="4" y="13" width="10" height="6" rx="1" fill="#38bdf8" />
            <rect x="18" y="13" width="10" height="6" rx="1" fill="#38bdf8" />
            <rect x="4" y="22" width="10" height="6" rx="1" fill="#38bdf8" />
            <rect x="18" y="22" width="10" height="6" rx="1" fill="#38bdf8" />
          </svg>
          Parquet Reader
        </h1>
        {fileName && (
          <Badge variant="secondary">{fileName}</Badge>
        )}
        {status === 'loading-duckdb' && (
          <Badge variant="outline" className="text-amber-400 border-amber-400/30">
            Loading engine...
          </Badge>
        )}
      </div>
    </header>
  );
}
