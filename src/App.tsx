import { useAppState } from '@/context/AppContext';
import { useDuckDB } from '@/hooks/useDuckDB';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { DropZone } from '@/components/DropZone';
import { SchemaPanel } from '@/components/SchemaPanel';
import { DataGrid } from '@/components/DataGrid';
import { GridToolbar } from '@/components/GridToolbar';
import { SqlPanel } from '@/components/SqlPanel';

export default function App() {
  const { status, error } = useAppState();
  useDuckDB();

  const showWorkspace = status === 'ready' || status === 'loading-duckdb';

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {error && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <main className="flex flex-1 overflow-hidden">
        {!showWorkspace ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="h-64 w-full max-w-lg">
              <DropZone />
            </div>
          </div>
        ) : (
          <>
            <SchemaPanel />
            <div className="flex flex-1 flex-col overflow-hidden">
              <GridToolbar />
              <DataGrid />
              <SqlPanel />
            </div>
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}
